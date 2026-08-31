import { kindLabel, type RouteKind } from '@/features/catalog/route-kind';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/ui/Chip';
import { StyleSheet, View } from 'react-native';

const KINDS: RouteKind[] = ['all', 'reguliere', 'associee', 'scolaire'];

function chipLabel(kind: RouteKind): string {
  return kind === 'all' ? 'Toutes' : kindLabel(kind);
}

type KindFilterProps = {
  value: RouteKind;
  onChange: (kind: RouteKind) => void;
};

export function KindFilter({ value, onChange }: KindFilterProps) {
  return (
    <View style={styles.panel}>
      {KINDS.map((kind) => (
        <Chip
          key={kind}
          label={chipLabel(kind)}
          selected={value === kind}
          onPress={() => onChange(kind)}
          style={styles.chip}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  chip: {
    flexGrow: 1,
    flexBasis: '46%',
  },
});
