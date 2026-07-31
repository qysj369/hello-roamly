/** 首页规划 hook 注册的停止回调，供全局结果浮层关闭时中止请求 */

let planCancelHandler: (() => void) | null = null;

export function registerPlanCancelHandler(handler: (() => void) | null): void {
  planCancelHandler = handler;
}

/** @returns 是否已调用到停止逻辑 */
export function requestPlanCancel(): boolean {
  if (!planCancelHandler) {
    return false;
  }
  planCancelHandler();
  return true;
}
