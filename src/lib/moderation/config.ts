import { readEnv } from '@/lib/config/env';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** 是否启用内容审核（关闭时所有 UGC 直接放行） */
export function isContentModerationEnabled(): boolean {
  return isTruthyFlag(readEnv('VITE_CONTENT_MODERATION_ENABLED'));
}

/** 严格模式：review 视同拒绝（待人工审） */
export function isContentModerationStrict(): boolean {
  return isTruthyFlag(readEnv('VITE_CONTENT_MODERATION_STRICT'));
}

/** 关于页演示：输入含此词将本地拒绝 */
export function isModerationDemoBlockEnabled(): boolean {
  return isTruthyFlag(readEnv('VITE_CONTENT_MODERATION_DEMO_BLOCK'));
}

export function hasModerationBackend(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL')?.trim());
}
