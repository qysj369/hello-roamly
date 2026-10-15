import { describe, expect, it } from 'vitest';
import { companionSketchToSearchPlan } from '@/lib/snail-flight/companionPlan';

describe('companionSketchToSearchPlan', () => {
  it('keeps origin dest and prose so butler chips can attach', () => {
    const plan = companionSketchToSearchPlan({
      startCity: '济南历下',
      targetCity: '青岛',
      text: '海风带着盐。\n第二天沿海走走。\n傍晚人声变轻。',
    });
    expect(plan.baseInfo.startCity).toBe('济南历下');
    expect(plan.baseInfo.targetCity).toBe('青岛');
    expect(plan.baseInfo.peopleType).toBe('好友结伴');
    expect(plan.dayList).toHaveLength(3);
    expect(plan.globalTips[0]).toContain('海风');
  });
});
