import { readEnv } from '@/lib/config/env';
import { isHoloHomeEnabled } from '@/lib/config/holoHome';

/** 蜗牛号飞行漫游座舱 — 默认首页；VITE_HOME_LAYOUT=holo / launch / plan-a 或 VITE_HOME_LEGACY=1 回退 */
export function isCapsuleOneHomeEnabled(): boolean {
  if (isHoloHomeEnabled()) {
    return false;
  }
  const legacy = readEnv('VITE_HOME_LEGACY')?.toLowerCase();
  if (legacy === '1' || legacy === 'true') {
    return false;
  }
  const layout = readEnv('VITE_HOME_LAYOUT')?.toLowerCase();
  if (layout === 'plan-a' || layout === 'launch') {
    return false;
  }
  return true;
}
