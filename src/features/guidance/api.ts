import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import { getSelectedSector } from '@/features/catalog/sector';
import { startSessionSchema, type StartSession } from '@/features/guidance/types';
import { getScope } from '@/scope';
import { z } from 'zod';

export function startGuidanceSession(tripId: string, date: string): Promise<StartSession> {
  let operatorId = '';
  let depotId = '';
  try {
    const scope = getScope();
    operatorId = scope.operatorId;
    depotId = getSelectedSector(scope.depotId);
  } catch {
    return Promise.reject(new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.'));
  }
  if (!operatorId || !depotId || !tripId || !date) {
    return Promise.reject(new ApiError(400, 'scope_required', 'Transporteur et dépôt obligatoires.'));
  }
  // 1. Créer la session HTTP (périmètre téléphone) — pas d’auth.
  return api.post(
    '/guidance/sessions',
    {
      tripId,
      date,
      operatorCode: operatorId,
      depotCode: depotId,
    },
    startSessionSchema,
  );
}

const endSessionSchema = z.object({ ended: z.boolean() });

/** Libère le verrou admin (course guidée) — best-effort au quitter. */
export function endGuidanceSession(sessionId: string): Promise<void> {
  if (!sessionId) {
    return Promise.resolve();
  }
  return api
    .delete(`/guidance/sessions/${encodeURIComponent(sessionId)}`, endSessionSchema)
    .then(() => undefined)
    .catch(() => undefined);
}
