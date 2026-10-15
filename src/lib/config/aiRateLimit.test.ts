import { afterEach, describe, expect, it } from 'vitest';
import {
  __resetAiRateLimitForTests,
  classifyAiRoute,
  consumeAiRateLimit,
} from '../../../server/lib/aiRateLimit';

describe('ai rate limit (daily + abuse)', () => {
  afterEach(() => {
    __resetAiRateLimitForTests();
  });

  it('classifies plan generation routes', () => {
    expect(classifyAiRoute('/api/ai/generate-plan-stream')).toBe('plan');
    expect(classifyAiRoute('/api/ai/generate-plan-json')).toBe('plan');
    expect(classifyAiRoute('/api/ai/generate-guide')).toBe('plan');
    expect(classifyAiRoute('/api/ai/companion-sketch')).toBe('plan');
    expect(classifyAiRoute('/api/ai/chat-stream')).toBe('chat');
  });

  it('enforces daily free plan quota', () => {
    const env = {
      AI_RATE_LIMIT_PLAN_PER_MIN: '100',
      AI_RATE_LIMIT_PLAN_PER_DAY: '3',
      AI_RATE_LIMIT_WINDOW_MS: '60000',
      AI_RATE_LIMIT_DAY_MS: '86400000',
    };
    expect(consumeAiRateLimit(env, 'test-ip', 'plan').ok).toBe(true);
    expect(consumeAiRateLimit(env, 'test-ip', 'plan').ok).toBe(true);
    expect(consumeAiRateLimit(env, 'test-ip', 'plan').ok).toBe(true);
    const blocked = consumeAiRateLimit(env, 'test-ip', 'plan');
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.code).toBe('daily_plan_limit');
      expect(blocked.message).toMatch(/今日免费/);
    }
  });

  it('temporarily blocks after repeated limit strikes', () => {
    const env = {
      AI_RATE_LIMIT_PLAN_PER_MIN: '1',
      AI_RATE_LIMIT_PLAN_PER_DAY: '100',
      AI_RATE_LIMIT_WINDOW_MS: '60000',
      AI_RATE_LIMIT_ABUSE_STRIKES: '2',
      AI_RATE_LIMIT_ABUSE_WINDOW_MS: '3600000',
      AI_RATE_LIMIT_ABUSE_BLOCK_MS: '1800000',
    };
    expect(consumeAiRateLimit(env, 'abuse-ip', 'plan').ok).toBe(true);
    expect(consumeAiRateLimit(env, 'abuse-ip', 'plan').ok).toBe(false);
    expect(consumeAiRateLimit(env, 'abuse-ip', 'plan').ok).toBe(false);
    const blocked = consumeAiRateLimit(env, 'abuse-ip', 'plan');
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.code).toBe('abuse_blocked');
    }
  });
});
