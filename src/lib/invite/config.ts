import { readEnv } from '@/lib/config/env';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * 私域裂变：邀请好友注册解锁高清城市灵感素材包。
 * 仅需中国市场 + VITE_INVITE_ENABLED=1；不依赖支付总开关，也不上锁免费攻略。
 */
export function isInviteEnabled(): boolean {
  if (!isChinaPrimaryMarket()) {
    return false;
  }
  return isTruthyFlag(readEnv('VITE_INVITE_ENABLED'));
}

export function hasInviteBackend(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL')?.trim());
}
