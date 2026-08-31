import { catalogQuery, getScope, isScopeConfigured } from '@/scope';
import { resetConfig } from '@/config';

describe('scope', () => {
  it('expose operator_id et depot_id provisionnés', () => {
    expect(getScope()).toEqual({
      operatorId: 'transavold',
      depotId: 'fluo57',
    });
  });

  it('catalogQuery aligne operator_code / depot_code API', () => {
    expect(catalogQuery()).toEqual({
      operator_code: 'transavold',
      depot_code: 'fluo57',
      depot_id: 'fluo57',
    });
  });

  it('isScopeConfigured est vrai si le téléphone est provisionné', () => {
    expect(isScopeConfigured()).toBe(true);
  });

  it('isScopeConfigured est faux si le dépôt manque', () => {
    const prev = process.env.EXPO_PUBLIC_DEPOT_ID;
    delete process.env.EXPO_PUBLIC_DEPOT_ID;
    resetConfig();
    try {
      expect(isScopeConfigured()).toBe(false);
    } finally {
      process.env.EXPO_PUBLIC_DEPOT_ID = prev;
      resetConfig();
    }
  });
});
