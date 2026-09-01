import { RoutesScreen } from '@/features/catalog/screens/RoutesScreen';
import { StopsScreen } from '@/features/catalog/screens/StopsScreen';
import { TripsScreen } from '@/features/catalog/screens/TripsScreen';
import { UnconfiguredScreen } from '@/features/catalog/screens/UnconfiguredScreen';
import { serviceDate, shiftServiceDate } from '@/lib/service-date';
import { API, http, jsonError, jsonOk } from '@/test/msw/http';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';
import { fireEvent, waitFor } from '@testing-library/react-native';

const schoolA = {
  id: '1006430',
  shortName: '57ECR00',
  longName: 'ELVANGE / CREHANGE',
  routeType: 712,
};

describe('écrans catalogue', () => {
  beforeEach(() => {
    server.use(http.get(`${API}/health`, () => jsonOk({ status: 'ok' })));
  });

  it('affiche les lignes scolaires du dépôt provisionné', async () => {
    server.use(http.get(`${API}/catalog/routes`, () => jsonOk([schoolA])));

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('57ECR00')).toBeTruthy();
    expect(screen.getByText('ELVANGE / CREHANGE')).toBeTruthy();
    expect(screen.getByText('Scolaire')).toBeTruthy();
    expect(screen.getByText('1 ligne')).toBeTruthy();
    expect(screen.queryByText('99XXX00')).toBeNull();
  });

  it('actualise le catalogue au pull-to-refresh', async () => {
    let version = 1;
    server.use(
      http.get(`${API}/catalog/routes`, () =>
        jsonOk(
          version === 1
            ? [schoolA]
            : [{ ...schoolA, shortName: '57NEW00', longName: 'NOUVELLE LIGNE' }],
        ),
      ),
    );

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('57ECR00')).toBeTruthy();

    version = 2;
    const list = screen.getByTestId('routes-list');
    list.props.refreshControl.props.onRefresh();
    await waitFor(() => expect(screen.getByText('57NEW00')).toBeTruthy());
    expect(screen.getByText('NOUVELLE LIGNE')).toBeTruthy();
  });

  it('filtre les lignes via la barre de recherche', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, () =>
        jsonOk([
          schoolA,
          {
            id: '1006275',
            shortName: '57R004',
            longName: 'CREUTZWALD / METZ',
            routeType: 204,
          },
        ]),
      ),
    );

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('57ECR00')).toBeTruthy();
    expect(screen.getByText('57R004')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Rechercher une ligne'), 'metz');
    expect(screen.getByText('57R004')).toBeTruthy();
    expect(screen.queryByText('57ECR00')).toBeNull();
  });

  it('paginate les lignes par pages de dix', async () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      id: String(index + 1),
      shortName: `57E${String(index).padStart(2, '0')}`,
      longName: `LIGNE ${index}`,
      routeType: 712,
    }));
    server.use(http.get(`${API}/catalog/routes`, () => jsonOk(many)));

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('57E00')).toBeTruthy();
    expect(screen.getByText('57E09')).toBeTruthy();
    expect(screen.queryByText('57E10')).toBeNull();
    expect(screen.getByText('Page 1/2 · 12 lignes')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Page suivante'));
    expect(await screen.findByText('57E10')).toBeTruthy();
    expect(screen.getByText('Page 2/2 · 12 lignes')).toBeTruthy();
  });

  it('navigue vers les courses au tap sur une ligne', async () => {
    server.use(http.get(`${API}/catalog/routes`, () => jsonOk([schoolA])));
    const screen = renderWithProviders(<RoutesScreen />);
    fireEvent.press(await screen.findByLabelText('Ligne 57ECR00'));
    const router = require('expo-router') as {
      __router: { push: jest.Mock };
    };
    expect(router.__router.push).toHaveBeenCalledWith({
      pathname: '/routes/[id]',
      params: { id: '1006430' },
    });
  });

  it('affiche le message API si le dépôt est refusé', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, () =>
        jsonError(400, 'scope_required', 'Transporteur et dépôt obligatoires.'),
      ),
    );

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('Transporteur et dépôt obligatoires.')).toBeTruthy();
  });

  it('filtre en trois groupes : régulière, associée, scolaire', async () => {
    server.use(
      http.get(`${API}/catalog/routes`, () =>
        jsonOk([
          schoolA,
          {
            id: '1006275',
            shortName: '57R004',
            longName: 'CREUTZWALD / METZ',
            routeType: 204,
          },
          {
            id: '1006333',
            shortName: '57SAV34',
            longName: 'ADELANGE / ST-AVOLD',
            routeType: 713,
          },
        ]),
      ),
    );

    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('57R004')).toBeTruthy();
    expect(screen.getByText('57ECR00')).toBeTruthy();
    expect(screen.getByText('57SAV34')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Régulières'));
    expect(screen.getByText('57R004')).toBeTruthy();
    expect(screen.queryByText('57ECR00')).toBeNull();
    expect(screen.queryByText('57SAV34')).toBeNull();

    fireEvent.press(screen.getByLabelText('Associées'));
    expect(screen.getByText('57SAV34')).toBeTruthy();
    expect(screen.queryByText('57R004')).toBeNull();

    fireEvent.press(screen.getByLabelText('Scolaires'));
    expect(screen.getByText('57ECR00')).toBeTruthy();
    expect(screen.queryByText('57R004')).toBeNull();
  });

  it('liste vide : aucune ligne pour ce dépôt', async () => {
    server.use(http.get(`${API}/catalog/routes`, () => jsonOk([])));
    const screen = renderWithProviders(<RoutesScreen />);
    expect(await screen.findByText('Aucune ligne pour ce dépôt.')).toBeTruthy();
  });

  it('affiche les courses et le message 404', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = { id: '1006430' };
    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, () =>
        jsonOk([{ id: 'T1', headsign: 'CREHANGE', routeId: '1006430', departureSec: 26100 }]),
      ),
    );

    const ok = renderWithProviders(<TripsScreen />);
    expect(await ok.findByText('CREHANGE')).toBeTruthy();
    expect(ok.getByText('07:15')).toBeTruthy();

    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, () =>
        jsonError(404, 'route_not_found', 'Ligne ou course introuvable.'),
      ),
    );
    const ko = renderWithProviders(<TripsScreen />);
    expect(await ko.findByText('Ligne ou course introuvable.')).toBeTruthy();
  });

  it('tap sur une course ouvre la liste des arrêts', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = { id: '1006430' };
    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, () =>
        jsonOk([{ id: 'T1', headsign: 'CREHANGE', routeId: '1006430', departureSec: 26100 }]),
      ),
    );

    const screen = renderWithProviders(<TripsScreen />);
    fireEvent.press(await screen.findByLabelText('Course 07:15 CREHANGE'));
    const router = require('expo-router') as { __router: { push: jest.Mock } };
    expect(router.__router.push).toHaveBeenCalledWith({
      pathname: '/trips/[tripId]',
      params: expect.objectContaining({ tripId: 'T1', headsign: 'CREHANGE' }),
    });
  });

  it('affiche les arrêts de la course et démarre le guidage', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = {
      tripId: 'T1',
      date: '2026-08-30',
      headsign: 'CREHANGE',
    };
    server.use(
      http.get(`${API}/catalog/trips/T1/stops`, () =>
        jsonOk([
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
        ]),
      ),
    );

    const screen = renderWithProviders(<StopsScreen />);
    expect(await screen.findByText('ELVANGE')).toBeTruthy();
    expect(screen.getByLabelText('Arrêt 2 CREHANGE 07:30')).toBeTruthy();
    expect(screen.getByText('07:15')).toBeTruthy();
    expect(screen.getByText('07:30')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Lancer la navigation'));
    const router = require('expo-router') as { __router: { push: jest.Mock } };
    expect(router.__router.push).toHaveBeenCalledWith({
      pathname: '/guidance/[tripId]',
      params: expect.objectContaining({ tripId: 'T1', headsign: 'CREHANGE', date: '2026-08-30' }),
    });
  });

  it('course hors périmètre : message Course introuvable', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = {
      tripId: 'HORS',
      date: '2026-08-30',
    };
    server.use(
      http.get(`${API}/catalog/trips/HORS/stops`, () =>
        jsonError(404, 'trip_not_found', 'Course introuvable.'),
      ),
    );
    const screen = renderWithProviders(<StopsScreen />);
    expect(await screen.findByText('Course introuvable.')).toBeTruthy();
  });

  it('course sans headsign : affiche l’id', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = { id: '1006430' };
    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, () =>
        jsonOk([{ id: 'T-VIDE', headsign: '', routeId: '1006430', departureSec: 0 }]),
      ),
    );
    const screen = renderWithProviders(<TripsScreen />);
    expect((await screen.findAllByText('T-VIDE')).length).toBeGreaterThan(0);
  });

  it('aucune course aujourd’hui', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = { id: '1006430' };
    server.use(http.get(`${API}/catalog/routes/1006430/trips`, () => jsonOk([])));
    const screen = renderWithProviders(<TripsScreen />);
    expect(await screen.findByText('Aucune course pour ce jour.')).toBeTruthy();
  });

  it('jour suivant recharge les courses de cette date', async () => {
    (global as { __routeParams?: Record<string, string> }).__routeParams = { id: '1006430' };
    const today = serviceDate();
    const next = shiftServiceDate(today, 1);
    server.use(
      http.get(`${API}/catalog/routes/1006430/trips`, ({ request }) => {
        const date = new URL(request.url).searchParams.get('date');
        if (date === next) {
          return jsonOk([
            { id: 'T-LUN', headsign: 'CREHANGE', routeId: '1006430', departureSec: 28800 },
          ]);
        }
        return jsonOk([]);
      }),
    );

    const screen = renderWithProviders(<TripsScreen />);
    expect(await screen.findByText('Aucune course pour ce jour.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Jour suivant'));
    expect(await screen.findByText('CREHANGE')).toBeTruthy();
  });

  it('écran bloquant si appareil non configuré', () => {
    const screen = renderWithProviders(<UnconfiguredScreen />);
    expect(screen.getByText('Appareil non configuré')).toBeTruthy();
  });
});
