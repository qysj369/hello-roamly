/**
 * 二期扩展预留：实时天气/人流改行程、行后相册、偏好记忆、商家套餐推荐。
 * 一期仅暴露空钩子，不接业务；AI 不得改图库。
 */
export type Phase2TravelExtensionHooks = {
  /** 天气/人流动态改行程 */
  onLiveConditionAdjust?: (payload: { city: string; planId?: string }) => void;
  /** 行后个性化旅行相册 */
  onPostTripAlbum?: (payload: { planId: string; userId?: string }) => void;
  /** 用户偏好记忆 */
  onPreferenceMemory?: (payload: { userId?: string; prefs: Record<string, unknown> }) => void;
  /** 本地商家套餐智能推荐 */
  onMerchantPackageSuggest?: (payload: { city: string; planId?: string }) => void;
  /** 复杂纠纷人工客服入口 */
  onHumanSupport?: (payload: { reason: string; planId?: string }) => void;
};

let hooks: Phase2TravelExtensionHooks = {};

export function registerPhase2TravelHooks(next: Phase2TravelExtensionHooks): void {
  hooks = { ...hooks, ...next };
}

export function getPhase2TravelHooks(): Phase2TravelExtensionHooks {
  return hooks;
}

/** 标准化咨询由 AI 承接；复杂纠纷跳转预留客服 */
export function openHumanSupportEntry(reason = 'complex_dispute'): void {
  const handler = hooks.onHumanSupport;
  if (handler) {
    handler({ reason });
    return;
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('holo:human-support', { detail: { reason } }));
  }
}
