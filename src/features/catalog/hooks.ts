import { listRoutes, listTripStops, listTrips } from '@/features/catalog/api';
import { useQueryClient, useQuery, useIsFetching } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRoutes() {
  return useQuery({
    queryKey: ['catalog', 'routes'],
    queryFn: listRoutes,
    staleTime: 5 * 60_000,
  });
}

export function useTrips(routeId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['catalog', 'trips', routeId, date],
    queryFn: () => listTrips(routeId ?? '', date),
    enabled: Boolean(routeId && date),
    staleTime: 60_000,
  });
}

export function useTripStops(tripId: string | undefined) {
  return useQuery({
    queryKey: ['catalog', 'stops', tripId],
    queryFn: () => listTripStops(tripId ?? ''),
    enabled: Boolean(tripId),
    staleTime: 60_000,
  });
}

/** Invalide tout le cache catalogue (lignes, courses, arrêts). */
export function useRefreshCatalog() {
  const client = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: ['catalog'] }) > 0;

  const refresh = useCallback(() => client.invalidateQueries({ queryKey: ['catalog'] }), [client]);

  return { refresh, isRefreshing };
}
