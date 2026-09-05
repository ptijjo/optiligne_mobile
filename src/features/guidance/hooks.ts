import { startGuidanceSession } from '@/features/guidance/api';
import { startGuidanceGps, type GpsFix } from '@/features/guidance/location';
import { speakAlert, stopSpeech } from '@/features/guidance/speech';
import {
  nextVoiceAlert,
  shouldSpeak,
  type VoiceAlertMemory,
} from '@/features/guidance/voice-alerts';
import { connectGuidanceWs, type GuidanceMessage, type GuidanceSocket } from '@/ws';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

export function useStartGuidance() {
  return useMutation({
    mutationFn: ({ tripId, date }: { tripId: string; date: string }) =>
      startGuidanceSession(tripId, date),
  });
}

export function useGuidanceLive(tripId: string | undefined, date: string | undefined) {
  const start = useStartGuidance();
  const { mutate } = start;
  const [guidance, setGuidance] = useState<GuidanceMessage | null>(null);
  const [gps, setGps] = useState<GpsFix | null>(null);
  const [gpsError, setGpsError] = useState('');
  const socketRef = useRef<GuidanceSocket | null>(null);
  const voiceMemoryRef = useRef<VoiceAlertMemory>({ lastSpokenAt: 0 });

  useEffect(() => {
    if (!tripId || !date) {
      return;
    }
    // 1. Créer la session HTTP.
    mutate({ tripId, date });
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [tripId, date, mutate]);

  useEffect(() => {
    const sessionId = start.data?.sessionId;
    if (!sessionId) {
      return;
    }
    // 2. Upgrade WS sans token.
    socketRef.current?.close();
    voiceMemoryRef.current = { lastSpokenAt: 0 };
    socketRef.current = connectGuidanceWs(sessionId, {
      onGuidance: (msg) => {
        setGuidance(msg);
        // 4. Alertes vocales critiques (anti-spam) — source WS uniquement.
        const result = nextVoiceAlert({
          state: msg.state,
          delayS: msg.delay_s,
          now: Date.now(),
          memory: voiceMemoryRef.current,
        });
        if (result) {
          voiceMemoryRef.current = result.memory;
          if (shouldSpeak(result)) {
            speakAlert(result.text);
          }
        }
      },
    });

    // 3. GPS → messages position.
    let stopGps = () => undefined;
    let cancelled = false;
    void (async () => {
      const watch = await startGuidanceGps((fix) => {
        setGps(fix);
        setGpsError('');
        socketRef.current?.sendPosition({
          lat: fix.lat,
          lon: fix.lon,
          ts: fix.ts,
          heading: fix.heading,
        });
      });
      if (cancelled) {
        watch.stop();
        return;
      }
      stopGps = watch.stop;
      if (!watch.granted) {
        setGpsError('Localisation refusée. Autorisez le GPS pour le guidage.');
      }
    })();

    return () => {
      cancelled = true;
      stopGps();
      stopSpeech();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [start.data?.sessionId]);

  useEffect(() => {
    if (!start.data?.sessionId || gps || gpsError) {
      return;
    }
    const timer = setTimeout(() => {
      setGpsError((current) =>
        current ||
        'Pas de position GPS. Sur l’émulateur : … → Location → définir un point près du tracé.',
      );
    }, 5000);
    return () => clearTimeout(timer);
  }, [start.data?.sessionId, gps, gpsError]);

  return { start, guidance, gps, gpsError };
}
