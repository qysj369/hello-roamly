import { useEffect, useRef } from 'react';
import type { DualPanoramaEngine } from '@/lib/drive/BaiduDualPanorama';
import {
  assessRoadPace,
  getDriveSpeedPreset,
  type DriveSpeedPreset,
  type RoadSituation,
} from '@/lib/drive/driveSpeed';
import { headingDelta, pickForwardLink } from '@/lib/drive/pickForwardLink';

type UseBaiduDriveLoopOptions = {
  engine: DualPanoramaEngine | null;
  enabled: boolean;
  playing: boolean;
  speedId: DriveSpeedPreset['id'];
  onRoadEnd?: () => void;
  /** 实时车速（随路况起伏） */
  onLiveSpeed?: (speedKmh: number) => void;
  /** 当前路况文案回调 */
  onSituation?: (situation: RoadSituation) => void;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForLinks(engine: DualPanoramaEngine, timeoutMs: number): Promise<BMapPanoramaLink[]> {
  return new Promise((resolve) => {
    const existing = engine.getLinks();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }

    const pano = engine.getActive();
    if (!pano) {
      resolve([]);
      return;
    }

    let settled = false;
    const finish = (links: BMapPanoramaLink[]) => {
      if (settled) {
        return;
      }
      settled = true;
      pano.removeEventListener('links_changed', onLinks);
      window.clearTimeout(timer);
      resolve(links);
    };

    const onLinks = () => {
      finish(engine.getLinks());
    };

    pano.addEventListener('links_changed', onLinks);
    const timer = window.setTimeout(() => {
      finish(engine.getLinks());
    }, timeoutMs);
  });
}

/** 车速表平滑贴近目标，并带一点真实起伏 */
function createSpeedAnimator(
  onLiveSpeed: ((speedKmh: number) => void) | undefined,
  cancelled: () => boolean,
) {
  let current = 0;
  let target = 0;
  let raf = 0;

  const tick = () => {
    if (cancelled()) {
      return;
    }
    const wobble = Math.sin(performance.now() / 420) * 1.2 + Math.sin(performance.now() / 970) * 0.8;
    current += (target - current) * 0.08;
    const shown = Math.max(0, Math.round(current + (target > 1 ? wobble : 0)));
    onLiveSpeed?.(shown);
    raf = window.requestAnimationFrame(tick);
  };

  raf = window.requestAnimationFrame(tick);

  return {
    setTarget(next: number) {
      target = next;
    },
    stop() {
      window.cancelAnimationFrame(raf);
      onLiveSpeed?.(0);
    },
  };
}

/** 蠕动期间轻微对准前方道路（低频，避免闪屏） */
async function gentleAim(
  engine: DualPanoramaEngine,
  targetHeading: number,
  durationMs: number,
  cancelled: () => boolean,
): Promise<void> {
  const pano = engine.getActive();
  if (!pano) {
    return;
  }
  const start = engine.getPovHeading();
  if (headingDelta(start, targetHeading) < 8) {
    return;
  }

  const steps = Math.max(3, Math.floor(durationMs / 450));
  for (let i = 1; i <= steps; i += 1) {
    if (cancelled()) {
      return;
    }
    const t = i / steps;
    const delta = ((targetHeading - start + 540) % 360) - 180;
    const next = (start + delta * t + 360) % 360;
    pano.setPov({ heading: next, pitch: 0 });
    await wait(durationMs / steps);
  }
}

/**
 * 真实驾驶感循环：
 * 看前方路况 → 决定快/慢 → 画面持续前推 → 预载下一景叠化。
 */
export function useBaiduDriveLoop({
  engine,
  enabled,
  playing,
  speedId,
  onRoadEnd,
  onLiveSpeed,
  onSituation,
}: UseBaiduDriveLoopOptions): void {
  const onRoadEndRef = useRef(onRoadEnd);
  onRoadEndRef.current = onRoadEnd;
  const onLiveSpeedRef = useRef(onLiveSpeed);
  onLiveSpeedRef.current = onLiveSpeed;
  const onSituationRef = useRef(onSituation);
  onSituationRef.current = onSituation;

  useEffect(() => {
    if (!engine || !enabled || !playing) {
      onLiveSpeedRef.current?.(0);
      return undefined;
    }

    let cancelled = false;
    const visited = new Set<string>();
    const style = getDriveSpeedPreset(speedId);
    const speedAnim = createSpeedAnimator((v) => onLiveSpeedRef.current?.(v), () => cancelled);

    const run = async () => {
      await wait(600);
      if (cancelled) {
        return;
      }

      while (!cancelled) {
        if (document.hidden) {
          speedAnim.setTarget(0);
          await wait(400);
          continue;
        }

        const active = engine.getActive();
        const currentId = active?.getId?.();
        if (currentId) {
          visited.add(currentId);
        }

        const links = await waitForLinks(engine, 2000);
        if (cancelled) {
          return;
        }

        const heading = engine.getPovHeading();
        let next = pickForwardLink(links, heading, visited);
        if (!next && visited.size > 5) {
          visited.clear();
          next = pickForwardLink(links, heading);
        }

        const pace = assessRoadPace(links, heading, style, next);
        onSituationRef.current?.(pace.situation);

        if (!next || pace.situation === 'end') {
          speedAnim.setTarget(0);
          onRoadEndRef.current?.();
          return;
        }

        // 先按路况把车速抬起来，同时画面往前蹭
        speedAnim.setTarget(pace.targetSpeedKmh);
        const aimPromise = gentleAim(engine, next.heading, Math.min(1600, pace.creepMs * 0.35), () =>
          cancelled,
        );
        await Promise.all([engine.creepForward(pace.peakScale, pace.creepMs), aimPromise]);
        if (cancelled) {
          return;
        }

        // 路口更谨慎：叠化前略减速
        if (pace.situation === 'junction') {
          speedAnim.setTarget(Math.max(8, pace.targetSpeedKmh * 0.55));
          await wait(280);
        }

        const ok = await engine.advanceTo(next, pace.crossfadeMs);
        engine.resetCreep();
        if (cancelled) {
          return;
        }
        if (!ok) {
          speedAnim.setTarget(0);
          await wait(700);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      speedAnim.stop();
      engine.resetCreep();
    };
  }, [enabled, engine, playing, speedId]);
}
