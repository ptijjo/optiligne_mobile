import type { Trip } from '@/features/catalog/types';
import { formatDeparture } from '@/lib/format-departure';
import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type TripRowProps = {
  trip: Trip;
  onPress: (trip: Trip) => void;
};

export const TripRow = memo(function TripRow({ trip, onPress }: TripRowProps) {
  const time = formatDeparture(trip.departureSec);
  const title = trip.headsign || trip.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Course ${time} ${title}`}
      onPress={() => onPress(trip)}
      style={styles.card}
    >
      <View style={styles.timeBox}>
        <AppText style={styles.time}>{time}</AppText>
      </View>
      <View style={styles.texts}>
        <AppText style={styles.headsign}>{title}</AppText>
        <AppText variant="caption" numberOfLines={1}>
          Départ théorique
        </AppText>
      </View>
      <AppText style={styles.chevron} accessibilityElementsHidden>
        ›
      </AppText>
    </Pressable>
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
  timeBox: {
    minWidth: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  headsign: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.slate,
  },
  chevron: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.brand,
    fontFamily: fonts.medium,
  },
});
