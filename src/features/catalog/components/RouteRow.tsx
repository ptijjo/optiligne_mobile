import { kindBadge, routeKind } from '@/features/catalog/route-kind';
import type { Route } from '@/features/catalog/types';
import { colors, fonts, radius, spacing, tapMin } from '@/theme';
import { AppText } from '@/ui/AppText';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type RouteRowProps = {
  route: Route;
  onPress: (routeId: string) => void;
};

export const RouteRow = memo(function RouteRow({ route, onPress }: RouteRowProps) {
  const kind = routeKind(route);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ligne ${route.shortName}`}
      onPress={() => onPress(route.id)}
      style={styles.card}
    >
      <View style={styles.code}>
        <AppText style={styles.codeText}>{route.shortName}</AppText>
      </View>
      <View style={styles.texts}>
        <AppText variant="muted" numberOfLines={2} style={styles.destination}>
          {route.longName}
        </AppText>
        <View style={styles.badge}>
          <AppText style={styles.badgeText}>{kindBadge(kind)}</AppText>
        </View>
      </View>
      <AppText style={styles.chevron} accessibilityElementsHidden>
        ›
      </AppText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: tapMin,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
  },
  code: {
    minWidth: 88,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 13,
    lineHeight: 18,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  destination: {
    textTransform: 'none',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.brandTint,
  },
  badgeText: {
    color: colors.brand,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: {
    fontSize: 28,
    lineHeight: 32,
    color: colors.brand,
    fontFamily: fonts.medium,
  },
});
