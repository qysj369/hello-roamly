import { useEffect, useRef, useState } from 'react';
import type { DriveSpeedPreset } from '@/lib/drive/driveSpeed';
import {
  createDualPanoramaEngine,
  type DualPanoramaEngine,
} from '@/lib/drive/BaiduDualPanorama';
import { useBaiduDriveLoop } from '@/hooks/drive/useBaiduDriveLoop';
import { getBaiduMapAk } from '@/lib/map/baidu';
import { loadBaiduPanorama } from '@/lib/map/baiduPanoramaLoader';
import { gcj02ToBd09 } from '@/lib/map/coordinates';

/** 移动端左右滑动微调朝向（不改驾驶循环底层） */
function useStreetSwipeLook(
  containerRef: React.RefObject<HTMLElement | null>,
  engine: DualPanoramaEngine | null,
  enabled: boolean,
) {
  const startXRef = useRef<number | null>(null);
  const lastHeadingRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !engine || !container) {
      return undefined;
    }

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      startXRef.current = event.touches[0].clientX;
      lastHeadingRef.current = engine.getPovHeading();
    };

    const onMove = (event: TouchEvent) => {
      if (startXRef.current == null || event.touches.length !== 1) return;
      const deltaX = event.touches[0].clientX - startXRef.current;
      const pano = engine.getActive();
      if (!pano?.setPov) return;
      const nextHeading = lastHeadingRef.current - deltaX * 0.28;
      pano.setPov({ heading: nextHeading, pitch: 0 });
      event.preventDefault();
    };

    const onEnd = () => {
      startXRef.current = null;
      lastHeadingRef.current = engine.getPovHeading();
    };

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: false });
    container.addEventListener('touchend', onEnd, { passive: true });
    container.addEventListener('touchcancel', onEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('touchcancel', onEnd);
    };
  }, [containerRef, enabled, engine]);
}

type BaiduStreetViewProps = {
  lng: number;
  lat: number;
  cityLabel: string;
  loadingLabel: string;
  unavailableTitle: string;
  unavailableDesc: string;
  errorLabel: string;
  configErrorLabel: string;
  driving?: boolean;
  playing?: boolean;
  speedId?: DriveSpeedPreset['id'];
  onReadyChange?: (ready: boolean) => void;
  onRoadEnd?: () => void;
  onLiveSpeed?: (speedKmh: number) => void;
};

type StreetViewStatus = 'loading' | 'ready' | 'unavailable' | 'error' | 'config';

function lookupPanorama(
  BMapNS: typeof BMap,
  lng: number,
  lat: number,
  radius: number,
): Promise<BMapPanoramaLocationResult | null> {
  return new Promise((resolve) => {
    const service = new BMapNS.PanoramaService();
    service.getPanoramaByLocation(new BMapNS.Point(lng, lat), radius, (result) => {
      resolve(result);
    });
  });
}

async function resolvePanorama(
  BMapNS: typeof BMap,
  gcjLng: number,
  gcjLat: number,
): Promise<BMapPanoramaLocationResult | null> {
  const bd = gcj02ToBd09(gcjLng, gcjLat);
  const byBd = await lookupPanorama(BMapNS, bd.longitude, bd.latitude, 800);
  if (byBd?.id) {
    return byBd;
  }
  return lookupPanorama(BMapNS, gcjLng, gcjLat, 800);
}

