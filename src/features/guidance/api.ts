import { api } from '@/api/client';
import { ApiError } from '@/api/errors';
import { startSessionSchema, type StartSession } from '@/features/guidance/types';
import { getScope } from '@/scope';

export function startGuidanceSession(tripId: string, date: string): Promise<StartSession> {
  let operatorId = '';
  let depotId = '';
  try {
    const scope = getScope();
    operatorId = scope.operatorId;
    depotId = scope.depotId;
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
