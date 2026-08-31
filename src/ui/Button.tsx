import { colors, radius, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ label, onPress, loading = false, disabled = false }: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      testID={`button-${label}`}
      style={[styles.base, inactive && styles.inactive]}
    >
      {loading ? <ActivityIndicator color={colors.white} /> : <AppText variant="button">{label}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    paddingHorizontal: 20,
    backgroundColor: colors.brand,
  },
  inactive: {
    opacity: 0.5,
  },
});
