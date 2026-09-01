import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { StyleSheet, TextInput, View } from 'react-native';

type RouteSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function RouteSearchBar({ value, onChangeText }: RouteSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        accessibilityLabel="Rechercher une ligne"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        placeholder="Rechercher une ligne…"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 ? (
        <AppText variant="caption" style={styles.hint}>
          Code ou destination
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: tapMin,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    color: colors.slate,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  hint: {
    paddingHorizontal: spacing.xs,
  },
});
