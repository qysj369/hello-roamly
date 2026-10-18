import { isModerationDemoBlockEnabled } from '@/lib/moderation/config';
import {
  UGC_CONTENT_RULE_LINE,
  UGC_SOFT_AD_PATTERNS,
} from '@/lib/config/productPositioning';
import type { ContentModerationScene } from '@/types/domain/contentModeration';
import type { ModerationResult } from '@/types/domain/contentModeration';

/**
 * 客户端预检：长度、空内容、UGC 商家广告软文、演示拦截（不能替代云审）。
 * 质量保障：游记只保留普通人真实短途松弛出行分享。
 */

const MAX_TEXT_LENGTH = 8000;

/** 演示用敏感词（仅当 VITE_CONTENT_MODERATION_DEMO_BLOCK=1） */
const DEMO_BLOCK_SUBSTRINGS = ['违规测试', '内容安全测试不通过'] as const;

/** 发布向场景：过滤商家广告软文 */
const UGC_SCENES: ReadonlySet<ContentModerationScene> = new Set([
  'travel_moment',
  'comment',
  'profile_bio',
]);

function reject(message: string, labels: string[] = ['local_preflight']): ModerationResult {
  return {
    decision: 'reject',
    requestId: `local-${Date.now()}`,
    labels,
    message,
    localOnly: true,
  };
}

function pass(message?: string): ModerationResult {
  return {
    decision: 'pass',
    requestId: `local-${Date.now()}`,
    labels: [],
    message,
    localOnly: true,
  };
}

function rejectSoftAd(): ModerationResult {
  return reject(
    '内容疑似商家广告或推销软文。蜗牛游记只保留普通人真实短途松弛出行分享，请去掉特惠/下单/优惠等话术后再试。',
    ['local_preflight', 'ugc_soft_ad'],
  );
}

/** 客户端预检：长度、空内容、UGC 软广、演示拦截（不能替代云审） */
export function runLocalPreflight(
  text: string,
  scene?: ContentModerationScene,
): ModerationResult | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return reject('内容不能为空');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return reject(`内容过长，请控制在 ${MAX_TEXT_LENGTH} 字以内`);
  }

  if (scene && UGC_SCENES.has(scene)) {
    const hit = UGC_SOFT_AD_PATTERNS.find((pattern) => pattern.test(trimmed));
    if (hit) {
      return rejectSoftAd();
    }
  }

  if (isModerationDemoBlockEnabled()) {
    const hit = DEMO_BLOCK_SUBSTRINGS.find((word) => trimmed.includes(word));
    if (hit) {
      return reject(`演示拦截：检测到「${hit}」，正式环境请接入云内容安全 API`);
    }
  }

  return pass(UGC_CONTENT_RULE_LINE);
}
