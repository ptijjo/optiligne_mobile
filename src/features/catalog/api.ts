import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import {
  routesSchema,
  stopsSchema,
  tripsSchema,
  type Route,
  type Stop,
  type Trip,
} from '@/features/catalog/types';
import { catalogQuery, getScope } from '@/scope';

function requireScope() {
  try {
    const { operatorId, depotId } = getScope();
    if (!operatorId || !depotId) {
      throw new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.');
  }
}

export function listRoutes(): Promise<Route[]> {
  try {
    // 1. Refuser un catalogue sans périmètre (pas de liste globale).
    requireScope();
  } catch (error) {
    return Promise.reject(error);
  }
  // 2. Lignes scolaires du dépôt provisionné.
  return api.get('/catalog/routes', routesSchema, { query: catalogQuery() });
}

export function listTrips(routeId: string, date: string): Promise<Trip[]> {
  try {
    requireScope();
  } catch (error) {
    return Promise.reject(error);
  }
  if (!routeId || !date) {
    return Promise.reject(new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.'));
  }
  return api.get(`/catalog/routes/${encodeURIComponent(routeId)}/trips`, tripsSchema, {
    query: { ...catalogQuery(), date },
  });
}

export function listTripStops(tripId: string): Promise<Stop[]> {
  try {
    requireScope();
  } catch (error) {
    return Promise.reject(error);
  }
  if (!tripId) {
    return Promise.reject(new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.'));
  }
  return api.get(`/catalog/trips/${encodeURIComponent(tripId)}/stops`, stopsSchema, {
    query: catalogQuery(),
  });
}
