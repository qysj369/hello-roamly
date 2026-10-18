import { describe, expect, it } from 'vitest';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { PLAN_DAY_PHOTO_FALLBACK, resolveItineraryDayPhoto } from '@/lib/home/resolveItineraryDayPhoto';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const couple = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '情侣',
  budget: null,
  theme: null,
})!;

describe('resolveItineraryDayPhoto', () => {
  it('does not crash when the destination has no city atmosphere kit', () => {
    const qingdao: SearchStructuredPlan = {
      baseInfo: {
        startCity: '济南',
        targetCity: '青岛',
        days: 1,
        peopleType: '情侣',
        budget: null,
        theme: null,
      },
      budgetList: [],
      globalTips: [],
      dayList: [
        {
          day: 1,
          title: '海边闲逛',
          hotelArea: '市南',
          tips: '',
          traffic: [],
          spots: [{ name: '栈桥', intro: '慢慢走' }],
          foods: [],
        },
      ],
    };
    expect(() => resolveItineraryDayPhoto(qingdao, qingdao.dayList[0]!, new Set())).not.toThrow();
    const photo = resolveItineraryDayPhoto(qingdao, qingdao.dayList[0]!, new Set());
    expect(photo.src).toBeTruthy();
  });

  it('matches Shanghai couple D1–D3 to real photos, never the empty caption', () => {
    const used = new Set<string>();
    const photos = couple.dayList.map((day) => resolveItineraryDayPhoto(couple, day, used));
    expect(photos).toHaveLength(3);
    expect(photos.every((photo) => photo.src && photo.src !== PLAN_DAY_PHOTO_FALLBACK)).toBe(true);
    expect(photos[2]?.src).toMatch(/xuhui-river|bund|shanghai/);
    expect(new Set(photos.map((photo) => photo.src)).size).toBeGreaterThan(1);
  });
});
