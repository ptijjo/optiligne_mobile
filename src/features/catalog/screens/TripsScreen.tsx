import { isApiError } from '@/api/errors';
import { DayStepper } from '@/features/catalog/components/DayStepper';
import { TripRow } from '@/features/catalog/components/TripRow';
import { useTrips } from '@/features/catalog/hooks';
import type { Trip } from '@/features/catalog/types';
import { serviceDate, shiftServiceDate } from '@/lib/service-date';
import { EmptyState } from '@/ui/EmptyState';
import { ErrorBanner } from '@/ui/ErrorBanner';
import { Screen } from '@/ui/Screen';
import { Skeleton } from '@/ui/Skeleton';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export function TripsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = typeof id === 'string' ? id : id?.[0];
  const router = useRouter();
  const [date, setDate] = useState(() => serviceDate());
  const trips = useTrips(routeId, date);

  const onPressTrip = useCallback(
    (trip: Trip) => {
      router.push({
        pathname: '/trips/[tripId]',
        params: { tripId: trip.id, date, headsign: trip.headsign || trip.id },
      });
    },
    [date, router],
  );

  const errorMessage = isApiError(trips.error)
    ? trips.error.message
    : trips.isError
      ? 'Impossible de joindre le serveur'
      : '';

  return (
    <Screen variant="hero" title="Courses" subtitle="Choisissez un horaire" showBack>
      <DayStepper
        date={date}
        onPrevious={() => setDate((current) => shiftServiceDate(current, -1))}
        onNext={() => setDate((current) => shiftServiceDate(current, 1))}
      />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {trips.isPending ? (
        <View>
          <Skeleton />
          <Skeleton />
        </View>
      ) : null}
      {trips.data && trips.data.length === 0 ? (
        <EmptyState message="Aucune course pour ce jour." />
      ) : null}
      {trips.data && trips.data.length > 0 ? (
        <View style={styles.list}>
          <FlashList
            data={trips.data}
            extraData={date}
            keyExtractor={(item: Trip) => item.id}
            renderItem={({ item }: { item: Trip }) => (
              <TripRow trip={item} onPress={onPressTrip} />
            )}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    minHeight: 0,
  },
});
