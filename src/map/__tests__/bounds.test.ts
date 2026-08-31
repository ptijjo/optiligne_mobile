import { boundsFromCoordinates } from '@/map/bounds';

describe('boundsFromCoordinates', () => {
  it('calcule NE / SW d’un tracé', () => {
    expect(
      boundsFromCoordinates([
        [6.1, 49.1],
        [6.3, 49.2],
      ]),
    ).toEqual({ ne: [6.3, 49.2], sw: [6.1, 49.1] });
  });

  it('liste vide → null', () => {
    expect(boundsFromCoordinates([])).toBeNull();
  });
});
