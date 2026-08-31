import { envelopeSchema } from '@/api/envelope';
import { ApiError } from '@/api/errors';
import { getConfig } from '@/config';
import { z } from 'zod';

const TIMEOUT_MS = 15_000;

export type HttpOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  body?: unknown;
  query?: Record<string, string | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

function withQuery(path: string, query?: Record<string, string | undefined>): string {
  if (!query) {
    return path;
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function send<T>(
  path: string,
  dataSchema: z.ZodType<T>,
  options: HttpOptions = {},
): Promise<T> {
  const { apiUrl } = getConfig();
  const url = `${apiUrl.replace(/\/$/, '')}${withQuery(path, options.query)}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort());
    }
  }

  const body = options.body !== undefined ? JSON.stringify(options.body) : undefined;

  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(0, 'timeout', 'La requête a expiré');
    }
    throw new ApiError(0, 'network', 'Impossible de joindre le serveur');
  } finally {
    clearTimeout(timeoutId);
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  const envelope = envelopeSchema(z.unknown()).safeParse(json);

  if (!res.ok) {
    if (envelope.success && envelope.data.error) {
      throw new ApiError(res.status, envelope.data.error.code, envelope.data.error.message);
    }
    throw new ApiError(res.status, 'internal', 'Une erreur interne est survenue');
  }

  const parsed = envelopeSchema(dataSchema).safeParse(json);
  if (!parsed.success || parsed.data.data === undefined) {
    throw new ApiError(res.status, 'internal', 'Une erreur interne est survenue');
  }

  return parsed.data.data;
}
