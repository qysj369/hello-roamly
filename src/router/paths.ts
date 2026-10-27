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
  /** 热门城市二级列表 */
  cities: '/cities',
  privacy: '/privacy',
  terms: '/terms',
  contact: '/contact',
  /** 产品反馈（城市信息 / 攻略 / 交互） */
  feedback: '/feedback',
  /** 精打细算 · 出行预算测算（永久免费，仅参考） */
  budget: '/budget',
  /** 公众号内嵌轻量行程工具（无 3D） */
  mp: '/mp',
  /** 可抓取旅行知识库（周末漫游 / 单人短途 / 亲子出游） */
  inspire: '/inspire',
  drive: '/drive',
  /** 登上蜗牛号 · 国内低空观光（独立入口） */
  snailFlight: '/snail-flight',
  /** 飞阅首页登录占位，演示模式，不创建账号。 */
  login: '/login',
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

/** 桌面顶栏 / 移动抽屉 — 只留管家主线，空社区入口不再占导航 */
export const headerNavItems = [
  { to: paths.home, label: '首页', end: true },
  { to: paths.ai, label: '管家', end: true },
  { to: paths.profile, label: '我的', end: true },
] as const satisfies readonly PrimaryNavItem[];

/** 移动端底栏 */
export const bottomNavItems = [
  { to: paths.home, label: '首页', end: true },
  { to: paths.ai, label: '管家', end: true },
  { to: paths.profile, label: '我的', end: true },
] as const satisfies readonly PrimaryNavItem[];

/** 顶栏菜单（含全部入口） */
export const menuNavItems = [...headerNavItems] as const;
