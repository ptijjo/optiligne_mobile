export const sectorCodes = ['rge', 'casas', 'casc', 'forbus', 'hombourg-haut'] as const;

export type SectorCode = (typeof sectorCodes)[number];

export const SECTORS: { code: SectorCode; label: string }[] = [
  { code: 'rge', label: 'RGE' },
  { code: 'casas', label: 'CASAS' },
  { code: 'casc', label: 'CASC' },
  { code: 'forbus', label: 'Forbus' },
  { code: 'hombourg-haut', label: 'Hombourg-Haut' },
];

export function normalizeSector(code: string): SectorCode {
  switch (code.trim().toLowerCase()) {
    case 'rge':
    case 'fluo57':
    case 'rgefluo57':
      return 'rge';
    case 'casas':
    case 'transavold':
    case 'transchool':
      return 'casas';
    case 'casc':
      return 'casc';
    case 'forbus':
      return 'forbus';
    case 'hombourg-haut':
    case 'hombourghaut':
      return 'hombourg-haut';
    default:
      return 'rge';
  }
}

let selected: SectorCode | null = null;

export function getSelectedSector(fallbackDepot = ''): SectorCode {
  if (selected) {
    return selected;
  }
  return normalizeSector(fallbackDepot);
}

export function setSelectedSector(code: SectorCode) {
  selected = code;
}

export function resetSelectedSector() {
  selected = null;
}
