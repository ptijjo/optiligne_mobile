import { formatServiceDay } from '@/lib/service-date';
import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { Pressable, StyleSheet, View } from 'react-native';

type DayStepperProps = {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function DayStepper({ date, onPrevious, onNext }: DayStepperProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jour précédent"
        onPress={onPrevious}
        style={styles.arrow}
      >
        <AppText style={styles.arrowLabel}>‹</AppText>
      </Pressable>
      <View style={styles.label}>
        <AppText style={styles.day}>{formatServiceDay(date)}</AppText>
        <AppText variant="caption">{date}</AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Jour suivant"
        onPress={onNext}
        style={styles.arrow}
      >
        <AppText style={styles.arrowLabel}>›</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  arrow: {
    minWidth: tapMin,
    minHeight: tapMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.brandTint,
  },
  arrowLabel: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.brand,
    fontFamily: fonts.bold,
  },
  label: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.slate,
    textTransform: 'capitalize',
  },
});
