export type SnailFlightQuality = 'high' | 'low';

/** 弱网 / 低内存 / 移动端自动降画质，避免卡死 */
export function detectSnailFlightQuality(): SnailFlightQuality {
  if (typeof window === 'undefined') {
    return 'high';
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'low';
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData) {
    return 'low';
  }
  const effective = nav.connection?.effectiveType;
  if (effective === '2g' || effective === 'slow-2g') {
    return 'low';
  }
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || window.innerWidth < 768) {
    return 'low';
  }
  return 'high';
}

export function snailFlightImageryMaxLevel(quality: SnailFlightQuality): number {
  return quality === 'low' ? 15 : 16;
}

export function snailFlightResolutionScale(quality: SnailFlightQuality): number {
  return quality === 'low' ? 0.85 : 1;
}
