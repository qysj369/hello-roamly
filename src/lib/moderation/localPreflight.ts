import { isModerationDemoBlockEnabled } from '@/lib/moderation/config';
import type { ModerationResult } from '@/types/domain/contentModeration';

const MAX_TEXT_LENGTH = 8000;

/** 演示用敏感词（仅当 VITE_CONTENT_MODERATION_DEMO_BLOCK=1） */
const DEMO_BLOCK_SUBSTRINGS = ['违规测试', '内容安全测试不通过'] as const;

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

/** 客户端预检：长度、空内容、演示拦截（不能替代云审） */
export function runLocalPreflight(text: string): ModerationResult | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return reject('内容不能为空');
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return reject(`内容过长，请控制在 ${MAX_TEXT_LENGTH} 字以内`);
  }

  if (isModerationDemoBlockEnabled()) {
    const hit = DEMO_BLOCK_SUBSTRINGS.find((word) => trimmed.includes(word));
    if (hit) {
      return reject(`演示拦截：检测到「${hit}」，正式环境请接入云内容安全 API`);
    }
  }

  return pass();
}
