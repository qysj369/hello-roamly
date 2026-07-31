import { readEnv } from '@/lib/config/env';

export type HomeLayoutMode = 'plan-a' | 'launch';

const LAUNCH_ALIASES = new Set(['launch', 'promo', 'promotion', '推广']);
const PLAN_A_ALIASES = new Set(['plan-a', 'plan_a', 'legacy', 'default']);

/**
 * 首页布局模式。
 * - launch：推广版（价值主张 + 能力条 + 12 城封面 + 邀请/分享入口）
 * - plan-a：原地图 Hero 紧凑版
 */
export function getHomeLayoutMode(): HomeLayoutMode {
  const raw = readEnv('VITE_HOME_LAYOUT')?.toLowerCase();
  if (raw && LAUNCH_ALIASES.has(raw)) {
    return 'launch';
  }
  if (raw && PLAN_A_ALIASES.has(raw)) {
    return 'plan-a';
  }

  // 推广阶段：正式构建默认 launch
  if (import.meta.env.PROD) {
    return 'launch';
  }

  return 'plan-a';
}

export function isLaunchHomeLayout(): boolean {
  return getHomeLayoutMode() === 'launch';
}
