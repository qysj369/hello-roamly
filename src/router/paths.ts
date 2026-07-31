export const paths = {
  home: '/',
  discover: '/discover',
  ai: '/ai',
  aiSnail: '/ai-snail',
  /** 兼容旧链接；实际地图驾驶舱在 {@link paths.home} */
  map: '/map',
  guides: '/guides',
  guidesPublish: '/guides/publish',
  plans: '/plans',
  profilePlans: '/profile/plans',
  savedPlans: '/saved-plans',
  profile: '/profile',
  users: '/users',
  messages: '/messages',
  travelBuddies: '/travel-buddies',
  travelBuddyNew: '/travel-buddy/new',
  about: '/about',
  snailCulture: '/snail-culture',
  drive: '/drive',
} as const;

/** 驾驶舱街景页 */
export function driveCityPath(cityName: string): string {
  return `${paths.drive}/${encodeURIComponent(cityName)}`;
}

/** 攻略详情页路径 */
export function guideDetailPath(id: string): string {
  return `${paths.guides}/${encodeURIComponent(id)}`;
}

/** 旅行计划详情页路径 */
export function travelPlanDetailPath(planId: string): string {
  return `${paths.plans}/${encodeURIComponent(planId)}`;
}

/** 用户保存的穷游方案详情页 */
export function savedUserPlanDetailPath(planId: string): string {
  return `${paths.savedPlans}/${encodeURIComponent(planId)}`;
}

/** 我的方案列表 */
export function profileSavedPlansPath(): string {
  return paths.profilePlans;
}

/** 当前用户主页（演示） */
export function currentUserProfilePath(): string {
  return paths.profile;
}

/** 指定用户公开主页 */
export function userProfilePath(userId: string): string {
  return `${paths.users}/${encodeURIComponent(userId)}`;
}

/** 用户主页分享路径（本人用 /profile） */
export function profilePathForUser(userId: string, isOwnProfile = false): string {
  return isOwnProfile ? currentUserProfilePath() : userProfilePath(userId);
}

const MOMENT_HASH_PREFIX = 'moment-';

/** 瞬间卡片 DOM id / URL hash（不含 #） */
export function travelMomentDomId(momentId: string): string {
  return `${MOMENT_HASH_PREFIX}${momentId}`;
}

/** 分享瞬间：用户主页 + #moment-xxx */
export function travelMomentSharePath(
  authorId: string,
  momentId: string,
  options?: { isOwnProfile?: boolean },
): string {
  const base = profilePathForUser(authorId, options?.isOwnProfile);
  return `${base}#${travelMomentDomId(momentId)}`;
}

export function isTravelMomentShareHash(hash: string): boolean {
  return hash.startsWith(`#${MOMENT_HASH_PREFIX}`);
}

export function parseTravelMomentIdFromHash(hash: string): string | null {
  if (!isTravelMomentShareHash(hash)) {
    return null;
  }
  return decodeURIComponent(hash.slice(`#${MOMENT_HASH_PREFIX}`.length));
}

export type AppPath = (typeof paths)[keyof typeof paths];

export type PrimaryNavItem = {
  to: AppPath | string;
  label: string;
  end: boolean;
};

/** 桌面顶栏 / 移动抽屉 — 与底栏入口对齐 */
export const headerNavItems = [
  { to: paths.home, label: '首页', end: true },
  { to: paths.discover, label: '发现', end: true },
  { to: paths.guides, label: '查看攻略', end: false },
  { to: paths.travelBuddies, label: '旅游搭子', end: true },
  { to: paths.messages, label: '消息', end: false },
  { to: paths.profile, label: '蜗居', end: true },
] as const satisfies readonly PrimaryNavItem[];

/** 移动端底栏 */
export const bottomNavItems = [
  { to: paths.home, label: '首页', end: true },
  { to: paths.discover, label: '发现', end: true },
  { to: paths.guides, label: '查看攻略', end: false },
  { to: paths.travelBuddies, label: '旅游搭子', end: true },
  { to: paths.messages, label: '消息', end: false },
  { to: paths.profile, label: '蜗居', end: true },
] as const satisfies readonly PrimaryNavItem[];

/** 顶栏菜单（含全部入口） */
export const menuNavItems = [...headerNavItems] as const;
