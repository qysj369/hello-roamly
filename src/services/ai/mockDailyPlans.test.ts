import { describe, expect, it } from 'vitest';
import { buildMockDailyPlans } from '@/services/ai/mockDailyPlans';

describe('buildMockDailyPlans', () => {
  it('includes rich jinan activity copy', () => {
    const { dailyPlans } = buildMockDailyPlans('济南', {
      days: 3,
      budget: { min: 900, max: 1500 },
      interests: ['food'],
      pace: 'balanced',
    });

    expect(dailyPlans[0]?.activities[0]?.description).toContain('趵突泉');
    expect(dailyPlans[0]?.activities[0]?.location).toContain('趵突泉');
    expect(dailyPlans[1]?.title).toContain('大明湖');
  });
});
