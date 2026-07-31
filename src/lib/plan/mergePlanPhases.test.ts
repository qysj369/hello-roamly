import { describe, expect, it } from 'vitest';
import { mergePlanPhases } from '@/lib/plan/mergePlanPhases';
import { isMapPlanContentComplete } from '@/lib/plan/mapPlanCompleteness';

describe('mergePlanPhases', () => {
  it('merges phase1 and phase2 into complete plan', () => {
    const phase1 = `【方案简介】\n\n莆田三日穷游，人均预算约1500元，主打海风与小吃。\n\n| 项目 | 金额 |\n| **总计** | **¥1280** |\n\n【行程流水账】\n\nDay1 上午从济南乘高铁抵达莆田。Day2 上午湄洲岛，下午涵江老街。Day3 下午返程济南，末班车别错过。`;
    const phase2 = `【蜗牛提示】\n\n广化寺十元素食很治愈。涵江老街夜市便宜又好吃，本地人常去。\n\n【避坑指南】\n\n岛上海鲜排档慎点。临出发买票会涨价。湄洲岛船班提前查清楚。`;
    const merged = mergePlanPhases(phase1, phase2);
    expect(merged).toContain('【方案简介】');
    expect(merged).toContain('【蜗牛提示】');
    expect(isMapPlanContentComplete(merged)).toBe(true);
    expect(merged).toContain('【避坑指南】');
    expect(merged).toContain('船班提前查清楚。');
  });
});