function waitForContainerSize(
  element: HTMLElement,
  minHeight = 120,
  timeoutMs = 8000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const check = () => element.clientWidth >= 80 && element.clientHeight >= minHeight;

    if (check()) {
      resolve();
      return;
    }

    const timer = window.setInterval(() => {
      if (check()) {
        window.clearInterval(timer);
        observer.disconnect();
        resolve();
        return;
      }
      if (performance.now() - started > timeoutMs) {
        window.clearInterval(timer);
        observer.disconnect();
        reject(new Error('街景容器尺寸未就绪'));
      }
    }, 50);

    const observer = new ResizeObserver(() => {
      if (check()) {
        window.clearInterval(timer);
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(element);
  });
}

/** 百度街景驾驶舱：双缓冲交叉淡入，避免一暗一亮 */
export default function BaiduStreetView({
  lng,
  lat,
  cityLabel,
  loadingLabel,
  unavailableTitle,
  unavailableDesc,
  errorLabel,
  configErrorLabel,
  driving = true,
  playing = false,
  speedId = 'snail',
  onReadyChange,
  onRoadEnd,
  onLiveSpeed,
}: BaiduStreetViewProps) {
  const streetRef = useRef<HTMLDivElement>(null);
  const slotARef = useRef<HTMLDivElement>(null);
  const slotBRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<StreetViewStatus>('loading');
  const [engine, setEngine] = useState<DualPanoramaEngine | null>(null);
  const onReadyChangeRef = useRef(onReadyChange);
  onReadyChangeRef.current = onReadyChange;

  useEffect(() => {
    onReadyChangeRef.current?.(status === 'ready');
  }, [status]);

  useEffect(() => {
    const street = streetRef.current;
    const slotA = slotARef.current;
    const slotB = slotBRef.current;
    if (!street || !slotA || !slotB) {
      return undefined;
    }

    if (!getBaiduMapAk()) {
      setStatus('config');
      setEngine(null);
      return undefined;
    }

    let disposed = false;
    let engineInstance: DualPanoramaEngine | null = null;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;
    let failTimer: ReturnType<typeof setTimeout> | null = null;
    let readyTarget: BMapPanoramaInstance | null = null;
    let onReadyEvent: (() => void) | null = null;

    setStatus('loading');
    setEngine(null);

    void (async () => {
      try {
        await waitForContainerSize(street);
        if (disposed) {
          return;
        }

        const BMapNS = await loadBaiduPanorama();
        if (disposed) {
          return;
        }

        const location = await resolvePanorama(BMapNS, lng, lat);
        if (disposed) {
          return;
        }

        if (!location?.id) {
          setStatus('unavailable');
          return;
        }

        await waitForContainerSize(street);
        if (disposed) {
          return;
        }

        engineInstance = createDualPanoramaEngine({
          BMapNS,
          slotA,
          slotB,
          initial: location,
          linksControl: false,
        });

        readyTarget = engineInstance.getActive();
        const markReady = () => {
          if (!disposed) {
            setStatus('ready');
          }
        };

        onReadyEvent = () => {
          if (readyTimer) {
            clearTimeout(readyTimer);
          }
          readyTimer = setTimeout(markReady, 600);
        };

        readyTarget?.addEventListener('position_changed', onReadyEvent);
        readyTarget?.addEventListener('links_changed', onReadyEvent);

        if (!disposed) {
          setEngine(engineInstance);
        }

        readyTimer = setTimeout(markReady, 1600);
        failTimer = setTimeout(() => {
          if (!disposed) {
            setStatus((current) => (current === 'loading' ? 'error' : current));
          }
        }, 18000);
      } catch (error: unknown) {
        console.error('[BaiduStreetView] init failed', error);
        if (!disposed) {
          setStatus('error');
          setEngine(null);
        }
      }
    })();

    return () => {
      disposed = true;
      if (readyTimer) {
        clearTimeout(readyTimer);
      }
      if (failTimer) {
        clearTimeout(failTimer);
      }
      if (readyTarget && onReadyEvent) {
        readyTarget.removeEventListener('position_changed', onReadyEvent);
        readyTarget.removeEventListener('links_changed', onReadyEvent);
      }
      engineInstance?.destroy();
      setEngine(null);
    };
  }, [cityLabel, lat, lng]);

  useBaiduDriveLoop({
    engine,
    enabled: driving && status === 'ready',
    playing,
    speedId,
    onRoadEnd,
    onLiveSpeed,
  });

  useStreetSwipeLook(streetRef, engine, status === 'ready');

  return (
    <div ref={streetRef} className="holo-drive__street" aria-label={`${cityLabel} 街景`}>
      {status === 'loading' ? (
        <div className="holo-drive__street-overlay holo-drive__street-overlay--loading">
          <span className="holo-drive__loading-spinner" aria-hidden />
          <strong>{loadingLabel}</strong>
          <p>左右滑动可微调街景朝向</p>
        </div>
      ) : null}
      {status === 'unavailable' ? (
        <div className="holo-drive__street-overlay holo-drive__street-overlay--muted">
          <strong>{unavailableTitle}</strong>
          <p>{unavailableDesc}</p>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="holo-drive__street-overlay holo-drive__street-overlay--muted">
          <strong>{errorLabel}</strong>
        </div>
      ) : null}
      {status === 'config' ? (
        <div className="holo-drive__street-overlay holo-drive__street-overlay--muted">
          <strong>{configErrorLabel}</strong>
        </div>
      ) : null}

      <div className="holo-drive__pano-stack">
        <div ref={slotARef} className="holo-drive__street-canvas is-front" />
        <div ref={slotBRef} className="holo-drive__street-canvas is-back" />
      </div>

      {status === 'ready' ? <div className="holo-drive__cabin-frame" aria-hidden /> : null}
    </div>
  );
}
