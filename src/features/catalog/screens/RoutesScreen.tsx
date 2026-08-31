import { isApiError } from '@/api/errors';
import { HealthStatus } from '@/api/HealthStatus';
import { KindFilter } from '@/features/catalog/components/KindFilter';
import { RouteRow } from '@/features/catalog/components/RouteRow';
import { useRoutes, useRefreshCatalog } from '@/features/catalog/hooks';
import { emptyKindMessage, filterRoutes, lineCountLabel, type RouteKind } from '@/features/catalog/route-kind';
import type { Route } from '@/features/catalog/types';
import { colors, fonts, spacing } from '@/theme';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { AppText } from '@/ui/AppText';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export function RoutesScreen() {
  const routes = useRoutes();
  const { refresh, isRefreshing } = useRefreshCatalog();
  const router = useRouter();
  const [kind, setKind] = useState<RouteKind>('all');

  const onPress = useCallback(
    (routeId: string) => {
      router.push({ pathname: '/routes/[id]', params: { id: routeId } });
    },
    [router],
  );

  const visible = useMemo(
    () => filterRoutes(routes.data ?? [], kind),
    [routes.data, kind],
  );

  const errorMessage = isApiError(routes.error)
    ? routes.error.message
    : routes.isError
      ? 'Impossible de joindre le serveur'
      : '';

  return (
    <Screen variant="hero" title="OptiLigne" subtitle="Choisissez votre ligne">
      <HealthStatus />
      <KindFilter value={kind} onChange={setKind} />
      {routes.data && !routes.isPending ? (
        <View style={styles.toolbar}>
          <AppText variant="caption" style={styles.count}>
            {lineCountLabel(visible.length)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Actualiser"
            accessibilityState={{ disabled: isRefreshing, busy: isRefreshing }}
            disabled={isRefreshing}
            onPress={() => void refresh()}
            style={styles.refresh}
          >
            <AppText variant="caption" style={styles.refreshLabel}>
              {isRefreshing ? 'Actualisation…' : 'Actualiser'}
            </AppText>
          </Pressable>
        </View>
      ) : null}
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {routes.isPending ? (
        <View>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </View>
      ) : null}
      {routes.data && visible.length === 0 && !routes.isPending ? (
        <EmptyState message={emptyKindMessage(kind)} />
      ) : null}
      {visible.length > 0 ? (
        <View style={styles.list}>
          <FlashList
            data={visible}
            extraData={kind}
            keyExtractor={(item: Route) => item.id}
            renderItem={({ item }: { item: Route }) => <RouteRow route={item} onPress={onPress} />}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  count: {
    color: colors.muted,
    flex: 1,
  },
  refresh: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  refreshLabel: {
    color: colors.brand,
    fontFamily: fonts.bold,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
});
