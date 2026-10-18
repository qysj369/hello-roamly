import { describe, expect, it } from 'vitest';
import { GenerateMapPlanApiError } from '@/services/ai/api/generateMapPlan';
import {
  formatPlanDemandForDisplay,
  friendlyHomeMapPlanError,
  resolveClarifyPinLabel,
  stripHoloPlanHandoffMeta,
} from '@/lib/home/launchHomeMapQiongYouPlan';

describe('friendlyHomeMapPlanError', () => {
  it('maps network failures', () => {
    expect(friendlyHomeMapPlanError(new TypeError('Failed to fetch'))).toContain('网络');
  });

  it('maps timeout / incomplete stream', () => {
    expect(
      friendlyHomeMapPlanError(
        new GenerateMapPlanApiError('连接已断开', { code: 'plan_incomplete' }),
      ),
    ).toContain('超时');
  });

  it('maps rate limit', () => {
    expect(
      friendlyHomeMapPlanError(new GenerateMapPlanApiError('too many', { status: 429 })),
    ).toContain('频繁');
  });

  it('maps missing model config', () => {
    expect(
      friendlyHomeMapPlanError(
        new GenerateMapPlanApiError('DeepSeek 未配置', { code: 'deepseek_unconfigured' }),
      ),
    ).toContain('大模型未配置');
  });
});

describe('stripHoloPlanHandoffMeta', () => {
  it('keeps user demand and drops lock / style / origin / guard blocks', () => {
    const raw = [
      '杭州，3天，亲子出行，预算约2500元。【目的地锁定】杭州。【风格说明】慢游、亲子不是地名',
      '【出发地】济南市历下区中林路（仅作出发锚点）',
      '',
      '【用户已确认】城市杭州，3天，预算约2500元。',
      '',
      '【慢行生成前置】请直接生成完整漫行攻略',
    ].join('\n');

    expect(stripHoloPlanHandoffMeta(raw)).toBe('杭州，3天，亲子出行，预算约2500元');
    expect(formatPlanDemandForDisplay(raw)).toBe('杭州，3天，亲子出行，预算约2500元');
  });
});

describe('resolveClarifyPinLabel', () => {
  it('prefers locked city over preference labels', () => {
    expect(resolveClarifyPinLabel('美食探店', '杭州', '美食探店')).toBe('杭州');
    expect(resolveClarifyPinLabel('美食探店', null, '美食探店')).toBe('所选地点');
    expect(resolveClarifyPinLabel('青岛→海景→民俗', '青岛→海景→民俗', '自然山水')).toBe('青岛');
  });
});
