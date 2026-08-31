import type { Stop } from '@/features/catalog/types';
import { formatDeparture } from '@/lib/format-departure';
import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type StopRowProps = {
  stop: Stop;
};

export const StopRow = memo(function StopRow({ stop }: StopRowProps) {
  const time = formatDeparture(stop.arrivalSec || stop.departureSec);
  const order = stop.sequence;

  return (
    <View
      accessibilityLabel={`Arrêt ${order} ${stop.name} ${time}`}
      style={styles.card}
    >
      <View style={styles.seqBox}>
        <AppText style={styles.seq}>{order}</AppText>
      </View>
      <View style={styles.texts}>
        <AppText style={styles.name}>{stop.name}</AppText>
        <AppText variant="caption">{time}</AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: tapMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  seqBox: {
    minWidth: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seq: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.slate,
  },
});
