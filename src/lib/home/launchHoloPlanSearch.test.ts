import { describe, expect, it } from 'vitest';
import { buildHoloPlanSearchState } from '@/lib/home/launchHoloPlanSearch';

describe('buildHoloPlanSearchState', () => {
  it('uses clarify handoff as complete and skips model follow-up', () => {
    const state = buildHoloPlanSearchState({
      query: '去杭州玩',
      destination: '杭州',
      clarify: {
        city: '杭州',
        days: 3,
        party: '亲子',
        budgetYuan: 2500,
        preference: '近郊轻游',
      },
    });

    expect(state.aiPlan?.destination).toBe('杭州');
    expect(state.initialPrompt).toContain('【用户已确认】');
    expect(state.initialPrompt).toContain('城市杭州');
    expect(state.initialPrompt).toContain('3天');
    expect(state.initialPrompt).toContain('同行：亲子');
    expect(state.initialPrompt).toContain('预算约2500元');
    expect(state.initialPrompt).toContain('偏好：近郊轻游');
    expect(state.initialPrompt).toContain('请直接生成完整漫行攻略');
    expect(state.initialPrompt).not.toContain('AI_CLARIFY_ASK');
    expect(state.initialPrompt).not.toMatch(/若出行天数、同行人群、预算范围或旅行偏好仍缺失/);
    expect(state.sessionId).toBeUndefined();
    expect(typeof state.searchNonce).toBe('number');
  });

  it('asks the model only when destination is present but trip facts are missing', () => {
    const state = buildHoloPlanSearchState({
      query: '去杭州玩',
      destination: '杭州',
    });

    expect(state.aiPlan?.destination).toBe('杭州');
    expect(state.initialPrompt).toContain('信息齐备后再生成');
    expect(state.initialPrompt).not.toContain('【用户已确认】');
  });

  it('does not treat bare 亲子 / 近郊 as a completed preference', () => {
    const state = buildHoloPlanSearchState({
      query: '去杭州亲子近郊玩',
      destination: '杭州',
    });

    expect(state.initialPrompt).toContain('信息齐备后再生成');
    expect(state.initialPrompt).not.toContain('【用户已确认】');
  });
});
