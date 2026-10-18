import { describe, expect, it } from 'vitest';
import { encodeSearchPlanSessionContent } from '@/lib/home/searchPlanSession';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { getSavedUserPlanPosterOutline } from '@/utils/buildSavedUserPlanPoster';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 4,
    peopleType: '情侣',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 2470, tip: '' }],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '抵达上海·梧桐区街巷慢逛',
      hotelArea: '徐家汇',
      tips: '',
      traffic: [],
      spots: [{ name: '武康路', intro: '必体验' }],
      foods: [],
    },
    {
      day: 2,
      title: '外滩源',
      hotelArea: '徐家汇',
      tips: '',
      traffic: [],
      spots: [{ name: '外滩源', intro: '必体验' }],
      foods: [],
    },
    {
      day: 3,
      title: '朱家角古镇慢逛',
      hotelArea: '徐家汇',
      tips: '',
      traffic: [],
      spots: [{ name: '朱家角古镇', intro: '必体验' }],
      foods: [],
    },
    {
      day: 4,
      title: '返程',
      hotelArea: '徐家汇',
      tips: '',
      traffic: [],
      spots: [{ name: '新天地', intro: '必体验' }],
      foods: [],
    },
  ],
};

describe('getSavedUserPlanPosterOutline', () => {
  it('puts the rendered itinerary onto the poster summary and share outline', () => {
    const record: UserPlanRecord = {
      id: 'plan-share-1',
      userId: 'u1',
      title: '上海4天情侣',
      isPublic: true,
      createdAt: '',
      updatedAt: '',
      content: {
        planId: 'plan-share-1',
        locationName: '上海',
        lng: 121.47,
        lat: 31.23,
        fullHistory: [{ role: 'assistant', content: encodeSearchPlanSessionContent(plan) }],
      },
    };
    const outline = getSavedUserPlanPosterOutline(record);
    expect(outline.subtitle).toMatch(/^上海 · 4天 · 情侣 · 约/);
    expect(outline.summary).toContain('不含往返');
    expect(outline.summary).toContain('D3 朱家角古镇');
    expect(outline.summary).toContain('扫码看完整行程');
  });
});
