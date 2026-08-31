import type { GuidanceState } from '@/features/guidance/types';
import { colors } from '@/theme';

export function pointerColor(state: GuidanceState): string {
  switch (state) {
    case 'off_route':
      return colors.danger;
    case 'ambiguous':
      return colors.warning;
    case 'arrived':
      return colors.success;
    case 'on_route':
      return colors.brand;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function headingRotation(heading: number): number {
  if (!Number.isFinite(heading)) {
    return 0;
  }
  return ((heading % 360) + 360) % 360;
}
