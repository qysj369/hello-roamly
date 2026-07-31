import { readEnv } from '@/lib/config/env';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** 是否记录分享事件（默认中国版构建可开；未设置时视为开启） */
export function isShareAnalyticsEnabled(): boolean {
  const raw = readEnv('VITE_SHARE_ANALYTICS_ENABLED');
  if (raw === undefined || raw === '') {
    return true;
  }
  return isTruthyFlag(raw);
}

export function hasShareAnalyticsBackend(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL')?.trim());
}
