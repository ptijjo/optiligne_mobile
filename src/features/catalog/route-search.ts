import { lineCountLabel } from '@/features/catalog/route-kind';
import type { Route } from '@/features/catalog/types';

export const ROUTES_PAGE_SIZE = 10;

export function searchRoutes(routes: Route[], query: string): Route[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return routes;
  }
  return routes.filter(
    (route) =>
      route.shortName.toLowerCase().includes(q) || route.longName.toLowerCase().includes(q),
  );
}

export function paginateRoutes<T>(
  items: T[],
  page: number,
  pageSize: number = ROUTES_PAGE_SIZE,
): { pageItems: T[]; totalPages: number; page: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
    page: safePage,
  };
}

export function routesPageLabel(page: number, totalPages: number, total: number): string {
  return `Page ${page}/${totalPages} · ${lineCountLabel(total)}`;
}

export function emptySearchMessage(): string {
  return 'Aucune ligne ne correspond à votre recherche.';
}
