import { isApiError } from '@/api/errors';
import { KindFilter } from '@/features/catalog/components/KindFilter';
import { RoutePagination } from '@/features/catalog/components/RoutePagination';
import { RouteRow } from '@/features/catalog/components/RouteRow';
import { RouteSearchBar } from '@/features/catalog/components/RouteSearchBar';
import { useRefreshCatalog, useRoutes } from '@/features/catalog/hooks';
import {
  emptyKindMessage,
  filterRoutes,
  lineCountLabel,
  type RouteKind,
} from '@/features/catalog/route-kind';
import {
  emptySearchMessage,
  paginateRoutes,
  routesPageLabel,
  searchRoutes,
} from '@/features/catalog/route-search';
import type { Route } from '@/features/catalog/types';
import { colors, spacing } from '@/theme';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { AppText } from '@/ui/AppText';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RoutesScreen() {
  const routes = useRoutes();
  const { refresh, isRefreshing } = useRefreshCatalog();
  const router = useRouter();
  const [kind, setKind] = useState<RouteKind>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const onPress = useCallback(
    (routeId: string) => {
      router.push({ pathname: '/routes/[id]', params: { id: routeId } });
    },
    [router],
  );

  const filtered = useMemo(
    () => searchRoutes(filterRoutes(routes.data ?? [], kind), query),
    [routes.data, kind, query],
  );

  const pagination = useMemo(() => paginateRoutes(filtered, page), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [kind, query]);

  const errorMessage = isApiError(routes.error)
    ? routes.error.message
    : routes.isError
      ? 'Impossible de joindre le serveur'
      : '';

  const emptyMessage =
    query.trim().length > 0 ? emptySearchMessage() : emptyKindMessage(kind);

  return (
    <Screen variant="hero" title="OptiLigne" subtitle="Choisissez votre ligne">
      <RouteSearchBar value={query} onChangeText={setQuery} />
      <KindFilter value={kind} onChange={setKind} />
      {routes.data && !routes.isPending ? (
        <AppText variant="caption" style={styles.count}>
          {lineCountLabel(filtered.length)}
        </AppText>
      ) : null}
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {routes.isPending ? (
        <View>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </View>
      ) : null}
      {routes.data && filtered.length === 0 && !routes.isPending ? (
        <EmptyState message={emptyMessage} />
      ) : null}
      {pagination.pageItems.length > 0 ? (
        <View style={styles.list}>
          <FlashList
            data={pagination.pageItems}
            extraData={`${kind}-${query}-${pagination.page}`}
            keyExtractor={(item: Route) => item.id}
            refreshControl={
              <RefreshControl
                colors={[colors.brand]}
                refreshing={isRefreshing}
                tintColor={colors.brand}
                onRefresh={() => void refresh()}
              />
            }
            renderItem={({ item }: { item: Route }) => <RouteRow route={item} onPress={onPress} />}
            testID="routes-list"
          />
        </View>
      ) : null}
      {filtered.length > 0 && !routes.isPending ? (
        <SafeAreaView edges={['bottom']} style={styles.paginationSafe}>
          <RoutePagination
            label={routesPageLabel(pagination.page, pagination.totalPages, filtered.length)}
            page={pagination.page}
            totalPages={pagination.totalPages}
            onNext={() => setPage((current) => Math.min(current + 1, pagination.totalPages))}
            onPrevious={() => setPage((current) => Math.max(current - 1, 1))}
          />
        </SafeAreaView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    marginBottom: spacing.sm,
    color: colors.muted,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  paginationSafe: {
    backgroundColor: colors.canvas,
  },
});
