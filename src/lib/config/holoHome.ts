import { readEnv } from '@/lib/config/env';

const HOLO_ALIASES = new Set(['holo', 'hologram', '漫游']);

/** 浅米白首页（文档 Home.vue）— 默认启用；VITE_HOME_LAYOUT=capsule / VITE_HOME_LEGACY=1 可回退 */
export function isHoloHomeEnabled(): boolean {
  const legacy = readEnv('VITE_HOME_LEGACY')?.toLowerCase();
  if (legacy === '1' || legacy === 'true') {
    return false;
  }

  const layout = readEnv('VITE_HOME_LAYOUT')?.toLowerCase();
  if (layout && HOLO_ALIASES.has(layout)) {
    return true;
  }
  if (layout === 'capsule' || layout === 'plan-a' || layout === 'launch') {
    return false;
  }

  // 未显式指定时，默认走浅米白首页改版
  return true;
}
