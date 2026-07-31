import { SNAIL_COMMUNITY } from '@/lib/config/snailCommunity';
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

/** 首页驾驶舱「更多」— 底栏在首页隐藏，故包含主导航项 */
export const homeCockpitMoreItems: AppMoreNavItem[] = [
  { emoji: '🔍', label: '发现', to: paths.discover },
  { emoji: '✍️', label: 'AI写游记', to: paths.aiSnail },
  { emoji: '🌍', label: '目的地', to: paths.guides },
  { emoji: '🧳', label: '旅游搭子', to: paths.travelBuddies },
  { emoji: '🤖', label: 'AI 顾问', to: paths.ai },
  { emoji: '📜', label: SNAIL_COMMUNITY.glossaryTitle, to: paths.snailCulture },
  { emoji: '💬', label: '消息', to: paths.messages },
  { emoji: '🐌', label: '蜗居', to: paths.profile },
  { emoji: 'ℹ️', label: '关于', to: paths.about },
];

const primaryNavPaths = new Set([
  ...bottomNavItems.map((item) => item.to),
  ...headerNavItems.map((item) => item.to),
]);

/** 抽屉「更多」— 仅补充项，不与主导航重复 */
export const drawerMoreItems: AppMoreNavItem[] = [
  { emoji: '✍️', label: 'AI写游记', to: paths.aiSnail },
  { emoji: '🤖', label: 'AI 顾问', to: paths.ai },
  { emoji: '📜', label: SNAIL_COMMUNITY.glossaryTitle, to: paths.snailCulture },
  { emoji: 'ℹ️', label: '关于', to: paths.about },
].filter((item) => !primaryNavPaths.has(item.to));
