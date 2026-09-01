import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { Pressable, StyleSheet, View } from 'react-native';

type RoutePaginationProps = {
  page: number;
  totalPages: number;
  label: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function RoutePagination({
  page,
  totalPages,
  label,
  onPrevious,
  onNext,
}: RoutePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Page précédente"
        accessibilityState={{ disabled: atStart }}
        disabled={atStart}
        onPress={onPrevious}
        style={[styles.action, atStart && styles.actionDisabled]}
      >
        <AppText style={[styles.actionLabel, atStart && styles.actionLabelDisabled]}>Préc.</AppText>
      </Pressable>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Page suivante"
        accessibilityState={{ disabled: atEnd }}
        disabled={atEnd}
        onPress={onNext}
        style={[styles.action, atEnd && styles.actionDisabled]}
      >
        <AppText style={[styles.actionLabel, atEnd && styles.actionLabelDisabled]}>Suiv.</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    color: colors.slate,
  },
  action: {
    minHeight: tapMin,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.brandTint,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  actionLabelDisabled: {
    color: colors.muted,
  },
});
