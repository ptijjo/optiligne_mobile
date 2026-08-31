import { api } from '@/api/client';
import { ApiError, isApiError } from '@/api/errors';
import { getHealth, healthSchema } from '@/api/health';
import { send } from '@/api/http';
import { API, http, jsonError, jsonOk } from '@/test/msw/http';
import { server } from '@/test/msw/server';
import { z } from 'zod';

describe('client API — contrat optiligne_back', () => {
  it('GET /health lit data.status ok (envelope)', async () => {
    server.use(
      http.get(`${API}/health`, () => jsonOk({ status: 'ok' })),
    );

    await expect(getHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('n’envoie jamais de header Authorization', async () => {
    server.use(
      http.get(`${API}/health`, ({ request }) => {
        expect(request.headers.get('Authorization')).toBeNull();
        return jsonOk({ status: 'ok' });
      }),
    );

    await getHealth();
  });

  it('propage error.code scope_required', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, () =>
        jsonError(400, 'scope_required', 'Dépôt requis.'),
      ),
    );

    await expect(
      api.get('/catalog/routes', z.unknown(), {
        query: { depot_id: '', operator_id: '' },
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'scope_required',
      message: 'Dépôt requis.',
    });
  });

  it('propage 404 trip_not_found (hors périmètre = absent)', async () => {
    server.use(
      http.get(`${API}/catalog/routes/ghost`, () =>
        jsonError(404, 'trip_not_found', 'Course introuvable.'),
      ),
    );

    await expect(api.get('/catalog/routes/ghost', z.unknown())).rejects.toMatchObject({
      status: 404,
      code: 'trip_not_found',
      message: 'Course introuvable.',
    });
  });

  it('envoie depot_id et operator_id en query', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('depot_code')).toBe('fluo57');
        expect(url.searchParams.get('operator_code')).toBe('transavold');
        expect(request.headers.get('Authorization')).toBeNull();
        return jsonOk([]);
      }),
    );

    await expect(
      api.get('/catalog/routes', z.array(z.unknown()), {
        query: {
          depot_code: 'fluo57',
          operator_code: 'transavold',
        },
      }),
    ).resolves.toEqual([]);
  });

  it('5xx sans envelope → message générique UI', async () => {
    server.use(
      http.get(`${API}/health`, () => new Response('oops', { status: 502 })),
    );

    try {
      await getHealth();
      throw new Error('aurait dû échouer');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('internal');
      expect((error as ApiError).message).toBe('Une erreur interne est survenue');
    }
  });

  it('timeout → code timeout', async () => {
    server.use(
      http.get(
        `${API}/health`,
        () =>
          new Promise(() => {
            /* jamais */
          }),
      ),
    );

    await expect(send('/health', healthSchema, { timeoutMs: 30 })).rejects.toMatchObject({
      code: 'timeout',
      message: 'La requête a expiré',
    });
  });

  it('parse envelope invalide → erreur interne', async () => {
    server.use(http.get(`${API}/health`, () => jsonOk({ status: 'nope' })));

    await expect(getHealth()).rejects.toMatchObject({
      code: 'internal',
      message: 'Une erreur interne est survenue',
    });
  });

  it('POST envoie un body JSON sans Authorization', async () => {
    server.use(
      http.post(`${API}/guidance/sessions`, async ({ request }) => {
        expect(request.headers.get('Authorization')).toBeNull();
        expect(await request.json()).toEqual({ trip_id: 'T1' });
        return jsonOk({ id: 'clsessiondev00000000000001' });
      }),
    );

    await expect(
      api.post('/guidance/sessions', { trip_id: 'T1' }, z.object({ id: z.string() })),
    ).resolves.toEqual({ id: 'clsessiondev00000000000001' });
  });

  it('fetch rejeté → code network', async () => {
    server.use(
      http.get(`${API}/health`, () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    await expect(getHealth()).rejects.toMatchObject({
      code: 'network',
      message: 'Impossible de joindre le serveur',
    });
  });

  it('isApiError reconnaît une ApiError', () => {
    expect(isApiError(new ApiError(404, 'trip_not_found', 'Course introuvable.'))).toBe(true);
    expect(isApiError(new Error('nope'))).toBe(false);
  });
});

