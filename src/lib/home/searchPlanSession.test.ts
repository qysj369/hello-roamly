import { describe, expect, it } from 'vitest';
import {
  encodeSearchPlanSessionContent,
  parseSearchPlanFromSessionContent,
  searchPlanFromUserPlan,
  searchPlanGuideText,
  stripSearchPlanSessionMarkup,
} from '@/lib/home/searchPlanSession';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 4,
    peopleType: '情侣',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 2000, tip: '' }],
  globalTips: ['地铁为主'],
  dayList: [
    {
      day: 1,
      title: '外滩闲逛',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '外滩', intro: '必体验' }],
      foods: [],
    },
    {
      day: 2,
      title: '武康路',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '武康路', intro: '' }],
      foods: [],
    },
    {
      day: 3,
      title: '豫园',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '豫园', intro: '' }],
      foods: [],
    },
    {
      day: 4,
      title: '返程',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '静安寺', intro: '' }],
      foods: [],
    },
  ],
};

describe('searchPlanSession', () => {
  it('round-trips a structured itinerary inside saved session text', () => {
    const encoded = encodeSearchPlanSessionContent(plan);
    expect(encoded).toContain('上海 · 4天 · 情侣');
    expect(parseSearchPlanFromSessionContent(encoded)?.baseInfo.targetCity).toBe('上海');
    expect(parseSearchPlanFromSessionContent(encoded)?.dayList).toHaveLength(4);
    expect(stripSearchPlanSessionMarkup(encoded)).toContain('外滩');
    expect(stripSearchPlanSessionMarkup(encoded)).not.toContain('HOLO_SEARCH_PLAN');
  });

  it('reads structured plans and fallback copy from a user plan record', () => {
    const encoded = encodeSearchPlanSessionContent(plan);
    const record: UserPlanRecord = {
      id: 'plan-1',
      userId: 'u1',
      title: '上海4天情侣',
      isPublic: true,
      isSaved: true,
      createdAt: '',
      updatedAt: '',
      content: {
        planId: 'plan-1',
        locationName: '上海',
        lng: 121.47,
        lat: 31.23,
        fullHistory: [
          { role: 'user', content: '上海 4天 情侣' },
          { role: 'assistant', content: encoded },
        ],
      },
    };
    expect(searchPlanFromUserPlan(record)?.dayList[0]?.spots[0]?.name).toBe('外滩');
    expect(searchPlanGuideText(record)).toContain('【预算明细】');
  });

  it('still shows plain copy when old saves have no markup', () => {
    expect(parseSearchPlanFromSessionContent('上海 · 4天 · 情侣\n外滩')).toBeNull();
    expect(stripSearchPlanSessionMarkup('上海 · 4天 · 情侣\n外滩')).toBe('上海 · 4天 · 情侣\n外滩');
  });

  it('rebuilds itinerary cards from old copy-text saves', () => {
    const record: UserPlanRecord = {
      id: 'plan-old',
      userId: 'u1',
      title: '上海4天情侣',
      isPublic: true,
      createdAt: '',
      updatedAt: '',
      content: {
        planId: 'plan-old',
        locationName: '上海',
        lng: 121.47,
        lat: 31.23,
        fullHistory: [
          { role: 'assistant', content: encodeSearchPlanSessionContent(plan).replace(/<!--HOLO_SEARCH_PLAN:[\s\S]*?:HOLO_SEARCH_PLAN-->\n/, '') },
        ],
      },
    };
    expect(searchPlanFromUserPlan(record)?.dayList).toHaveLength(4);
    expect(searchPlanFromUserPlan(record)?.dayList[2]?.spots[0]?.name).toBe('豫园');
  });

  it('prefers the latest assistant turn that still has a valid itinerary', () => {
    const encoded = encodeSearchPlanSessionContent(plan);
    const record: UserPlanRecord = {
      id: 'plan-2',
      userId: 'u1',
      title: '上海4天情侣',
      isPublic: true,
      createdAt: '',
      updatedAt: '',
      content: {
        planId: 'plan-2',
        locationName: '上海',
        lng: 121.47,
        lat: 31.23,
        fullHistory: [
          { role: 'assistant', content: encoded },
          { role: 'assistant', content: '先看这版摘要' },
        ],
      },
    };
    expect(searchPlanFromUserPlan(record)?.dayList).toHaveLength(4);
    expect(searchPlanGuideText(record)).toBe('先看这版摘要');
  });
});
