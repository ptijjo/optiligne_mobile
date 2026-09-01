import { isApiError } from '@/api/errors';
import { StopRow } from '@/features/catalog/components/StopRow';
import { useTripStops } from '@/features/catalog/hooks';
import type { Stop } from '@/features/catalog/types';
import { serviceDate } from '@/lib/service-date';
import { colors, spacing } from '@/theme';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function StopsScreen() {
  const params = useLocalSearchParams<{ tripId: string; date?: string; headsign?: string }>();
  const tripId = typeof params.tripId === 'string' ? params.tripId : params.tripId?.[0];
  const dateRaw = typeof params.date === 'string' ? params.date : params.date?.[0];
  const headsignRaw = typeof params.headsign === 'string' ? params.headsign : params.headsign?.[0];
  const date = dateRaw || serviceDate();
  const headsign = headsignRaw || tripId || 'Course';
  const router = useRouter();
  const stops = useTripStops(tripId);

  const onStartNavigation = useCallback(() => {
    if (!tripId) {
      return;
    }
    router.push({
      pathname: '/guidance/[tripId]',
      params: { tripId, date, headsign },
    });
  }, [date, headsign, router, tripId]);

  const errorMessage = isApiError(stops.error)
    ? stops.error.message
    : stops.isError
      ? 'Impossible de joindre le serveur'
      : !tripId
        ? 'Course introuvable.'
        : '';

  return (
    <Screen variant="hero" title="Arrêts" subtitle={headsign} showBack>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {stops.isPending ? (
        <View>
          <Skeleton />
          <Skeleton />
        </View>
      ) : null}
      {stops.data && stops.data.length === 0 ? (
        <EmptyState message="Aucun arrêt pour cette course." />
      ) : null}
      {stops.data && stops.data.length > 0 ? (
        <View style={styles.list}>
          <FlashList
            data={stops.data}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item: Stop) => `${item.stopId}-${item.sequence}`}
            renderItem={({ item }: { item: Stop }) => <StopRow stop={item} />}
          />
        </View>
      ) : null}
      {tripId && !stops.isError && stops.data && stops.data.length > 0 ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button label="Lancer la navigation" onPress={onStartNavigation} />
        </SafeAreaView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  footer: {
    paddingTop: spacing.md,
    backgroundColor: colors.canvas,
  },
});
