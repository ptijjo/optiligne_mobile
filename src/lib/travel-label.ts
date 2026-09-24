/** Libellé ETA trajet restant (travel_s API, estimation bus). */
export function travelLabel(travelS: number): string {
  if (!Number.isFinite(travelS) || travelS < 30) {
    return '';
  }
  const minutes = Math.max(1, Math.round(travelS / 60));
  return `ETA ${minutes} min`;
}

/** Bandeau : prochain arrêt · ETA · avance/retard. */
export function guidanceBannerLabel(
  nextStop: string,
  delayS: number,
  travelS: number,
  delayLabelFn: (s: number) => string,
): string {
  return [nextStop, travelLabel(travelS), delayLabelFn(delayS)].filter(Boolean).join(' · ');
}
