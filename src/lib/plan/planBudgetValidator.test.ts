import { describe, expect, it } from 'vitest';
import {
  extractIntroBudgetTotal,
  sumItineraryExplicitCosts,
  validatePlanBudget,
} from '@/lib/plan/planBudgetValidator';

const samplePlan = `【方案简介】

莆田 3 天穷游。

| 项目 | 金额 | 节省技巧 |
| 交通 | ¥180 | 提前买票 |
| 餐饮 | ¥100 | 老城小吃 |
| **总计** | **¥1280** | |

【行程流水账】

Day1 高铁约 ¥180，午餐 ¥40。Day2 船票 ¥50，晚餐 ¥60。

【蜗牛提示】

老城傍晚免费逛。

【避坑指南】

别在码头被宰。`;

describe('planBudgetValidator', () => {
  it('extracts intro total from table', () => {
    expect(extractIntroBudgetTotal(samplePlan)).toBe(1280);
  });

  it('sums itinerary explicit costs', () => {
    const sections = samplePlan.split('【行程流水账】')[1] ?? '';
    expect(sumItineraryExplicitCosts(sections)).toBe(330);
  });

  it('flags mismatch beyond tolerance', () => {
    const result = validatePlanBudget(samplePlan);
    expect(result.withinTolerance).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.footnote).toContain('预算校验');
  });
});
