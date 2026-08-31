/** Date de service GTFS (calendrier Grand Est), YYYY-MM-DD. */
export function serviceDate(now: Date = new Date(), timeZone = 'Europe/Paris'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function shiftServiceDate(date: string, deltaDays: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + deltaDays, 12, 0, 0));
  return serviceDate(shifted);
}

export function formatServiceDay(date: string, timeZone = 'Europe/Paris'): string {
  const [year, month, day] = date.split('-').map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(instant);
}
