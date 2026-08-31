import { getConfig, resetConfig, resolveApiUrl, resolveWsUrl } from '@/config';

describe('config', () => {
  it('lit les EXPO_PUBLIC_* du téléphone provisionné', () => {
    const cfg = getConfig();
    expect(cfg.apiUrl).toBe('http://127.0.0.1:9191');
    expect(cfg.wsUrl).toBe('ws://127.0.0.1:9191');
    expect(cfg.appEnv).toBe('development');
    expect(cfg.operatorId).toBe('transavold');
    expect(cfg.depotId).toBe('fluo57');
  });

  it('échoue si EXPO_PUBLIC_API_URL est absente', () => {
    const prev = process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_URL;
    resetConfig();
    expect(() => getConfig()).toThrow(/EXPO_PUBLIC_API_URL/);
    process.env.EXPO_PUBLIC_API_URL = prev;
  });

  it('échoue si le transporteur n’est pas provisionné', () => {
    const prev = process.env.EXPO_PUBLIC_OPERATOR_ID;
    delete process.env.EXPO_PUBLIC_OPERATOR_ID;
    resetConfig();
    expect(() => getConfig()).toThrow(/EXPO_PUBLIC_OPERATOR_ID/);
    process.env.EXPO_PUBLIC_OPERATOR_ID = prev;
  });

  it('échoue si le dépôt n’est pas provisionné', () => {
    const prev = process.env.EXPO_PUBLIC_DEPOT_ID;
    delete process.env.EXPO_PUBLIC_DEPOT_ID;
    resetConfig();
    expect(() => getConfig()).toThrow(/EXPO_PUBLIC_DEPOT_ID/);
    process.env.EXPO_PUBLIC_DEPOT_ID = prev;
  });

  it('remplace localhost par l’hôte LAN Expo sur un appareil natif', () => {
    expect(
      resolveApiUrl('http://localhost:9191', {
        lanHost: '192.168.1.40',
        platform: 'android',
        isTest: false,
      }),
    ).toBe('http://192.168.1.40:9191');
  });

  it('laisse localhost inchangé sur le web et en tests', () => {
    expect(
      resolveApiUrl('http://localhost:9191', {
        lanHost: '192.168.1.40',
        platform: 'web',
        isTest: false,
      }),
    ).toBe('http://localhost:9191');
    expect(
      resolveApiUrl('http://127.0.0.1:9191', {
        lanHost: '192.168.1.40',
        platform: 'android',
        isTest: true,
      }),
    ).toBe('http://127.0.0.1:9191');
  });

  it('rejette une URL d’API invalide', () => {
    expect(() => resolveApiUrl('pas-une-url')).toThrow(/EXPO_PUBLIC_API_URL invalide/);
  });

  it('dérive ws:// depuis l’URL HTTP', () => {
    expect(resolveWsUrl('http://127.0.0.1:9191')).toBe('ws://127.0.0.1:9191');
    expect(resolveWsUrl('https://api.optiligne.local')).toBe('wss://api.optiligne.local');
  });
});
