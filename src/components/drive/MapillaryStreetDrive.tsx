import { useEffect, useRef, useState } from 'react';
import { Viewer } from 'mapillary-js';
import 'mapillary-js/dist/mapillary.css';
import { fetchMapillaryNearbyImage } from '@/lib/drive/fetchMapillaryNearby';
import { getDriveSpeedPreset, type DriveSpeedPreset } from '@/lib/drive/driveSpeed';
import { getMapillaryAccessToken } from '@/lib/map/mapillary';

type MapillaryStreetDriveProps = {
  lng: number;
  lat: number;
  cityLabel: string;
  playing: boolean;
  speedId: DriveSpeedPreset['id'];
  loadingLabel: string;
  unavailableTitle: string;
  unavailableDesc: string;
  errorLabel: string;
  configErrorLabel: string;
  onReadyChange?: (ready: boolean) => void;
  onLiveSpeed?: (speedKmh: number) => void;
  onFatalError?: () => void;
};

/** Mapillary 连续序列街景（有覆盖城市/海外更合适） */
export default function MapillaryStreetDrive({
  lng,
  lat,
  cityLabel,
  playing,
  speedId,
  loadingLabel,
  unavailableTitle,
  unavailableDesc,
  errorLabel,
  configErrorLabel,
  onReadyChange,
  onLiveSpeed,
  onFatalError,
}: MapillaryStreetDriveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'error' | 'config'>(
    'loading',
  );
  const onReadyChangeRef = useRef(onReadyChange);
  const onLiveSpeedRef = useRef(onLiveSpeed);
  const onFatalErrorRef = useRef(onFatalError);
  onReadyChangeRef.current = onReadyChange;
  onLiveSpeedRef.current = onLiveSpeed;
  onFatalErrorRef.current = onFatalError;

  useEffect(() => {
    onReadyChangeRef.current?.(status === 'ready');
  }, [status]);

  useEffect(() => {
    const container = containerRef.current;
    const token = getMapillaryAccessToken();
    if (!container) {
      return undefined;
    }
    if (!token) {
      setStatus('config');
      return undefined;
    }

    let disposed = false;
    let viewer: Viewer | null = null;
    setStatus('loading');
    onLiveSpeedRef.current?.(0);

    void (async () => {
      try {
        const nearby = await fetchMapillaryNearbyImage(lng, lat, 180);
        if (disposed) {
          return;
        }
        if (!nearby?.id) {
          setStatus('unavailable');
          onFatalErrorRef.current?.();
          return;
        }

        viewer = new Viewer({
          accessToken: token,
          container,
          imageId: nearby.id,
          component: {
            cover: false,
            bearing: false,
            cache: true,
            direction: true,
            sequence: true,
            zoom: false,
          },
        });
        viewerRef.current = viewer;

        viewer.on('load', () => {
          if (!disposed) {
            setStatus('ready');
          }
        });

        // 部分版本没有明确 load，兜底
        window.setTimeout(() => {
          if (!disposed) {
            setStatus((current) => (current === 'loading' ? 'ready' : current));
          }
        }, 2200);
      } catch (error) {
        console.error('[MapillaryStreetDrive]', error);
        if (!disposed) {
          setStatus('error');
          onFatalErrorRef.current?.();
        }
      }
    })();

    return () => {
      disposed = true;
      viewerRef.current = null;
      if (viewer) {
        void viewer.remove();
      }
      container.innerHTML = '';
    };
  }, [cityLabel, lat, lng]);

  // 播放：调用序列 play；风格影响播放速度（若 API 支持）
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || status !== 'ready') {
      return;
    }

    const style = getDriveSpeedPreset(speedId);
    const sequence = viewer.getComponent('sequence') as
      | {
          play?: () => void;
          stop?: () => void;
        }
      | undefined;

    if (playing) {
      try {
        sequence?.play?.();
        onLiveSpeedRef.current?.(
          Math.round((style.id === 'sport' ? 36 : style.id === 'snail' ? 16 : 26) * style.speedScale),
        );
      } catch {
        /* ignore */
      }
    } else {
      try {
        sequence?.stop?.();
      } catch {
        /* ignore */
      }
      onLiveSpeedRef.current?.(0);
    }
  }, [playing, speedId, status]);

  return (
    <div className="holo-drive__street holo-drive__street--mapillary" aria-label={`${cityLabel} Mapillary`}>
      {status === 'loading' ? (
        <div className="holo-drive__street-overlay">{loadingLabel}</div>
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
      <div ref={containerRef} className="holo-drive__mapillary" />
      {status === 'ready' ? <div className="holo-drive__cabin-frame" aria-hidden /> : null}
    </div>
  );
}
