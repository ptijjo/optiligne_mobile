import {
  emptySearchMessage,
  paginateRoutes,
  ROUTES_PAGE_SIZE,
  routesPageLabel,
  searchRoutes,
} from '@/features/catalog/route-search';
import type { Route } from '@/features/catalog/types';

const routes: Route[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  shortName: `57E${String(index).padStart(2, '0')}`,
  longName: `LIGNE ${index}`,
  routeType: 712,
}));

describe('route-search', () => {
  it('filtre par code ou destination', () => {
    expect(searchRoutes(routes, '57E01').map((r) => r.shortName)).toEqual(['57E01']);
    expect(searchRoutes(routes, 'ligne 3').map((r) => r.shortName)).toEqual(['57E03']);
    expect(searchRoutes(routes, '')).toHaveLength(12);
  });

  it('paginate les résultats', () => {
    const first = paginateRoutes(routes, 1, ROUTES_PAGE_SIZE);
    expect(first.pageItems).toHaveLength(10);
    expect(first.totalPages).toBe(2);

    const second = paginateRoutes(routes, 2, ROUTES_PAGE_SIZE);
    expect(second.pageItems).toHaveLength(2);
    expect(second.page).toBe(2);
  });

  it('libellés pagination et recherche vide', () => {
    expect(routesPageLabel(1, 3, 28)).toBe('Page 1/3 · 28 lignes');
    expect(emptySearchMessage()).toMatch(/recherche/);
  });
});
