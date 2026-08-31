import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, View } from 'react-native';

export function ErrorBanner({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.banner}>
      <AppText variant="danger">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerTint,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
