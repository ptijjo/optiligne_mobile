import type { GuidanceState } from '@/features/guidance/types';

export const VOICE_THROTTLE_MS = 45_000;
/** Écart horaire min pour une alerte vocale (secondes). */
export const VOICE_DELAY_THRESHOLD_S = 120;

export type VoiceAlertKind = 'off_route' | 'schedule';

export type VoiceAlertMemory = {
  lastKind?: VoiceAlertKind;
  lastSpokenAt: number;
  lastState?: GuidanceState;
  lastScheduleBucket?: ScheduleBucket;
};

export type ScheduleBucket = 'on_time' | 'early' | 'late';

export type VoiceAlertInput = {
  state: GuidanceState;
  delayS: number;
  now: number;
  memory: VoiceAlertMemory;
};

export type VoiceAlertResult = {
  text: string;
  kind: VoiceAlertKind;
  memory: VoiceAlertMemory;
};

export function scheduleBucket(delayS: number): ScheduleBucket {
  if (!Number.isFinite(delayS) || Math.abs(delayS) < VOICE_DELAY_THRESHOLD_S) {
    return 'on_time';
  }
  return delayS > 0 ? 'late' : 'early';
}

function schedulePhrase(delayS: number, bucket: ScheduleBucket): string {
  if (bucket === 'on_time') {
    return 'À l’heure.';
  }
  const minutes = Math.max(1, Math.round(Math.abs(delayS) / 60));
  if (bucket === 'late') {
    return `Retard de ${minutes} minutes.`;
  }
  return `En avance ${minutes} minutes. Lever le pied.`;
}

function throttled(memory: VoiceAlertMemory, kind: VoiceAlertKind, now: number): boolean {
  if (memory.lastKind !== kind) {
    return false;
  }
  return now - memory.lastSpokenAt < VOICE_THROTTLE_MS;
}

/** Décide s’il faut parler. Pure : pas d’I/O. */
export function nextVoiceAlert(input: VoiceAlertInput): VoiceAlertResult | null {
  const { state, delayS, now, memory } = input;

  // 1. Déviation : uniquement à l’entrée dans off_route.
  if (state === 'off_route' && memory.lastState !== 'off_route') {
    if (!throttled(memory, 'off_route', now)) {
      return {
        text: 'Attention, hors tracé.',
        kind: 'off_route',
        memory: {
          ...memory,
          lastKind: 'off_route',
          lastSpokenAt: now,
          lastState: state,
          lastScheduleBucket: memory.lastScheduleBucket,
        },
      };
    }
  }

  // 2. Écart horaire : seulement si le « seau » change (et hors off_route pour ne pas empiler).
  if (state !== 'off_route') {
    const bucket = scheduleBucket(delayS);
    const prev = memory.lastScheduleBucket;
    if (prev !== undefined && bucket !== prev) {
      const meaningful =
        bucket !== 'on_time' || prev === 'early' || prev === 'late';
      if (meaningful && !throttled(memory, 'schedule', now)) {
        return {
          text: schedulePhrase(delayS, bucket),
          kind: 'schedule',
          memory: {
            ...memory,
            lastKind: 'schedule',
            lastSpokenAt: now,
            lastState: state,
            lastScheduleBucket: bucket,
          },
        };
      }
    }
    return {
      text: '',
      kind: 'schedule',
      memory: {
        ...memory,
        lastState: state,
        lastScheduleBucket: bucket,
      },
    };
  }

  return {
    text: '',
    kind: 'off_route',
    memory: { ...memory, lastState: state },
  };
}

/** Applique le résultat : si `text` vide, mémoire mise à jour sans parole. */
export function shouldSpeak(result: VoiceAlertResult | null): result is VoiceAlertResult & { text: string } {
  return Boolean(result && result.text.length > 0);
}
