import { describe, expect, it } from 'vitest';
import { getSharePlanOutline, sharePlanHeaderMeta } from '@/lib/home/sharePlanOutline';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 3,
    peopleType: '情侣',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 1800, tip: '' }],
  globalTips: ['地铁为主', '带伞', '少糖', '第四条不展示'],
  dayList: [
    {
      day: 1,
      title: '第1天 梧桐漫步',
      hotelArea: '陕西南路',
      tips: '',
      traffic: [],
      spots: [{ name: '武康路', intro: '必体验：散步' }],
      foods: [{ shop: '老盛昌汤包', dish: '汤包', perCost: 30 }],
    },
    {
      day: 2,
      title: '外滩源',
      hotelArea: '',
      tips: '',
      traffic: [],
      spots: [{ name: '外滩源', intro: '必体验' }],
      foods: [],
    },
  ],
};

describe('getSharePlanOutline', () => {
  it('keeps a one-line budget and day highlights without dumping every card', () => {
    const outline = getSharePlanOutline(plan);
    expect(outline.budgetLine).toContain('约');
    expect(outline.budgetLine).toContain('不含往返');
    expect(outline.days).toEqual([
      { day: 1, title: '梧桐漫步', highlight: '武康路 · 老盛昌汤包' },
      { day: 2, title: '外滩源', highlight: '外滩源' },
    ]);
    expect(outline.tips).toEqual(['地铁为主', '带伞', '少糖']);
  });

  it('uses the day highlight sentence when tips exist', () => {
    const withTip: SearchStructuredPlan = {
      ...plan,
      dayList: [
        {
          ...plan.dayList[0]!,
          tips: '黄昏先去武康路，避开安福路夜市人潮。',
        },
      ],
    };
    expect(getSharePlanOutline(withTip).days[0]?.highlight).toBe(
      '【行程亮点】黄昏先去武康路，避开安福路夜市人潮。',
    );
  });

  it('puts the same budget amount in the header and shortens long tips', () => {
    const withLongTips: SearchStructuredPlan = {
      ...plan,
      globalTips: [
        '雨天替代：豫园、外滩可改为上海博物馆、中华艺术宫等室内场馆；徐汇滨江可改为西岸美术馆内参观。',
      ],
    };
    expect(sharePlanHeaderMeta(plan)).toMatch(/^上海 · 3天 · 情侣 · 约/);
    expect(sharePlanHeaderMeta(plan)).not.toContain('未设置预算');
    const tip = getSharePlanOutline(withLongTips).tips[0] ?? '';
    expect(tip.length).toBeLessThanOrEqual(41);
    expect(tip).toContain('雨天替代');
  });
});
