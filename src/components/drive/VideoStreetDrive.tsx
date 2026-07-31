import { useEffect, useRef, useState } from 'react';
import type { DriveVideoRoute } from '@/data/holoDriveRoutes';
import { getPaceAtTime } from '@/data/holoDriveRoutes';
import { getDriveSpeedPreset, type DriveSpeedPreset } from '@/lib/drive/driveSpeed';

type VideoStreetDriveProps = {
  route: DriveVideoRoute;
  playing: boolean;
  speedId: DriveSpeedPreset['id'];
  loadingLabel: string;
  errorLabel: string;
  demoLabel?: string;
  onReadyChange?: (ready: boolean) => void;
  onLiveSpeed?: (speedKmh: number) => void;
  onFatalError?: () => void;
};

/** 真实行车视频驾驶舱：按时间轴路况变速，丝滑连续 */
export default function VideoStreetDrive({
  route,
  playing,
  speedId,
  loadingLabel,
  errorLabel,
  demoLabel,
  onReadyChange,
  onLiveSpeed,
  onFatalError,
}: VideoStreetDriveProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
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
    setStatus('loading');
    onLiveSpeedRef.current?.(0);
  }, [route.src, route.cityLabel]);

  // 播放 / 暂停
  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== 'ready') {
      return;
    }
    if (playing) {
      void video.play().catch(() => {
        /* 浏览器策略可能拦截，等用户再点出发 */
      });
    } else {
      video.pause();
      onLiveSpeedRef.current?.(0);
    }
  }, [playing, status]);

  // 按时间轴 + 驾驶风格调整倍速与车速表
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    const style = getDriveSpeedPreset(speedId);

    const applyPace = () => {
      const pace = getPaceAtTime(route.paceSegments, video.currentTime || 0);
      const rate = Math.min(2.2, Math.max(0.4, pace.rate * style.videoRateScale));
      if (Math.abs(video.playbackRate - rate) > 0.03) {
        video.playbackRate = rate;
      }
      if (!video.paused) {
        const shown = Math.round(pace.speedKmh * style.speedScale * (0.96 + Math.random() * 0.08));
        onLiveSpeedRef.current?.(Math.max(0, shown));
      }
    };

    applyPace();
    video.addEventListener('timeupdate', applyPace);
    return () => {
      video.removeEventListener('timeupdate', applyPace);
    };
  }, [route.paceSegments, speedId]);

  return (
    <div className="holo-drive__street holo-drive__street--video" aria-label={`${route.cityLabel} 实拍驾驶`}>
      {status === 'loading' ? (
        <div className="holo-drive__street-overlay">{loadingLabel}</div>
      ) : null}
      {status === 'error' ? (
        <div className="holo-drive__street-overlay holo-drive__street-overlay--muted">
          <strong>{errorLabel}</strong>
        </div>
      ) : null}

      <video
        ref={videoRef}
        className="holo-drive__video"
        src={route.src}
        playsInline
        muted
        loop={route.loop !== false}
        preload="auto"
        controls={false}
        onLoadedData={() => setStatus('ready')}
        onCanPlay={() => setStatus('ready')}
        onError={() => {
          setStatus('error');
          onFatalErrorRef.current?.();
        }}
      />

      {status === 'ready' ? <div className="holo-drive__cabin-frame" aria-hidden /> : null}

      {status === 'ready' ? (
        <div className="holo-drive__route-title">
          {route.title}
          {route.isDemo && demoLabel ? ` · ${demoLabel}` : ''}
        </div>
      ) : null}
    </div>
  );
}
