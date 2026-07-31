import { readEnv } from '@/lib/config/env';
import { isHoloHomeEnabled } from '@/lib/config/holoHome';

/** Capsule One 旅行智能驾驶舱 — 默认启用；设 VITE_HOME_LEGACY=1 回退旧首页 */
export function isCapsuleOneHomeEnabled(): boolean {
  if (isHoloHomeEnabled()) {
    return false;
  }
  const legacy = readEnv('VITE_HOME_LEGACY')?.toLowerCase();
  return legacy !== '1' && legacy !== 'true';
}
