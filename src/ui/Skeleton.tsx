import { colors, radius, spacing } from '@/theme';
import { StyleSheet, View } from 'react-native';

export function Skeleton({ height = 72 }: { height?: number }) {
  return <View accessibilityLabel="Chargement" style={[styles.bar, { height }]} />;
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
});
