import {
  nextVoiceAlert,
  scheduleBucket,
  shouldSpeak,
  VOICE_THROTTLE_MS,
  type VoiceAlertMemory,
} from '@/features/guidance/voice-alerts';

describe('scheduleBucket', () => {
  it('classe delay_s avec seuil 2 min', () => {
    expect(scheduleBucket(0)).toBe('on_time');
    expect(scheduleBucket(119)).toBe('on_time');
    expect(scheduleBucket(120)).toBe('late');
    expect(scheduleBucket(-120)).toBe('early');
  });
});

describe('nextVoiceAlert', () => {
  const empty: VoiceAlertMemory = { lastSpokenAt: 0 };

  it('annonce l’entrée hors tracé', () => {
    const got = nextVoiceAlert({
      state: 'off_route',
      delayS: 0,
      now: 1_000,
      memory: empty,
    });
    expect(shouldSpeak(got)).toBe(true);
    expect(got?.text).toBe('Attention, hors tracé.');
  });

  it('ne répète pas off_route tant qu’on y reste', () => {
    const first = nextVoiceAlert({
      state: 'off_route',
      delayS: 0,
      now: 1_000,
      memory: empty,
    });
    const second = nextVoiceAlert({
      state: 'off_route',
      delayS: 0,
      now: 2_000,
      memory: first!.memory,
    });
    expect(shouldSpeak(second)).toBe(false);
  });

  it('throttle off_route sous 45 s même après sortie/reentrée', () => {
    const first = nextVoiceAlert({
      state: 'off_route',
      delayS: 0,
      now: 1_000,
      memory: empty,
    });
    const back = nextVoiceAlert({
      state: 'on_route',
      delayS: 0,
      now: 1_500,
      memory: first!.memory,
    });
    const again = nextVoiceAlert({
      state: 'off_route',
      delayS: 0,
      now: 1_000 + VOICE_THROTTLE_MS - 1,
      memory: back!.memory,
    });
    expect(shouldSpeak(again)).toBe(false);
  });

  it('annonce le passage en avance ≥ 2 min', () => {
    const primed = nextVoiceAlert({
      state: 'on_route',
      delayS: 0,
      now: 1_000,
      memory: empty,
    });
    const got = nextVoiceAlert({
      state: 'on_route',
      delayS: -180,
      now: 2_000,
      memory: primed!.memory,
    });
    expect(got?.text).toBe('En avance 3 minutes. Lever le pied.');
  });

  it('annonce le retour à l’heure depuis un écart', () => {
    const early = nextVoiceAlert({
      state: 'on_route',
      delayS: -180,
      now: 1_000,
      memory: { lastSpokenAt: 0, lastScheduleBucket: 'early' },
    });
    const got = nextVoiceAlert({
      state: 'on_route',
      delayS: 10,
      now: 1_000 + VOICE_THROTTLE_MS + 1,
      memory: early!.memory,
    });
    expect(got?.text).toBe('À l’heure.');
  });

  it('ne parle pas à chaque tick GPS / même seau', () => {
    const primed = nextVoiceAlert({
      state: 'on_route',
      delayS: -180,
      now: 1_000,
      memory: empty,
    });
    const tick = nextVoiceAlert({
      state: 'on_route',
      delayS: -190,
      now: 2_000,
      memory: primed!.memory,
    });
    expect(shouldSpeak(tick)).toBe(false);
  });
});
