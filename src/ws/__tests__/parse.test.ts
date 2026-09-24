import { parseGuidanceMessage, isValidPosition } from '@/ws/parse';

describe('contrat WS guidance', () => {
  it('parse un message guidance sans token', () => {
    const raw = JSON.stringify({
      type: 'guidance',
      frac: 0.42,
      offset_m: 12.5,
      next_stop: 'CREHANGE',
      delay_s: -90,
      state: 'on_route',
      extra: 'ignoré',
    });
    expect(parseGuidanceMessage(raw)).toEqual({
      type: 'guidance',
      frac: 0.42,
      offset_m: 12.5,
      next_stop: 'CREHANGE',
      delay_s: -90,
      travel_s: 0,
      state: 'on_route',
    });
  });

  it('parse travel_s ETA trajet', () => {
    const raw = JSON.stringify({
      type: 'guidance',
      frac: 0,
      offset_m: 200,
      next_stop: 'Forbach',
      delay_s: 300,
      travel_s: 720,
      state: 'off_route',
    });
    expect(parseGuidanceMessage(raw)).toMatchObject({ travel_s: 720, delay_s: 300 });
  });

  it('payload invalide → null, pas de throw', () => {
    expect(parseGuidanceMessage('{')).toBeNull();
    expect(parseGuidanceMessage('{"type":"ping"}')).toBeNull();
    expect(parseGuidanceMessage('{"type":"guidance","frac":"x"}')).toBeNull();
  });

  it('valide les bornes GPS', () => {
    expect(isValidPosition(49.1, 6.17)).toBe(true);
    expect(isValidPosition(91, 0)).toBe(false);
    expect(isValidPosition(0, 181)).toBe(false);
  });
});
