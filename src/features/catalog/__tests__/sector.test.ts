import {
  getSelectedSector,
  normalizeSector,
  resetSelectedSector,
  setSelectedSector,
  SECTORS,
} from '@/features/catalog/sector';

describe('secteur réseau', () => {
  afterEach(() => {
    resetSelectedSector();
  });

  it('normalise fluo57 vers rge', () => {
    expect(normalizeSector('fluo57')).toBe('rge');
    expect(normalizeSector('transavold')).toBe('casas');
    expect(normalizeSector('casc')).toBe('casc');
    expect(normalizeSector('forbus')).toBe('forbus');
    expect(normalizeSector('hombourg-haut')).toBe('hombourg-haut');
    expect(normalizeSector('hombourghaut')).toBe('hombourg-haut');
  });

  it('expose les 5 filtres métier', () => {
    expect(SECTORS.map((s) => s.code)).toEqual(['rge', 'casas', 'casc', 'forbus', 'hombourg-haut']);
  });

  it('retient le secteur choisi', () => {
    expect(getSelectedSector('fluo57')).toBe('rge');
    setSelectedSector('casas');
    expect(getSelectedSector('fluo57')).toBe('casas');
  });
});
