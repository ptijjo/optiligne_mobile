import type { Route } from '@/features/catalog/types';

export type RouteKind = 'all' | 'reguliere' | 'associee' | 'scolaire';

const ROUTE_TYPE_COACH = 204;
const ROUTE_TYPE_SCHOOL_PUBLIC = 713;
const ROUTE_TYPE_SCHOOL_BUS = 712;

export function routeKind(route: Route): Exclude<RouteKind, 'all'> {
  // Priorité au route_type GTFS (corrigé côté admin) — le préfixe 57R/57S/57E
  // ne sert que de repli si le type est inconnu / absent.
  switch (route.routeType) {
    case ROUTE_TYPE_COACH:
    case 3:
      return 'reguliere';
    case ROUTE_TYPE_SCHOOL_BUS:
      return 'scolaire';
    case ROUTE_TYPE_SCHOOL_PUBLIC:
      return 'associee';
    default:
      break;
  }
  if (/^57R/i.test(route.shortName)) {
    return 'reguliere';
  }
  if (/^57S/i.test(route.shortName)) {
    return 'associee';
  }
  if (/^57E/i.test(route.shortName)) {
    return 'scolaire';
  }
  return 'scolaire';
}

export function filterRoutes(routes: Route[], kind: RouteKind): Route[] {
  switch (kind) {
    case 'all':
      return routes;
    case 'reguliere':
    case 'associee':
    case 'scolaire':
      return routes.filter((route) => routeKind(route) === kind);
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function kindLabel(kind: Exclude<RouteKind, 'all'>): string {
  switch (kind) {
    case 'reguliere':
      return 'Régulières';
    case 'associee':
      return 'Associées';
    case 'scolaire':
      return 'Scolaires';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function kindBadge(kind: Exclude<RouteKind, 'all'>): string {
  switch (kind) {
    case 'reguliere':
      return 'Régulière';
    case 'associee':
      return 'Associée';
    case 'scolaire':
      return 'Scolaire';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function lineCountLabel(count: number): string {
  return count <= 1 ? `${count} ligne` : `${count} lignes`;
}

export function emptyKindMessage(kind: RouteKind): string {
  switch (kind) {
    case 'all':
      return 'Aucune ligne pour ce dépôt.';
    case 'reguliere':
      return 'Aucune ligne régulière pour ce dépôt.';
    case 'associee':
      return 'Aucune ligne associée pour ce dépôt.';
    case 'scolaire':
      return 'Aucune ligne scolaire pour ce dépôt.';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
