/** 驾驶舱移动端判定：窄屏或移动 UA，用于降级街景预览（避免重型引擎直挂） */
export function isMobileDriveClient(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const narrow = window.matchMedia('(max-width: 1023px)').matches;
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  return narrow || uaMobile;
}
