import { readEnv } from '@/lib/config/env';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** 是否展示邀请入口（中国版默认开启） */
export function isInviteEnabled(): boolean {
  if (!isChinaPrimaryMarket()) {
    return false;
  }
  const raw = readEnv('VITE_INVITE_ENABLED');
  if (raw === undefined || raw === '') {
    return true;
  }
  return isTruthyFlag(raw);
}

export function hasInviteBackend(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL')?.trim());
}
