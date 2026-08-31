import { colors, fonts, radius, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      android_ripple={{ color: colors.brandTint, borderless: false }}
      style={[styles.chip, selected && styles.selected, style]}
    >
      <AppText variant="caption" style={selected ? styles.labelOn : styles.labelOff} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: tapMin,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.brandTint,
    overflow: 'hidden',
  },
  selected: {
    backgroundColor: colors.brand,
  },
  labelOn: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  labelOff: {
    color: colors.brand,
    fontFamily: fonts.bold,
  },
});
