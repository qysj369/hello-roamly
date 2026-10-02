import { describe, expect, it } from 'vitest';
import { assembleSearchPlanFromKnowledge } from '@/lib/agent/assembleSearchPlanFromKnowledge';

describe('assembleSearchPlanFromKnowledge', () => {
  it('builds a Hangzhou family plan from the kit', () => {
    const plan = assembleSearchPlanFromKnowledge({
      startCity: '济南',
      targetCity: '杭州市',
      days: 3,
      peopleType: '亲子',
      budget: null,
      theme: null,
    });
    expect(plan?.baseInfo.targetCity).toBe('杭州');
    expect(plan?.dayList).toHaveLength(3);
    expect(plan?.dayList[2]?.title).toContain('返程');
    expect(plan?.dayList[0]?.foods[0]?.shop).toBeTruthy();
    expect(plan?.globalTips[0]).toContain('茶叶博物馆');
  });

  it('builds a Huangshan plan from the kit', () => {
    const plan = assembleSearchPlanFromKnowledge({
      startCity: '济南',
      targetCity: '黄山',
      days: 2,
      peopleType: '亲子',
      budget: null,
      theme: null,
    });
    expect(plan?.baseInfo.targetCity).toBe('黄山');
    expect(plan?.dayList).toHaveLength(2);
    expect(plan?.globalTips[0]).toContain('博物馆');
  });

  it('keeps Huangshan 3-day spots unique and reroutes weekend', () => {
    const plan = assembleSearchPlanFromKnowledge({
      startCity: '济南',
      targetCity: '黄山',
      days: 3,
      peopleType: '亲子',
      budget: null,
      theme: '节假日分流',
    });
    const names = plan?.dayList.flatMap((day) => day.spots.map((spot) => spot.name)) ?? [];
    expect(new Set(names).size).toBe(names.length);
    expect(plan?.dayList[0]?.title).toMatch(/宏村|屯溪|早班/);
    expect(plan?.dayList[0]?.tips).toContain('节假日');
  });

  it('assembles Chongqing locally and rain-reroutes', () => {
    const plan = assembleSearchPlanFromKnowledge({
      startCity: '济南',
      targetCity: '重庆',
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: '雨天改线',
    });
    expect(plan?.baseInfo.targetCity).toBe('重庆');
    expect(plan?.dayList).toHaveLength(3);
    expect(plan?.dayList[0]?.title).toContain('三峡博物馆');
    expect(plan?.dayList[0]?.tips).toContain('下雨');
  });

  it('returns null when the city has no kit', () => {
    expect(
      assembleSearchPlanFromKnowledge({
        startCity: '济南',
        targetCity: '拉萨',
        days: 3,
        peopleType: '好友结伴',
        budget: null,
        theme: null,
      }),
    ).toBeNull();
  });
});
