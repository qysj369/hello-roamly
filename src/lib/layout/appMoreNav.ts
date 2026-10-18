import { bottomNavItems, headerNavItems, paths } from '@/router/paths';
import type { AboutPageState } from '@/types/router-state';

export type AppMoreNavItem = {
  label: string;
  to: string;
  emoji: string;
};

/** 登录 / 注册 — 关于页锚点 */
export const authLoginNav = {
  label: '登录 / 注册',
  shortLabel: '登录',
  to: paths.about,
  state: { auth: 'login' } satisfies AboutPageState,
} as const;

/** 首页驾驶舱「更多」— 只补管家相关，不把空社区再塞回来 */
export const homeCockpitMoreItems: AppMoreNavItem[] = [
  { emoji: '🤖', label: '旅行管家', to: paths.ai },
  { emoji: '🌿', label: '慢行灵感', to: paths.inspire },
  { emoji: '🧮', label: '精打细算', to: paths.budget },
  { emoji: '🐌', label: '我的', to: paths.profile },
  { emoji: 'ℹ️', label: '关于', to: paths.about },
];

const primaryNavPaths = new Set([
  ...bottomNavItems.map((item) => item.to),
  ...headerNavItems.map((item) => item.to),
]);

/** 抽屉「更多」— 仅补充项，不与主导航重复 */
export const drawerMoreItems: AppMoreNavItem[] = [
  { emoji: '🌿', label: '慢行灵感', to: paths.inspire },
  { emoji: '🧮', label: '精打细算', to: paths.budget },
  { emoji: 'ℹ️', label: '关于', to: paths.about },
].filter((item) => !primaryNavPaths.has(item.to));
