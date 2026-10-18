import { describe, expect, it } from 'vitest';
import { buildSearchPlanSpeakText } from '@/lib/home/buildSearchPlanSpeakText';
import { TRAVEL_VOICE_FOLLOWUP } from '@/lib/home/travelVoiceIntent';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: '山水徒步',
  },
  budgetList: [{ item: '合计', perPerson: 2600, tip: '' }],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '抵达杭州，漫步西湖',
      hotelArea: '西湖湖滨商圈',
      tips: '',
      traffic: [],
      spots: [{ name: '西湖', intro: '' }],
      foods: [],
    },
  ],
};

describe('buildSearchPlanSpeakText', () => {
  it('summarizes a single-spot fragment without budget, days list or links', () => {
    const text = buildSearchPlanSpeakText(plan);
    expect(text).toContain('杭州3天好友结伴');
    expect(text).toContain('西湖');
    expect(text).toContain(TRAVEL_VOICE_FOLLOWUP);
    expect(text).not.toMatch(/约\d+/);
    expect(text).not.toContain('2600');
    expect(text).not.toContain('未设置预算');
    expect(text).not.toContain('Day 1');
    expect(text).not.toContain('helloroamly.com');
    expect(text.length).toBeLessThanOrEqual(360);
  });
});
