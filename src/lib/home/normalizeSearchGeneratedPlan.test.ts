import { describe, expect, it } from 'vitest';
import { normalizeSearchGeneratedPlan } from '@/lib/home/normalizeSearchGeneratedPlan';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 1,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 1, tip: '' }],
  dayList: [
    {
      day: 1,
      title: '西湖慢逛',
      hotelArea: '湖滨',
      tips: '绕开断桥主队，去长桥看湖；奎元馆必点片儿川。',
      traffic: [],
      spots: [],
      foods: [{ shop: '奎元馆', dish: '奎元馆', perCost: 30 }],
    },
  ],
  globalTips: ['外滩下雨进博物馆', '周末换北外滩', '用大都会APP'],
};

describe('normalizeSearchGeneratedPlan', () => {
  it('keeps dish text and prefixes exclusive tips', () => {
    const out = normalizeSearchGeneratedPlan(plan);
    expect(out.globalTips[0]).toMatch(/^雨天替代：/);
    expect(out.globalTips[1]).toMatch(/^节假日分流：/);
    expect(out.globalTips[2]).toMatch(/^本地交通：/);
    expect(out.dayList[0]?.tips).toContain('片儿川');
  });
});
