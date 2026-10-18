/** 平滑滚动到首页「慢行工具箱」（种草弹窗 CTA 统一收敛至此，不重复业务） */
export const HOLO_SLOW_TOOLBOX_ID = 'holo-slow-toolbox';

export function scrollToHoloToolbox(): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(HOLO_SLOW_TOOLBOX_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
