import { delayLabel } from '@/lib/delay-label';
import { guidanceBannerLabel, travelLabel } from '@/lib/travel-label';

describe('travelLabel', () => {
  it('affiche ETA en minutes au-delà de 30 s', () => {
    expect(travelLabel(0)).toBe('');
    expect(travelLabel(20)).toBe('');
    expect(travelLabel(90)).toBe('ETA 2 min');
    expect(travelLabel(12 * 60)).toBe('ETA 12 min');
  });
});

describe('guidanceBannerLabel', () => {
  it('compose arrêt · ETA · régulation', () => {
    expect(guidanceBannerLabel('Forbach', -180, 12 * 60, delayLabel)).toBe(
      'Forbach · ETA 12 min · En avance 3 min — lever le pied',
    );
  });

  it('omet ETA si trajet négligeable', () => {
    expect(guidanceBannerLabel('Forbach', 0, 10, delayLabel)).toBe('Forbach · À l’heure');
  });
});
