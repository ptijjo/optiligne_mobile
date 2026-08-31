import { formatServiceDay, serviceDate, shiftServiceDate } from '@/lib/service-date';

describe('serviceDate', () => {
  it('formate YYYY-MM-DD dans Europe/Paris', () => {
    expect(serviceDate(new Date('2026-03-15T23:30:00.000Z'))).toBe('2026-03-16');
  });

  it('décale un jour de service sans casser le mois', () => {
    expect(shiftServiceDate('2026-08-30', 1)).toBe('2026-08-31');
    expect(shiftServiceDate('2026-08-31', -1)).toBe('2026-08-30');
  });

  it('libellé français du jour', () => {
    expect(formatServiceDay('2026-08-31')).toMatch(/31/);
    expect(formatServiceDay('2026-08-31')).toMatch(/août/i);
  });
});
