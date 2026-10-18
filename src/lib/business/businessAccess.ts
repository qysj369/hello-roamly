/**
 * 商业扩展 · 权限与分销/付费判断（统一封装）
 * 禁止在地图渲染、AI 生成核心流程内硬编码商业判断。
 */

import { isOpenBusiness, isBusinessModuleEnabled } from '@/lib/business/businessConfig';
import type { BusinessExtensionFields } from '@/types/domain/businessExtensions';

/** 用户访问双链路：基座永远 free；会员仅叠加增量 */
export type UserAccessLane = 'free_base' | 'member_addon';

export type BusinessUserContext = {
  /** 是否增值会员（仅商业开启时有意义） */
  isMember?: boolean;
};

export function resolveUserAccessLane(user?: BusinessUserContext | null): UserAccessLane {
  if (isOpenBusiness() && user?.isMember) {
    return 'member_addon';
  }
  return 'free_base';
}

/** 普通用户链路：完整免费基座，不受会员状态影响 */
export function hasFullFreeBaseAccess(_user?: BusinessUserContext | null): boolean {
  return true;
}

/** 增值会员增量权益是否生效（不改动普通用户流程） */
export function hasMemberAddonAccess(user?: BusinessUserContext | null): boolean {
  return resolveUserAccessLane(user) === 'member_addon';
}

export function hasBusinessPayload(ext?: BusinessExtensionFields | null): boolean {
  if (!ext) return false;
  return Boolean(
    (ext.distributeLink && ext.distributeLink.trim()) ||
      (ext.paidGuideId && String(ext.paidGuideId).trim()) ||
      (ext.activityTag && ext.activityTag.trim()),
  );
}

/** 分销链接：商业关 / 空字段 → null */
export function resolveDistributeLink(
  ext?: BusinessExtensionFields | null,
): string | null {
  if (!isBusinessModuleEnabled('distribute')) return null;
  const link = ext?.distributeLink?.trim();
  return link || null;
}

/** 付费路书 ID：商业关 / 空 → null */
export function resolvePaidGuideId(
  ext?: BusinessExtensionFields | null,
): string | null {
  if (!isBusinessModuleEnabled('paidGuide')) return null;
  const id = ext?.paidGuideId != null ? String(ext.paidGuideId).trim() : '';
  return id || null;
}

export function resolveActivityTag(
  ext?: BusinessExtensionFields | null,
): string | null {
  if (!isBusinessModuleEnabled('offlineActivity')) return null;
  const tag = ext?.activityTag?.trim();
  return tag || null;
}

/**
 * 会员专属内容是否可对当前用户展示。
 * 商业关闭时：不拦截免费基座（此类内容本就不渲染）。
 */
export function canAccessMemberOnlyContent(
  ext: BusinessExtensionFields | null | undefined,
  user?: BusinessUserContext | null,
): boolean {
  if (!ext?.memberOnly) return true;
  if (!isOpenBusiness()) return false;
  return hasMemberAddonAccess(user);
}

/** 是否应渲染某实体的商业附属区（总开关 + 可选 payload / 占位槽） */
export function shouldRenderBusinessSlot(
  module: 'slotCityStay' | 'slotNicheExperience' | 'slotToolboxValueAdd',
): boolean {
  return isBusinessModuleEnabled(module);
}
