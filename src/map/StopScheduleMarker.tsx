import { formatDeparture } from '@/lib/format-departure';
import { colors, fonts, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, View } from 'react-native';

type StopScheduleMarkerProps = {
  name: string;
  arrivalSec: number;
  isNext: boolean;
};

/** Pastille arrêt + horaire GTFS (pas de calcul de retard local). */
export function StopScheduleMarker({ name, arrivalSec, isNext }: StopScheduleMarkerProps) {
  const time = formatDeparture(arrivalSec);
  return (
    <View
      collapsable={false}
      style={[styles.wrap, isNext ? styles.next : null]}
      accessibilityLabel={`Arrêt ${name} ${time}${isNext ? ' prochain' : ''}`}
    >
      <View style={[styles.dot, isNext ? styles.dotNext : null]} />
      <AppText style={[styles.time, isNext ? styles.timeNext : null]}>{time}</AppText>
      <AppText numberOfLines={1} style={[styles.name, isNext ? styles.nameNext : null]}>
        {name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 120,
    gap: 2,
  },
  next: {
    maxWidth: 140,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.brand,
  },
  dotNext: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: colors.brand,
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.slate,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
    overflow: 'hidden',
  },
  timeNext: {
    fontSize: 13,
    lineHeight: 16,
    color: colors.brand,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.muted,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
  },
  nameNext: {
    fontSize: 11,
    color: colors.slate,
  },
});
