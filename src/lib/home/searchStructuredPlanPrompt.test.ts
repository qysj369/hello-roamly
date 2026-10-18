import { describe, expect, it } from 'vitest';
import {
  SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT,
  buildSearchStructuredPlanUserPrompt,
} from '@/lib/home/searchStructuredPlanPrompt';

describe('SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT', () => {
  it('keeps the existing JSON fields', () => {
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('"baseInfo"');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('"budgetList"');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('"dayList"');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('"globalTips"');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('"hotelArea"');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('禁止新增字段');
  });

  it('asks for slow-travel content inside those fields', () => {
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('必体验最多2个');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('近郊轻游');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('禁止写双人分摊');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('本地老店');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('观光塔');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('省钱降级');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('雨天替代');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('节假日分流');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('点位A-点位B-点位C慢逛');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('行程亮点');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('游玩亮点');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('禁止只罗列地名');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('招牌菜');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('市内消费');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('好友结伴');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('同城换人群必须换侧重点');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('仅供出行参考');
    expect(SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT).toContain('禁止预订/下单/推销话术');
  });

  it('injects party-specific focus into the user prompt', () => {
    const prompt = buildSearchStructuredPlanUserPrompt({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '情侣',
      budget: null,
      theme: null,
    });
    expect(prompt).toContain('日落机位');
    expect(prompt).toContain('招牌菜');
    expect(prompt).toContain('雨天替代/节假日分流/本地交通');
    expect(prompt).toContain('禁止复用好友');
  });

  it('injects the Shanghai 3-day friends gold sample', () => {
    const prompt = buildSearchStructuredPlanUserPrompt({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: null,
    });
    expect(prompt).toContain('人民广场-南京东路-外滩滨江慢逛');
    expect(prompt).toContain('沈大成');
    expect(prompt).toContain('北外滩滨江');
    expect(prompt).toContain('Metro大都会APP');
    expect(prompt).toContain('分层私有知识库');
  });
});
