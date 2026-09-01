import { BUS_MARKER_SIZE, busMarkerImage } from '@/map/bus-asset';
import { headingRotation } from '@/map/pointer';
import { Image, StyleSheet, View } from 'react-native';

/** Marqueur carte : icône bus `assets/img.png` (vue de face, cap vers le haut). */
export function MinibusMarker() {
  return (
    <View collapsable={false} style={styles.wrap} accessibilityLabel="Position du bus">
      <Image source={busMarkerImage} style={styles.image} resizeMode="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

/** Le bus sur l’asset pointe vers le haut ; rotation = cap GPS. */
export function busMarkerRotation(heading: number): number {
  return headingRotation(heading);
}

export function minibusMarkerBoxSize(): number {
  return BUS_MARKER_SIZE;
}

const styles = StyleSheet.create({
  wrap: {
    width: BUS_MARKER_SIZE,
    height: BUS_MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: BUS_MARKER_SIZE,
    height: BUS_MARKER_SIZE,
  },
});
