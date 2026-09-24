import { SECTORS, type SectorCode } from '@/features/catalog/sector';
import { colors, radius, spacing } from '@/theme';
import { Chip } from '@/ui/Chip';
import { StyleSheet, View } from 'react-native';

type SectorFilterProps = {
  value: SectorCode;
  onChange: (sector: SectorCode) => void;
};

export function SectorFilter({ value, onChange }: SectorFilterProps) {
  return (
    <View style={styles.panel} accessibilityRole="tablist" accessibilityLabel="Réseau">
      {SECTORS.map((sector) => (
        <Chip
          key={sector.code}
          label={sector.label}
          selected={value === sector.code}
          onPress={() => onChange(sector.code)}
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
    flexBasis: '18%',
  },
});
