import {
  emptyKindMessage,
  filterRoutes,
  kindBadge,
  lineCountLabel,
  routeKind,
} from '@/features/catalog/route-kind';
import type { Route } from '@/features/catalog/types';

const reguliere: Route = {
  id: '1006275',
  shortName: '57R004',
  longName: 'CREUTZWALD / METZ',
  routeType: 204,
};
const associee: Route = {
  id: '1006333',
  shortName: '57SAV34',
  longName: 'ADELANGE / ST-AVOLD',
  routeType: 713,
};
const scolaire: Route = {
  id: '1006430',
  shortName: '57ECR00',
  longName: 'ELVANGE / CREHANGE',
  routeType: 712,
};

describe('routeKind', () => {
  it('classe régulière / associée / scolaire', () => {
    expect(routeKind(reguliere)).toBe('reguliere');
    expect(routeKind(associee)).toBe('associee');
    expect(routeKind(scolaire)).toBe('scolaire');
  });

  it('filtre par groupe sans mélanger les dépôts', () => {
    const all = [reguliere, associee, scolaire];
    expect(filterRoutes(all, 'all').map((r) => r.shortName)).toEqual([
      '57R004',
      '57SAV34',
      '57ECR00',
    ]);
    expect(filterRoutes(all, 'reguliere').map((r) => r.shortName)).toEqual(['57R004']);
    expect(filterRoutes(all, 'associee').map((r) => r.shortName)).toEqual(['57SAV34']);
    expect(filterRoutes(all, 'scolaire').map((r) => r.shortName)).toEqual(['57ECR00']);
  });

  it('classe le type urbain 3 en régulière', () => {
    expect(
      routeKind({
        id: 'x',
        shortName: 'L1',
        longName: 'Urbain',
        routeType: 3,
      }),
    ).toBe('reguliere');
  });

  it('priorise routeType sur le préfixe du shortName (correction admin)', () => {
    expect(
      routeKind({
        id: '1',
        shortName: '57SAV34',
        longName: 'Test',
        routeType: 712,
      }),
    ).toBe('scolaire');
    expect(
      routeKind({
        id: '2',
        shortName: '57ECR00',
        longName: 'Test',
        routeType: 713,
      }),
    ).toBe('associee');
  });

  it('messages vides par groupe', () => {
    expect(emptyKindMessage('all')).toMatch(/Aucune ligne pour ce dépôt/);
    expect(emptyKindMessage('reguliere')).toMatch(/régulière/);
    expect(emptyKindMessage('associee')).toMatch(/associée/);
    expect(emptyKindMessage('scolaire')).toMatch(/scolaire/);
  });

  it('badge court et compteur de lignes', () => {
    expect(kindBadge('reguliere')).toBe('Régulière');
    expect(kindBadge('associee')).toBe('Associée');
    expect(kindBadge('scolaire')).toBe('Scolaire');
    expect(lineCountLabel(0)).toBe('0 ligne');
    expect(lineCountLabel(1)).toBe('1 ligne');
    expect(lineCountLabel(12)).toBe('12 lignes');
  });
});
