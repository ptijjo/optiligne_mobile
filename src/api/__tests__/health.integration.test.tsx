import { HealthStatus } from '@/api/HealthStatus';
import { useHealth } from '@/api/health';
import { API, http, jsonError, jsonOk } from '@/test/msw/http';
import { renderWithProviders } from '@/test/render';
import { server } from '@/test/msw/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('health + écran statut', () => {
  it('useHealth lit data.status ok', async () => {
    server.use(http.get(`${API}/health`, () => jsonOk({ status: 'ok' })));

    const { result } = renderHook(() => useHealth(), { wrapper });
    await waitFor(() => expect(result.current.data?.status).toBe('ok'));
  });

  it('affiche API connectée et le dépôt provisionné', async () => {
    server.use(http.get(`${API}/health`, () => jsonOk({ status: 'ok' })));

    const screen = renderWithProviders(<HealthStatus />);
    expect(await screen.findByText('API connectée')).toBeTruthy();
    expect(screen.getByText(/fluo57/)).toBeTruthy();
  });

  it('affiche error.message si l’API est injoignable', async () => {
    server.use(
      http.get(`${API}/health`, () => jsonError(502, 'internal', 'Une erreur interne est survenue')),
    );

    const screen = renderWithProviders(<HealthStatus />);
    expect(await screen.findByText('Une erreur interne est survenue')).toBeTruthy();
    expect(screen.getByText('API hors ligne')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Réessayer'));
    expect(await screen.findByText('API hors ligne')).toBeTruthy();
  });
});
