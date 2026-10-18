import { describe, expect, it } from 'vitest';
import {
  AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS,
  BANNED_ECOMMERCE_WORDS,
  CITY_PREVIEW_SECTION_ORDER,
  FREE_FOREVER_CORE_FEATURES,
  FREE_FOREVER_POLICY_LINE,
  PRODUCT_DIFFERENTIATION,
} from '@/lib/config/productPositioning';
import { runLocalPreflight } from '@/lib/moderation/localPreflight';
import {
  buildMapPlanSystemPrompt,
  buildMapPlanUserPrompt,
} from '@/services/ai/prompts/mapPlanGeneration';
import { buildAiSnailSystemPrompt } from '@/services/ai/prompts/aiSnailGuide';
import { isInviteEnabled } from '@/lib/invite/config';
import { isPaymentUiEnabled } from '@/lib/payment/config';
import { holoHomeSideRailsConfig } from '@/data/holoHomeSideRails';

describe('product positioning landing', () => {
  it('locks free-forever core features and differentiation copy', () => {
    expect(FREE_FOREVER_CORE_FEATURES).toHaveLength(3);
    expect(FREE_FOREVER_POLICY_LINE).toMatch(/永久免费/);
    expect(PRODUCT_DIFFERENTIATION).toMatch(/纯免费/);
    expect(CITY_PREVIEW_SECTION_ORDER).toEqual([
      '城市简介',
      '核心地标',
      '本地美食与街巷',
      '出行贴士',
    ]);
  });

  it('bans ecommerce words in shared AI constraints', () => {
    for (const word of BANNED_ECOMMERCE_WORDS) {
      expect(AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS).toContain(word);
    }
    expect(AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS).toMatch(/小众松弛漫行规划助手/);
    expect(AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS).toMatch(/不得自行修改目的地/);
    expect(AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS).toMatch(/跨城中转/);
    expect(buildMapPlanSystemPrompt()).toContain('小众松弛漫行规划助手');
    expect(buildMapPlanSystemPrompt()).toContain('| 项目 | 金额 | 平价省钱方案 |');
    expect(buildMapPlanSystemPrompt()).toContain('| 机动 |');
    expect(buildMapPlanSystemPrompt()).toContain('不要【蜗牛提示】');
    expect(buildMapPlanSystemPrompt()).toContain('也可以地铁，但公交更方便');
    expect(buildMapPlanSystemPrompt()).toMatch(/2\.5\s*小时/);
    expect(buildMapPlanSystemPrompt()).not.toMatch(/约偏|去北|京玩|自然山(?!水)|济南西站|半日～一日穷游/);
    expect(buildAiSnailSystemPrompt()).toMatch(/纯免费小众漫行/);
    const userPrompt = buildMapPlanUserPrompt(
      '青岛',
      '从济南出发，去青岛玩3天，同行亲子，人均预算约1500元，自然山水',
      undefined,
      '济南市历下区中林路绿城百合花园',
    );
    expect(userPrompt).not.toContain('三方案');
    expect(userPrompt).not.toMatch(/🐌落地最佳/);
    expect(userPrompt).toContain('一种最省事');
    expect(userPrompt).toContain('一基址连住');
    expect(userPrompt).toContain('仰口只写第2天');
    const foodPrompt = buildMapPlanUserPrompt(
      '青岛',
      '从济南出发，去青岛玩3天，同行情侣，人均预算约4000元，美食探店',
      undefined,
      '济南市历下区中林路绿城百合花园',
    );
    expect(foodPrompt).toContain('高铁二等');
    expect(foodPrompt).toContain('14:00前动身');
    expect(foodPrompt).toContain('奥帆游船');
    expect(foodPrompt).toContain('中山路/栈桥');
    expect(foodPrompt).toContain('冬春');
    expect(foodPrompt).toContain('16点停止检票');
    expect(foodPrompt).toContain('官方售票窗口');
    expect(foodPrompt).not.toContain('仰口只写第2天');
  });

  it('keeps commercial UI off by default', () => {
    expect(holoHomeSideRailsConfig.left).toBeNull();
    expect(holoHomeSideRailsConfig.right).toBeNull();
    expect(isInviteEnabled()).toBe(false);
    expect(isPaymentUiEnabled()).toBe(false);
  });

  it('filters UGC soft-ad copy on travel_moment', () => {
    const rejected = runLocalPreflight('本店特惠抢购，点击预订立即下单', 'travel_moment');
    expect(rejected?.decision).toBe('reject');
    expect(rejected?.labels).toContain('ugc_soft_ad');

    const ok = runLocalPreflight('周末近郊闲逛，老街喝茶半日，花费都有出处', 'travel_moment');
    expect(ok?.decision).toBe('pass');
  });
});
