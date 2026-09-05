/** Libellé retard / avance à partir de delay_s (horloge service API) + conseil régulation. */
export function delayLabel(delayS: number): string {
  const abs = Math.abs(delayS);
  if (!Number.isFinite(delayS) || abs < 60) {
    return 'À l’heure';
  }
  const minutes = Math.max(1, Math.round(abs / 60));
  if (delayS > 0) {
    return `Retard +${minutes} min — enchaîner`;
  }
  return `En avance ${minutes} min — lever le pied`;
}
