/**
 * 首页宽屏双侧扩展位配置预案。
 *
 * 产品定位：纯免费小众漫行工具 — 禁止弹窗广告、促销 Banner。
 * 默认双侧均为 null：页面不渲染任何侧栏；商业位当前阶段全部关闭。
 * 刚性底线见 `@/lib/config/productPositioning`（城市弹窗 / AI 攻略 / 预算测算永久免费）。
 */

import { isOpenBusiness } from '@/lib/business/businessConfig';

export type HoloHomeSideRailKind = 'promo' | 'partner' | 'project' | 'ops';

export type HoloHomeSideRailItem = {
  id: string;
  /** 总开关；false 时永不展示 */
  enabled: boolean;
  kind: HoloHomeSideRailKind;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  /** 站内路径或外链 */
  href?: string;
  /** 外链是否新窗口 */
  external?: boolean;
  /** 允许用户关闭（本地记忆） */
  dismissible?: boolean;
  /** ISO 8601，未到开始时间不展示 */
  startAt?: string;
  /** ISO 8601，超过结束时间不展示 */
  endAt?: string;
};

export type HoloHomeSideRailsConfig = {
  /**
   * 仅在视口宽度 ≥ 此值时展示侧栏（移动 / 普通笔记本永不出现）
   * 默认 1600，避免挤压主栏
   */
  minViewportWidth: number;
  left: HoloHomeSideRailItem | null;
  right: HoloHomeSideRailItem | null;
};

/** 静态默认：双侧关闭，主栏布局不变 */
export const holoHomeSideRailsConfig: HoloHomeSideRailsConfig = {
  minViewportWidth: 1600,
  left: null,
  right: null,
};

/**
 * 预留：日后从后台 / CDN 拉取配置。
 * 当前直接返回本地默认；失败时也应回落默认，勿阻塞首页。
 */
export async function loadHoloHomeSideRailsConfig(): Promise<HoloHomeSideRailsConfig> {
  return holoHomeSideRailsConfig;
}

export function isSideRailScheduleActive(
  item: Pick<HoloHomeSideRailItem, 'startAt' | 'endAt'>,
  nowMs: number = Date.now(),
): boolean {
  if (item.startAt) {
    const start = Date.parse(item.startAt);
    if (!Number.isNaN(start) && nowMs < start) return false;
  }
  if (item.endAt) {
    const end = Date.parse(item.endAt);
    if (!Number.isNaN(end) && nowMs > end) return false;
  }
  return true;
}

import { isOpenBusiness } from '@/lib/business/businessConfig';

/** 解析当前应展示的侧栏项；商业总开关关闭 / 未启用 / 过期 / 空配置 → null */
export function resolveActiveSideRail(
  item: HoloHomeSideRailItem | null | undefined,
  nowMs: number = Date.now(),
): HoloHomeSideRailItem | null {
  if (!isOpenBusiness()) return null;
  if (!item || !item.enabled) return null;
  if (!isSideRailScheduleActive(item, nowMs)) return null;
  return item;
}

export function sideRailDismissStorageKey(id: string): string {
  return `holo-home-side-rail-dismissed:${id}`;
}

export function isSideRailDismissed(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(sideRailDismissStorageKey(id)) === '1';
  } catch {
    return false;
  }
}

export function dismissSideRail(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(sideRailDismissStorageKey(id), '1');
  } catch {
    /* ignore quota / private mode */
  }
}
