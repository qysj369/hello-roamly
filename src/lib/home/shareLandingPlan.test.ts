import { describe, expect, it } from 'vitest';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import {
  decodeCompactSharePlan,
  encodeCompactSharePlan,
  planFromShareLandingSearch,
} from '@/lib/home/shareLandingPlan';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('shareLandingPlan', () => {
  it('round-trips a Shanghai friends plan into the gold itinerary', () => {
    const token = encodeCompactSharePlan(friends);
    expect(token.length).toBeGreaterThan(20);
    expect(token.length).toBeLessThan(1400);
    const restored = decodeCompactSharePlan(token);
    expect(restored?.baseInfo.targetCity).toBe('上海');
    expect(restored?.dayList).toHaveLength(3);
    expect(restored?.dayList[0]?.spots[0]?.name).toMatch(/博物馆|外滩/);
  });

  it('opens the packed itinerary from a share query, not an empty homepage', () => {
    const token = encodeCompactSharePlan(friends);
    const plan = planFromShareLandingSearch(`?from=share&city=上海&days=3&party=好友结伴&sp=${token}`);
    expect(plan?.dayList[1]?.spots.some((spot) => /豫园|新天地/.test(spot.name))).toBe(true);
  });

  it('falls back to gold match when only city/days/party are present', () => {
    const plan = planFromShareLandingSearch('?city=上海&days=3&party=情侣&from=share');
    expect(plan?.baseInfo.peopleType).toBe('情侣');
    expect(plan?.dayList[0]?.spots[0]?.name).toMatch(/外滩/);
  });
});
