import { formatDeparture } from '@/lib/format-departure';
import { colors, fonts, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, View } from 'react-native';

type StopScheduleMarkerProps = {
  name: string;
  arrivalSec: number;
  isNext: boolean;
};

/** Pastille arrêt + nom + horaire GTFS (pas de calcul de retard local). */
export function StopScheduleMarker({ name, arrivalSec, isNext }: StopScheduleMarkerProps) {
  const time = formatDeparture(arrivalSec);
  return (
    <View
      collapsable={false}
      style={[styles.wrap, isNext ? styles.next : null]}
      accessibilityLabel={`Arrêt ${name} ${time}${isNext ? ' prochain' : ''}`}
    >
      <View style={[styles.bubble, isNext ? styles.bubbleNext : null]}>
        <AppText numberOfLines={2} style={[styles.name, isNext ? styles.nameNext : null]}>
          {name}
        </AppText>
        <AppText style={[styles.time, isNext ? styles.timeNext : null]}>{time}</AppText>
      </View>
      <View style={[styles.dot, isNext ? styles.dotNext : null]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 148,
  },
  next: {
    maxWidth: 168,
  },
  bubble: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.brand,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 2,
    marginBottom: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  bubbleNext: {
    borderWidth: 2.5,
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
  name: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    color: colors.slate,
    textAlign: 'center',
  },
  nameNext: {
    fontSize: 12,
    lineHeight: 15,
    color: colors.brand,
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  timeNext: {
    fontSize: 12,
    lineHeight: 15,
    color: colors.brand,
  },
});
