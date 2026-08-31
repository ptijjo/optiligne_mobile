import { colors } from '@/theme';
import { headingRotation, pointerColor } from '@/map/pointer';
import type { GuidanceState } from '@/features/guidance/types';
import { StyleSheet, View } from 'react-native';

type NavArrowProps = {
  state: GuidanceState;
  heading: number;
};

export function NavArrow({ state, heading }: NavArrowProps) {
  const fill = pointerColor(state);
  return (
    <View
      style={[styles.halo, { transform: [{ rotate: `${headingRotation(heading)}deg` }] }]}
      accessibilityLabel="Position véhicule"
    >
      <View style={[styles.disc, { backgroundColor: fill }]}>
        <View style={styles.tip} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.white,
  },
});
