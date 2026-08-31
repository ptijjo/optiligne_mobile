import { getConfig } from '@/config';

export type DeviceScope = {
  operatorId: string;
  depotId: string;
};

export function getScope(): DeviceScope {
  const { operatorId, depotId } = getConfig();
  return { operatorId, depotId };
}

export function isScopeConfigured(): boolean {
  try {
    const { operatorId, depotId } = getScope();
    return operatorId.length > 0 && depotId.length > 0;
  } catch {
    return false;
  }
}

/** Query catalogue alignée handler Go : operator_code + depot_code (depot_id accepté en fallback). */
export function catalogQuery(): { operator_code: string; depot_code: string; depot_id: string } {
  const { operatorId, depotId } = getScope();
  return {
    operator_code: operatorId,
    depot_code: depotId,
    depot_id: depotId,
  };
}
