import { useEffect, useState } from 'react';

export type HoloHomeBreakpoint = {
  /** ≥1200px：PC 专属模板 */
  isPc: boolean;
  /** ＜768px：窄屏移动端 */
  isMobile: boolean;
};

/**
 * 首页分支渲染断点（与总指令对齐）
 * - PC：≥1200
 * - 移动：＜768
 * - 768–1199：走移动端模板，避免挤压缩放 PC 布局
 */
export function useHoloHomeBreakpoint(): HoloHomeBreakpoint {
  const [state, setState] = useState<HoloHomeBreakpoint>(() => {
    if (typeof window === 'undefined') {
      return { isPc: true, isMobile: false };
    }
    const w = window.innerWidth;
    return { isPc: w >= 1200, isMobile: w < 768 };
  });

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      setState({ isPc: w >= 1200, isMobile: w < 768 });
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  return state;
}
