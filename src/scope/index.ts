import { getConfig } from '@/config';
import { getSelectedSector } from '@/features/catalog/sector';

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

/** Query catalogue : operator_code + secteur (rge/casas/casc/forbus). */
export function catalogQuery(): {
  operator_code: string;
  depot_code: string;
  depot_id: string;
  sector: string;
} {
  const { operatorId, depotId } = getScope();
  const sector = getSelectedSector(depotId);
  return {
    operator_code: operatorId,
    depot_code: sector,
    depot_id: sector,
    sector,
  };
}
