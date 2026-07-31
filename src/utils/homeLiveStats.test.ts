import { describe, expect, it } from 'vitest';
import { countDemoMomentsPublishedToday, isSameCalendarDay } from '@/utils/homeLiveStats';

describe('homeLiveStats', () => {
  it('isSameCalendarDay', () => {
    const now = new Date(2026, 4, 19, 15, 0, 0);
    const sameDay = new Date(2026, 4, 19, 8, 0, 0).toISOString();
    const previousDay = new Date(2026, 4, 18, 23, 0, 0).toISOString();
    expect(isSameCalendarDay(sameDay, now)).toBe(true);
    expect(isSameCalendarDay(previousDay, now)).toBe(false);
  });

  it('countDemoMomentsPublishedToday returns a number', () => {
    expect(countDemoMomentsPublishedToday(new Date('2026-05-19T12:00:00'))).toBeGreaterThanOrEqual(0);
  });
});
