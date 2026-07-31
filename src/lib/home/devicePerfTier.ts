export type DevicePerfTier = 'high' | 'medium' | 'low';

/** 首页 3D 地球设备性能分级（自动降级用） */
export function detectDevicePerfTier(): DevicePerfTier {
  if (typeof navigator === 'undefined') {
    return 'medium';
  }

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  if (memory != null && memory <= 2) {
    return 'low';
  }
  if (cores <= 4 && isMobile) {
    return 'low';
  }
  if (memory != null && memory <= 4) {
    return 'medium';
  }
  if (cores <= 4) {
    return 'medium';
  }
  return 'high';
}
