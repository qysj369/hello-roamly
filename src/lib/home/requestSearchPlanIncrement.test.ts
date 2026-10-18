import { describe, expect, it, vi } from 'vitest';
import { requestSearchPlanIncrement } from '@/lib/home/requestSearchPlanIncrement';
import { SearchStructuredPlanApiError } from '@/services/ai/api/fetchSearchStructuredPlan';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

vi.mock('@/services/ai/api/fetchSearchStructuredPlan', async () => {
  const actual = await vi.importActual<typeof import('@/services/ai/api/fetchSearchStructuredPlan')>(
    '@/services/ai/api/fetchSearchStructuredPlan',
  );
  return {
    ...actual,
    fetchSearchPlanIncrementRaw: vi.fn(),
  };
});

import { fetchSearchPlanIncrementRaw } from '@/services/ai/api/fetchSearchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 1,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 900, tip: '' }],
  globalTips: ['带伞'],
  dayList: [
    {
      day: 1,
      title: '第1天',
      hotelArea: '西湖',
      tips: '慢走',
      traffic: [{ desc: '地铁' }],
      spots: [{ name: '西湖', intro: '湖' }],
      foods: [{ shop: '奎元馆', dish: '面', perCost: 20 }],
    },
  ],
};

describe('requestSearchPlanIncrement', () => {
  it('网络失败保留调用方原行程语义：返回 error 且不抛', async () => {
    vi.mocked(fetchSearchPlanIncrementRaw).mockRejectedValueOnce(
      new SearchStructuredPlanApiError('网络超时'),
    );
    const result = await requestSearchPlanIncrement(plan, 'spots');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('网络');
  });

  it('只合并景点介绍', async () => {
    const incoming = {
      ...plan,
      budgetList: [{ item: '合计', perPerson: 1, tip: '' }],
      dayList: [
        {
          ...plan.dayList[0]!,
          spots: [{ name: '西湖', intro: ' mist 苏堤白堤慢慢走' }],
        },
      ],
    };
    vi.mocked(fetchSearchPlanIncrementRaw).mockResolvedValueOnce(JSON.stringify(incoming));
    const result = await requestSearchPlanIncrement(plan, 'spots');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.budgetList[0]?.perPerson).toBe(900);
      expect(result.plan.dayList[0]?.spots[0]?.intro).toContain('苏堤');
      expect(result.plan.dayList[0]?.foods).toEqual(plan.dayList[0]?.foods);
    }
  });
});
