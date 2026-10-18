import { describe, expect, it } from 'vitest';
import { formatSpiralPlanVoice } from '@/lib/agent/spiralPlanVoice';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '青岛',
    days: 2,
    peopleType: '情侣',
    budget: null,
    theme: null,
  },
  budgetList: [],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '老城闲逛',
      hotelArea: '市南',
      tips: '',
      traffic: [],
      spots: [{ name: '栈桥', intro: '海边木栈，适合慢慢走' }],
      foods: [],
    },
    {
      day: 2,
      title: '山海',
      hotelArea: '市南',
      tips: '',
      traffic: [],
      spots: [{ name: '八大关', intro: '梧桐路与老别墅' }],
      foods: [],
    },
  ],
};

describe('formatSpiralPlanVoice', () => {
  it('writes three inspiration voices without booking language', () => {
    const story = formatSpiralPlanVoice(plan, 'story');
    const verse = formatSpiralPlanVoice(plan, 'verse');
    const guide = formatSpiralPlanVoice(plan, 'guide');
    expect(story).toContain('青岛');
    expect(story).toContain('栈桥');
    expect(verse).toContain('八大关');
    expect(guide).toContain('地理');
    for (const text of [story, verse, guide]) {
      expect(text).not.toMatch(/预订|下单|组团|旅行社|订票/);
    }
  });
});
