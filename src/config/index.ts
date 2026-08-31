import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';

const schema = z.object({
  apiUrl: z.string().url(),
  wsUrl: z.string().min(1),
  appEnv: z.enum(['development', 'preview', 'production']),
  operatorId: z.string().min(1),
  depotId: z.string().min(1),
});

export type AppConfig = z.infer<typeof schema>;

export type ResolveApiUrlOptions = {
  lanHost?: string;
  platform?: string;
  isTest?: boolean;
};

function lanHostFromExpo(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return undefined;
  }
  const host = hostUri.replace(/^https?:\/\//, '').split('/')[0]?.split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }
  return host;
}

export function resolveApiUrl(raw: string, options: ResolveApiUrlOptions = {}): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL invalide');
  }

  const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  const platform = options.platform ?? Platform.OS;
  const isTest = options.isTest ?? process.env.NODE_ENV === 'test';
  const lanHost = options.lanHost ?? lanHostFromExpo();

  if (isLoopback && !isTest && platform !== 'web' && lanHost) {
    parsed.hostname = lanHost;
  }

  return parsed.origin;
}

export function resolveWsUrl(apiUrl: string, rawWs?: string): string {
  if (rawWs) {
    return rawWs.replace(/\/$/, '');
  }
  const parsed = new URL(apiUrl);
  parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
  return parsed.origin;
}

function readConfig(): AppConfig {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL est requise');
  }
  const operatorId = process.env.EXPO_PUBLIC_OPERATOR_ID;
  if (!operatorId) {
    throw new Error('EXPO_PUBLIC_OPERATOR_ID est requis');
  }
  const depotId = process.env.EXPO_PUBLIC_DEPOT_ID;
  if (!depotId) {
    throw new Error('EXPO_PUBLIC_DEPOT_ID est requis');
  }

  const resolvedApi = resolveApiUrl(apiUrl);
  return schema.parse({
    apiUrl: resolvedApi,
    wsUrl: resolveWsUrl(resolvedApi, process.env.EXPO_PUBLIC_WS_URL),
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    operatorId,
    depotId,
  });
}

let cached: AppConfig | undefined;

export function getConfig(): AppConfig {
  if (!cached) {
    cached = readConfig();
  }
  return cached;
}

export function resetConfig() {
  cached = undefined;
}
