import { listRoutes, listTripStops, listTrips } from '@/features/catalog/api';
import { getSelectedSector } from '@/features/catalog/sector';
import { useQueryClient, useQuery, useIsFetching } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRoutes() {
  const sector = getSelectedSector();
  return useQuery({
    queryKey: ['catalog', 'routes', sector],
    queryFn: listRoutes,
    staleTime: 5 * 60_000,
  });
}

export function useTrips(routeId: string | undefined, date: string) {
  const sector = getSelectedSector();
  return useQuery({
    queryKey: ['catalog', 'trips', routeId, date, sector],
    queryFn: () => listTrips(routeId ?? '', date),
    enabled: Boolean(routeId && date),
    staleTime: 60_000,
  });
}

export function useTripStops(tripId: string | undefined) {
  const sector = getSelectedSector();
  return useQuery({
    queryKey: ['catalog', 'stops', tripId, sector],
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
