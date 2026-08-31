import { listRoutes, listTripStops, listTrips } from '@/features/catalog/api';
import { resetConfig } from '@/config';
import { API, http, jsonError, jsonOk } from '@/test/msw/http';
import { server } from '@/test/msw/server';

const schoolA = {
  id: '1006430',
  shortName: '57ECR00',
  longName: 'ELVANGE / CREHANGE',
  routeType: 712,
};

const schoolB = {
  id: '9999999',
  shortName: '99XXX00',
  longName: 'DEPOT B UNIQUEMENT',
  routeType: 713,
};

describe('catalogue API — contrat optiligne_back', () => {
  it('envoie operator_code et depot_code, jamais Authorization', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('operator_code')).toBe('transavold');
        expect(url.searchParams.get('depot_code')).toBe('fluo57');
        expect(request.headers.get('Authorization')).toBeNull();
        return jsonOk([schoolA]);
      }),
    );

    await expect(listRoutes()).resolves.toEqual([schoolA]);
  });

  it('dépôt A ne reçoit pas les lignes du dépôt B', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, ({ request }) => {
        const depot = new URL(request.url).searchParams.get('depot_code');
        if (depot === 'fluo57') {
          return jsonOk([schoolA]);
        }
        return jsonOk([schoolB]);
      }),
    );

    const a = await listRoutes();
    expect(a.map((r) => r.id)).toEqual(['1006430']);
    expect(a.map((r) => r.shortName)).not.toContain('99XXX00');
  });

  it('sans dépôt : scope_required, aucun appel HTTP', async () => {
    const prev = process.env.EXPO_PUBLIC_DEPOT_ID;
    delete process.env.EXPO_PUBLIC_DEPOT_ID;
    resetConfig();

    try {
      let called = false;
      server.use(
        http.get(`${API}/catalog/routes`, () => {
          called = true;
          return jsonOk([]);
        }),
      );

      await expect(listRoutes()).rejects.toMatchObject({
        status: 400,
        code: 'scope_required',
      });
      expect(called).toBe(false);
    } finally {
      process.env.EXPO_PUBLIC_DEPOT_ID = prev;
      resetConfig();
    }
  });

  it('courses du jour : date + périmètre', async () => {
    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('date')).toBe('2026-08-30');
        expect(url.searchParams.get('operator_code')).toBe('transavold');
        expect(url.searchParams.get('depot_code')).toBe('fluo57');
        return jsonOk([{ id: 'T1', headsign: 'CREHANGE', routeId: '1006430', departureSec: 26100 }]);
      }),
    );

    await expect(listTrips('1006430', '2026-08-30')).resolves.toEqual([
      { id: 'T1', headsign: 'CREHANGE', routeId: '1006430', departureSec: 26100 },
    ]);
  });

  it('ligne hors périmètre → 404 route_not_found', async () => {
    server.use(
      http.get(`${API}/catalog/routes/ghost/trips`, () =>
        jsonError(404, 'route_not_found', 'Ligne ou course introuvable.'),
      ),
    );

    await expect(listTrips('ghost', '2026-08-30')).rejects.toMatchObject({
      status: 404,
      code: 'route_not_found',
      message: 'Ligne ou course introuvable.',
    });
  });

  it('refuse une course sans date', async () => {
    await expect(listTrips('1006430', '')).rejects.toMatchObject({
      code: 'scope_required',
    });
  });

  it('arrêts d’une course : périmètre + ordre de passage', async () => {
    server.use(
      http.get(`${API}/catalog/trips/T1/stops`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('operator_code')).toBe('transavold');
        expect(url.searchParams.get('depot_code')).toBe('fluo57');
        expect(request.headers.get('Authorization')).toBeNull();
        return jsonOk([
          {
            stopId: 'S1',
            name: 'ELVANGE',
            sequence: 1,
            arrivalSec: 26100,
            departureSec: 26100,
          },
          {
            stopId: 'S2',
            name: 'CREHANGE',
            sequence: 2,
            arrivalSec: 27000,
            departureSec: 27000,
          },
        ]);
      }),
    );

    await expect(listTripStops('T1')).resolves.toEqual([
      {
        stopId: 'S1',
        name: 'ELVANGE',
        sequence: 1,
        arrivalSec: 26100,
        departureSec: 26100,
      },
      {
        stopId: 'S2',
        name: 'CREHANGE',
        sequence: 2,
        arrivalSec: 27000,
        departureSec: 27000,
      },
    ]);
  });

  it('course hors périmètre → 404 trip_not_found', async () => {
    server.use(
      http.get(`${API}/catalog/trips/HORS/stops`, () =>
        jsonError(404, 'trip_not_found', 'Course introuvable.'),
      ),
    );

    await expect(listTripStops('HORS')).rejects.toMatchObject({
      status: 404,
      code: 'trip_not_found',
      message: 'Course introuvable.',
    });
  });
});
