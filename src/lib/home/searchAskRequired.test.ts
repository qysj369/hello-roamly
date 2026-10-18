import { describe, expect, it } from 'vitest';
import { extractSearchParams } from '@/lib/home/extractSearchParams';
import {
  SEARCH_ASK_PROMPTS,
  SEARCH_OPTIONAL_BUDGET_LABEL,
  SEARCH_OPTIONAL_THEME_LABEL,
  applySearchAskAnswer,
  buildSearchExtractLaunchQuery,
  getMissRequiredField,
} from '@/lib/home/searchAskRequired';

describe('环节3：分层追问字段', () => {
  it('测试1：去杭州玩 → 先问天数再问人群', () => {
    const params = extractSearchParams('去杭州玩');
    expect(params.targetCity).toBe('杭州');
    expect(getMissRequiredField(params)).toEqual(['days', 'peopleType']);
    expect(SEARCH_ASK_PROMPTS[getMissRequiredField(params)[0]!]).toBe('计划游玩几天？');

    const afterDays = applySearchAskAnswer(params, 'days', '3天');
    expect(afterDays?.days).toBe(3);
    expect(getMissRequiredField(afterDays!)).toEqual(['peopleType']);
    expect(SEARCH_ASK_PROMPTS.peopleType).toContain('想和谁一起慢慢逛');
    expect(SEARCH_ASK_PROMPTS.peopleType).toContain('好友结伴');

    const ready = applySearchAskAnswer(afterDays!, 'peopleType', '好友结伴');
    expect(ready?.peopleType).toBe('好友结伴');
    expect(getMissRequiredField(ready!)).toEqual([]);
  });

  it('测试2：情侣去青岛 → 只问天数', () => {
    const params = extractSearchParams('情侣去青岛');
    expect(params).toMatchObject({ targetCity: '青岛', peopleType: '情侣' });
    expect(getMissRequiredField(params)).toEqual(['days']);
    expect(SEARCH_ASK_PROMPTS.days).toBe('计划游玩几天？');

    const ready = applySearchAskAnswer(params, 'days', '3');
    expect(ready?.days).toBe(3);
    expect(getMissRequiredField(ready!)).toEqual([]);
  });

  it('海报落地拼接句可一次抽齐必填', () => {
    const params = extractSearchParams('苏州3天好友结伴');
    expect(params).toMatchObject({
      targetCity: '苏州',
      days: 3,
      peopleType: '好友结伴',
    });
    expect(getMissRequiredField(params)).toEqual([]);
  });

  it('测试3：完整句不追问', () => {
    const params = extractSearchParams('济南情侣青岛3天人均4000美食探店');
    expect(getMissRequiredField(params)).toEqual([]);
    expect(buildSearchExtractLaunchQuery(params)).toContain('去青岛玩3天');
    expect(buildSearchExtractLaunchQuery(params)).toContain('预算约4000元');
  });

  it('测试4：去玩 → 先问目的地', () => {
    const params = extractSearchParams('去玩');
    expect(params.targetCity).toBeUndefined();
    expect(getMissRequiredField(params)[0]).toBe('targetCity');
    expect(SEARCH_ASK_PROMPTS.targetCity).toBe('请问你打算去哪里旅行？');

    const afterCity = applySearchAskAnswer(params, 'targetCity', '杭州');
    expect(afterCity?.targetCity).toBe('杭州');
    expect(getMissRequiredField(afterCity!)).toEqual(['days', 'peopleType']);
  });

  it('空回答不跳过本问；缺预算/主题写标记', () => {
    const params = extractSearchParams('去杭州玩');
    expect(applySearchAskAnswer(params, 'days', '   ')).toBeNull();
    const afterDays = applySearchAskAnswer(params, 'days', '两天');
    expect(afterDays?.days).toBe(2);
    const ready = applySearchAskAnswer(afterDays!, 'peopleType', '单人');
    const query = buildSearchExtractLaunchQuery(ready!);
    expect(query).toContain(SEARCH_OPTIONAL_BUDGET_LABEL);
    expect(query).toContain(SEARCH_OPTIONAL_THEME_LABEL);
    expect(query).not.toMatch(/预算约\d+元/);
  });
});
