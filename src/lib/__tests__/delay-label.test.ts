import { delayLabel } from '@/lib/delay-label';

describe('delayLabel', () => {
  it('mappe delay_s vers un libellé chauffeur avec conseil régulation', () => {
    expect(delayLabel(0)).toBe('À l’heure');
    expect(delayLabel(40)).toBe('À l’heure');
    expect(delayLabel(120)).toBe('Retard +2 min — enchaîner');
    expect(delayLabel(-120)).toBe('En avance 2 min — lever le pied');
  });
});
