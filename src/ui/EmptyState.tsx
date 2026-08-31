import { colors, radius, spacing } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.box}>
      <AppText variant="muted" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
