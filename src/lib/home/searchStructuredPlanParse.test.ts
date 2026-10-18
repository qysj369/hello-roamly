import { describe, expect, it } from 'vitest';
import { extractSearchParams } from '@/lib/home/extractSearchParams';
import {
  parseSearchStructuredPlan,
  sanitizeSearchPlanRaw,
  toSearchPlanRequest,
} from '@/lib/home/searchStructuredPlanParse';

const validPlan = {
  baseInfo: {
    startCity: '济南历下绿城百合花园',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: '山水徒步',
  },
  budgetList: [{ item: '合计', perPerson: 1800, tip: '' }],
  dayList: [
    { day: 1, title: '第1天', traffic: [{ desc: '高铁' }], spots: [], foods: [], tips: '', hotelArea: '西湖' },
    { day: 2, title: '第2天', traffic: [{ desc: '地铁' }], spots: [], foods: [], tips: '', hotelArea: '西湖' },
    { day: 3, title: '第3天', traffic: [{ desc: '返程' }], spots: [], foods: [], tips: '', hotelArea: '西湖' },
  ],
  globalTips: ['带伞'],
};

describe('searchStructuredPlanParse', () => {
  it('验收前置：不设预算 + 山水 + 好友结伴', () => {
    const params = extractSearchParams('从济南出发，好友结伴，杭州玩3天，不设预算，山水主题');
    expect(params).toMatchObject({
      startCity: '济南历下绿城百合花园',
      targetCity: '杭州',
      days: 3,
      peopleType: '好友结伴',
      budget: undefined,
      theme: '山水徒步',
    });
    expect(toSearchPlanRequest(params)).toMatchObject({
      targetCity: '杭州',
      days: 3,
      budget: null,
      theme: '山水徒步',
    });
  });

  it('剔除 ```json 围栏后能解析', () => {
    const raw = `前言不要\n\`\`\`json\n${JSON.stringify(validPlan)}\n\`\`\``;
    expect(sanitizeSearchPlanRaw(raw).startsWith('{')).toBe(true);
    const plan = parseSearchStructuredPlan(raw, 3);
    expect(plan?.dayList).toHaveLength(3);
    expect(plan?.baseInfo.budget).toBeNull();
  });

  it('dayList 长度不等于天数则失败', () => {
    expect(parseSearchStructuredPlan(JSON.stringify(validPlan), 2)).toBeNull();
    expect(parseSearchStructuredPlan('不是JSON', 3)).toBeNull();
    expect(parseSearchStructuredPlan('{"budgetList":[]}', 3)).toBeNull();
  });
});
