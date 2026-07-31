import { bindFutureTravelMotion, runFutureTravelScrollFadeIn } from '@/lib/motion/futureTravelMotion';
import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

/** 未来旅行风：板块滚动渐入 + 桌面 Hero 视差（排除 Capsule 驾驶舱） */
export function useFutureTravelMotion(enabled: boolean, pathname: string) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduceMotion) {
      document
        .querySelectorAll<HTMLElement>('#main-content section, #main-content .ft-fade-block')
        .forEach((el) => el.classList.add('ft-active'));
      return;
    }

    const unbind = bindFutureTravelMotion({ parallax: window.innerWidth > 768 });
    const syncTimer = window.setTimeout(runFutureTravelScrollFadeIn, 180);

    return () => {
      window.clearTimeout(syncTimer);
      unbind();
    };
  }, [enabled, reduceMotion, pathname]);
}
