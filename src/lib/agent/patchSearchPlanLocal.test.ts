import { describe, expect, it } from 'vitest';
import {
  applyEasyWalkLocal,
  applyHolidayRerouteLocal,
  applyRainRerouteLocal,
  lowerSearchPlanBudget,
  replacePlanFoodsFromKnowledge,
  removePlanSpot,
  resizeSearchPlanDays,
  switchSearchPlanPartyLocal,
} from '@/lib/agent/patchSearchPlanLocal';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('patchSearchPlanLocal', () => {
  it('switches Shanghai 3-day party without regenerating a new city', () => {
    const family = switchSearchPlanPartyLocal(friends, '亲子');
    expect(family?.baseInfo.peopleType).toMatch(/亲子/);
    expect(family?.dayList[0]?.title).not.toBe(friends.dayList[0]?.title);
    expect(family?.dayList[0]?.tips).toContain('少走路');
    expect(family?.dayList).toHaveLength(3);
  });

  it('shortens days locally and keeps earlier days', () => {
    const twoDays = resizeSearchPlanDays(friends, 2);
    expect(twoDays?.dayList).toHaveLength(2);
    expect(twoDays?.dayList[0]?.title).toBe(friends.dayList[0]?.title);
    expect(twoDays?.dayList[1]?.title).toContain('返程');
    expect(twoDays?.baseInfo.days).toBe(2);
  });

  it('removes one spot without rewriting other days', () => {
    const next = removePlanSpot(friends, '外滩滨江', 1);
    expect(next?.dayList[0]?.spots.some((spot) => spot.name === '外滩滨江')).toBe(false);
    expect(next?.dayList[1]?.title).toBe(friends.dayList[1]?.title);
  });

  it('puts an indoor rain alt on day 1 without rewriting later days', () => {
    const rainy = applyRainRerouteLocal(friends);
    expect(rainy?.dayList[0]?.spots[0]?.name).toBe('上海城市规划展示馆');
    expect(rainy?.dayList[0]?.title).toContain('上海城市规划展示馆');
    expect(rainy?.globalTips.some((tip) => tip.startsWith('雨天替代'))).toBe(true);
    expect(rainy?.dayList[1]?.title).toBe(friends.dayList[1]?.title);
  });

  it('puts a quieter holiday alt on day 1 without rewriting later days', () => {
    const quiet = applyHolidayRerouteLocal(friends);
    expect(quiet?.dayList[0]?.spots[0]?.name).toBe('北外滩滨江');
    expect(quiet?.dayList[0]?.title).toContain('北外滩滨江');
    expect(quiet?.globalTips.some((tip) => tip.startsWith('节假日分流'))).toBe(true);
    expect(quiet?.dayList[1]?.title).toBe(friends.dayList[1]?.title);
  });

  it('swaps day 1 toward an indoor sit-down spot', () => {
    const easy = applyEasyWalkLocal(friends);
    expect(easy?.dayList[0]?.spots.some((spot) => /博物馆/.test(spot.name))).toBe(true);
    expect(easy?.dayList[0]?.tips).toContain('少走路');
    expect(easy?.dayList[1]?.title).toBe(friends.dayList[1]?.title);
  });

  it('swaps Shanghai restaurants from the knowledge pack', () => {
    const next = replacePlanFoodsFromKnowledge(friends);
    expect(next?.dayList[0]?.foods[0]?.shop).not.toBe('沈大成');
    expect(next?.dayList.map((day) => day.title)).toEqual(friends.dayList.map((day) => day.title));
  });

  it('lowers food and stay without touching the route titles', () => {
    const cheaper = lowerSearchPlanBudget(friends);
    const food = friends.budgetList.find((item) => item.item === '餐饮')!.perPerson;
    const nextFood = cheaper.budgetList.find((item) => item.item === '餐饮')!.perPerson;
    expect(nextFood).toBeLessThan(food);
    expect(cheaper.dayList.map((day) => day.title)).toEqual(friends.dayList.map((day) => day.title));
  });
});
