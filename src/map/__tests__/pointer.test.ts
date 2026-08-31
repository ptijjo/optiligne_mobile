import { colors } from '@/theme';
import type { GuidanceState } from '@/features/guidance/types';
import { pointerColor, headingRotation } from '@/map/pointer';

describe('pointeur Nav-Arrow', () => {
  it.each([
    ['on_route', colors.brand],
    ['arrived', colors.success],
    ['ambiguous', colors.warning],
    ['off_route', colors.danger],
  ] as const)('state %s → couleur', (state: GuidanceState, expected) => {
    expect(pointerColor(state)).toBe(expected);
  });

  it('normalise le heading 0 / 90 / 180 / 360', () => {
    expect(headingRotation(0)).toBe(0);
    expect(headingRotation(90)).toBe(90);
    expect(headingRotation(180)).toBe(180);
    expect(headingRotation(360)).toBe(0);
    expect(headingRotation(-90)).toBe(270);
  });
});
