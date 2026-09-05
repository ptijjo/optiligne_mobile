import { startGuidanceSession } from '@/features/guidance/api';
import { GuidanceScreen } from '@/features/guidance/screens/GuidanceScreen';
import { resetConfig } from '@/config';
import { API, http, jsonError, jsonOk } from '@/test/msw/http';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';
import { act, waitFor } from '@testing-library/react-native';
import type { GuidanceMessage } from '@/ws';

let onGuidance: ((msg: GuidanceMessage) => void) | undefined;

jest.mock('@/ws', () => ({
  connectGuidanceWs: (_sessionId: string, handlers: { onGuidance: (msg: GuidanceMessage) => void }) => {
    onGuidance = handlers.onGuidance;
    return { sendPosition: jest.fn(), close: jest.fn() };
  },
}));

jest.mock('@/features/guidance/location', () => ({
  startGuidanceGps: jest.fn(async () => ({ granted: true, stop: jest.fn() })),
}));

const mockSpeakAlert = jest.fn();
jest.mock('@/features/guidance/speech', () => ({
  speakAlert: (...args: unknown[]) => mockSpeakAlert(...args),
  stopSpeech: jest.fn(),
}));

const sessionPayload = {
  sessionId: 'sess_abc12345',
  tripId: 'T1',
  shape: {
    type: 'LineString',
    coordinates: [
      [6.17, 49.11],
      [6.19, 49.13],
    ],
  },
  stops: [
    { name: 'Forbach', lon: 6.17, lat: 49.11, arrivalSec: 26100, sequence: 1 },
    { name: 'Stiring', lon: 6.19, lat: 49.13, arrivalSec: 27000, sequence: 2 },
  ],
};

describe('guidance — démarrage session', () => {
  beforeEach(() => {
    onGuidance = undefined;
    mockSpeakAlert.mockClear();
  });

  it('POST /guidance/sessions avec périmètre, sans Authorization', async () => {
    server.use(
      http.post(`${API}/guidance/sessions`, async ({ request }) => {
        expect(request.headers.get('Authorization')).toBeNull();
        const body = (await request.json()) as Record<string, string>;
        expect(body).toMatchObject({
          tripId: 'T1',
          date: '2026-08-31',
          operatorCode: 'transavold',
          depotCode: 'fluo57',
        });
        return jsonOk({ sessionId: 'sess_1', tripId: 'T1' });
      }),
    );

    await expect(startGuidanceSession('T1', '2026-08-31')).resolves.toMatchObject({
      sessionId: 'sess_1',
      tripId: 'T1',
      stops: [],
    });
  });

  it('parse les horaires d’arrêts de la session', async () => {
    server.use(http.post(`${API}/guidance/sessions`, () => jsonOk(sessionPayload)));
    await expect(startGuidanceSession('T1', '2026-08-31')).resolves.toMatchObject({
      stops: [
        { name: 'Forbach', arrivalSec: 26100, sequence: 1 },
        { name: 'Stiring', arrivalSec: 27000, sequence: 2 },
      ],
    });
  });

  it('course hors périmètre → trip_not_found', async () => {
    server.use(
      http.post(`${API}/guidance/sessions`, () =>
        jsonError(404, 'trip_not_found', 'Course introuvable.'),
      ),
    );
    await expect(startGuidanceSession('ghost', '2026-08-31')).rejects.toMatchObject({
      status: 404,
      code: 'trip_not_found',
    });
  });

  it('sans dépôt : scope_required, aucun appel', async () => {
    const prev = process.env.EXPO_PUBLIC_DEPOT_ID;
    delete process.env.EXPO_PUBLIC_DEPOT_ID;
    resetConfig();
    try {
      let called = false;
      server.use(
        http.post(`${API}/guidance/sessions`, () => {
          called = true;
          return jsonOk({ sessionId: 'x', tripId: 'T1' });
        }),
      );
      await expect(startGuidanceSession('T1', '2026-08-31')).rejects.toMatchObject({
        code: 'scope_required',
      });
      expect(called).toBe(false);
    } finally {
      process.env.EXPO_PUBLIC_DEPOT_ID = prev;
      resetConfig();
    }
  });

  it('écran démarre la session et affiche la carte', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = {
      tripId: 'T1',
      date: '2026-08-31',
      headsign: 'Forbach',
    };
    server.use(http.post(`${API}/guidance/sessions`, () => jsonOk(sessionPayload)));

    const screen = renderWithProviders(<GuidanceScreen />);
    expect(await screen.findByText('FORBACH')).toBeTruthy();
    expect(screen.getByTestId('guidance-map')).toBeTruthy();
    expect(screen.getByText('En attente de position GPS')).toBeTruthy();
    expect(await screen.findByText('07:15')).toBeTruthy();
  });

  it('bandeau : conseil régulation depuis delay_s API', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = {
      tripId: 'T1',
      date: '2026-08-31',
      headsign: 'Forbach',
    };
    server.use(http.post(`${API}/guidance/sessions`, () => jsonOk(sessionPayload)));

    const screen = renderWithProviders(<GuidanceScreen />);
    await screen.findByText('FORBACH');
    await waitFor(() => expect(onGuidance).toBeDefined());

    act(() => {
      onGuidance?.({
        type: 'guidance',
        frac: 0.2,
        offset_m: 5,
        next_stop: 'Stiring',
        delay_s: -180,
        state: 'on_route',
      });
    });

    expect(
      await screen.findByText(/Stiring · En avance 3 min — lever le pied/),
    ).toBeTruthy();
  });

  it('alerte vocale hors tracé (sans flood)', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = {
      tripId: 'T1',
      date: '2026-08-31',
      headsign: 'Forbach',
    };
    server.use(http.post(`${API}/guidance/sessions`, () => jsonOk(sessionPayload)));

    renderWithProviders(<GuidanceScreen />);
    await waitFor(() => expect(onGuidance).toBeDefined());

    act(() => {
      onGuidance?.({
        type: 'guidance',
        frac: 0.2,
        offset_m: 120,
        next_stop: 'Stiring',
        delay_s: 0,
        state: 'off_route',
      });
    });
    expect(mockSpeakAlert).toHaveBeenCalledWith('Attention, hors tracé.');

    mockSpeakAlert.mockClear();
    act(() => {
      onGuidance?.({
        type: 'guidance',
        frac: 0.21,
        offset_m: 130,
        next_stop: 'Stiring',
        delay_s: 0,
        state: 'off_route',
      });
    });
    expect(mockSpeakAlert).not.toHaveBeenCalled();
  });
});
