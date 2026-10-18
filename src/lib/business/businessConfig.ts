/**
 * 商业扩展层 · 全局开关
 *
 * 架构：
 * - 免费基座层：城市弹窗 / AI 规划 / 慢行工具箱 — 永不依赖本开关
 * - 商业扩展层：分销、付费路书、会员、线下活动 — 全部经 isOpenBusiness 一键关闭
 *
 * 默认关闭：与纯免费版本表现一致。开启：`VITE_OPEN_BUSINESS=1`
 */

import { readEnv } from '@/lib/config/env';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/**
 * 全局商业模块总开关（配置名：isOpenBusiness）
 * false → 不渲染任何商业插槽 / 分销 / 会员增量 UI
 */
export function isOpenBusiness(): boolean {
  return isTruthyFlag(readEnv('VITE_OPEN_BUSINESS'));
}

/** @alias 与产品文档一致的命名 */
export const getIsOpenBusiness = isOpenBusiness;

export type BusinessModuleId =
  | 'distribute'
  | 'paidGuide'
  | 'membership'
  | 'offlineActivity'
  | 'slotCityStay'
  | 'slotNicheExperience'
  | 'slotToolboxValueAdd';

/**
 * 子模块是否可展示：必须先过总开关。
 * 子开关预留；当前无独立 env，总开关关闭则一律 false。
 */
export function isBusinessModuleEnabled(_module: BusinessModuleId): boolean {
  return isOpenBusiness();
}
