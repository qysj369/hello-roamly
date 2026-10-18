import { useEffect, useState } from 'react';

/** Hero 密封 PNG 仅允许外层轻动效；低端 / 省流 / 减少动效时降级静态 */
export function useHoloHeroSoftMotion(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(false);
      return;
    }
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) {
      setEnabled(false);
      return;
    }
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 2) {
      setEnabled(false);
      return;
    }
    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  return enabled;
}
