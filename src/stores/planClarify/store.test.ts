import { describe, expect, it } from 'vitest';
import { composePlanClarifyQuery, hasCompletePlanClarify, type PlanClarifyFields } from '@/stores/planClarify/store';

const complete: PlanClarifyFields = {
  city: '上海',
  days: 3,
  party: '好友结伴',
  pace: '松弛慢逛',
  budgetYuan: 1500,
  preference: '城市人文',
};

describe('planClarify store helpers', () => {
  it('requires pace before the layered ask is complete', () => {
    expect(hasCompletePlanClarify(complete)).toBe(true);
    expect(hasCompletePlanClarify({ ...complete, pace: null })).toBe(false);
  });

  it('keeps pace in the composed query without turning it into a city name', () => {
    const query = composePlanClarifyQuery(complete, '上海');
    expect(query).toContain('节奏：松弛慢逛');
    expect(query).toContain('【目的地锁定】上海');
    expect(query).toContain('偏好：城市人文');
  });
});
