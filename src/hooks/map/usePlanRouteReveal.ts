import { useEffect, useRef, useState } from 'react';

import { getRouteDrawablePoints, type PlanMapPoint } from '@/lib/map/planMapPoints';
import type { MapCoordinates } from '@/types/domain/travelPlan';
import {
  estimateRouteRevealDurationMs,
  sliceCurvedRouteByProgress,
  type LngLatPair,
} from '@/lib/map/planRoutePath';

type UsePlanRouteRevealOptions = {
  points: PlanMapPoint[];
  active: boolean;
  /** 目的地锚点：路线只连锚点附近的市内游玩点 */
  anchor?: MapCoordinates;
};

/** 行程地图：曲线路径按顺序串联动画（标记始终全部显示，仅动画路径） */
export function usePlanRouteReveal({ points, active, anchor }: UsePlanRouteRevealOptions) {
  const [path, setPath] = useState<LngLatPair[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    const routePoints = getRouteDrawablePoints(points, anchor);

    if (!active || routePoints.length === 0) {
      setPath([]);
      setIsRevealing(false);
      return;
    }

    if (routePoints.length === 1) {
      setPath([[routePoints[0].longitude, routePoints[0].latitude]]);
      setIsRevealing(false);
      return;
    }

    const durationMs = estimateRouteRevealDurationMs(routePoints.length);
    const startedAt = performance.now();
    setIsRevealing(true);
    setPath([[routePoints[0].longitude, routePoints[0].latitude]]);

    let frame = 0;
    const tick = (now: number) => {
      if (runIdRef.current !== runId) {
        return;
      }

      const elapsed = now - startedAt;
      const progress = durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs);
      const snapshot = sliceCurvedRouteByProgress(routePoints, progress);
      setPath(snapshot.path);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      setIsRevealing(false);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      runIdRef.current += 1;
      window.cancelAnimationFrame(frame);
    };
  }, [active, anchor, points]);

  return {
    path,
    isRevealing,
  };
}
