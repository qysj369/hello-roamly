import { useEffect, useRef, useState } from 'react';
import SnailFlightHud from '@/components/snail-flight/SnailFlightHud';
import { captionCueToFire } from '@/lib/snail-flight/captionPacks';
import { useSnailFlightCaptionStore } from '@/lib/snail-flight/captionPackStore';
import {
  captionHoldMs,
  isArrivalCaption,
  resolveFlightCaption,
  shouldBeginLandingTransition,
  shouldHoldWaypointCaption,
  SNAIL_FLIGHT_CAPTION_FADE_MS,
  syncCaptionVoiceText,
} from '@/lib/snail-flight/captions';
import { listSnailFlightImagerySources } from '@/lib/snail-flight/imagery';
import {
  detectSnailFlightQuality,
  snailFlightImageryMaxLevel,
  snailFlightResolutionScale,
} from '@/lib/snail-flight/quality';
import {
  offsetLonLat,
  sampleFlightPose,
  SNAIL_FLIGHT_DURATION_MS,
  SNAIL_FLIGHT_FAST_DURATION_MS,
  type SnailFlightRoute,
} from '@/lib/snail-flight/routes';

type SnailFlightViewerProps = {
  route: SnailFlightRoute;
  fast?: boolean;
  onExit: () => void;
  onLanded: () => void;
};

type Ambience = {
  mute: (on: boolean) => void;
  stop: () => void;
};

function moveMeters(lon: number, lat: number, heading: number, meters: number) {
  const east = Math.sin(heading) * meters;
  const north = Math.cos(heading) * meters;
  const dLat = north / 111_320;
  const dLon = east / (111_320 * Math.cos((lat * Math.PI) / 180) || 1);
  return { lon: lon + dLon, lat: lat + dLat };
}

function createAmbience(): Ambience | null {
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.07;
  master.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 76;
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.22;
  osc.connect(oscGain).connect(master);
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.32;
  noise.connect(filter).connect(noiseGain).connect(master);
  osc.start();
  noise.start();
  ctx.resume().catch(() => undefined);
  return {
    mute: (on) => {
      master.gain.value = on ? 0 : 0.07;
    },
    stop: () => {
      try {
        osc.stop();
        noise.stop();
      } catch {
        /* already stopped */
      }
      ctx.close().catch(() => undefined);
    },
  };
}

export default function SnailFlightViewer({
  route,
  fast,
  onExit,
  onLanded,
}: SnailFlightViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lookRef = useRef({ heading: 0, pitch: 0, lateral: 0 });
  const draggingRef = useRef(false);
  const lastPtrRef = useRef({ x: 0, y: 0 });
  const landedRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [fading, setFading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const packId = useSnailFlightCaptionStore((state) => state.packId);
  const [captionBeatId, setCaptionBeatId] = useState('');
  const [captionCardId, setCaptionCardId] = useState('takeoff');
  const [captionVisible, setCaptionVisible] = useState(false);
  const captionCard = resolveFlightCaption(route, packId, captionCardId);
  const ambienceRef = useRef<Ambience | null>(null);
  const progressLabelRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const lastPctRef = useRef(-1);
  const flightDoneRef = useRef(false);
  const arrivalCaptionDoneRef = useRef(false);
  const captionCycleRef = useRef(0);
  const captionsOnRef = useRef(captionsOn);
  const onLandedRef = useRef(onLanded);
  const firedCuesRef = useRef(new Set<string>());
  const tryFinishRef = useRef<() => void>(() => undefined);
  captionsOnRef.current = captionsOn;
  onLandedRef.current = onLanded;
  tryFinishRef.current = () => {
    if (landedRef.current) return;
    if (
      !shouldBeginLandingTransition({
        flightDone: flightDoneRef.current,
        captionsOn: captionsOnRef.current,
        arrivalCaptionDone: arrivalCaptionDoneRef.current,
      })
    ) {
      return;
    }
    landedRef.current = true;
    setFading(true);
    onLandedRef.current();
  };

  useEffect(() => {
    if (!captionsOn) {
      setCaptionVisible(false);
      tryFinishRef.current();
      return undefined;
    }
    if (!shouldHoldWaypointCaption(captionBeatId)) {
      setCaptionVisible(false);
      return undefined;
    }
    const cycle = captionCycleRef.current + 1;
    captionCycleRef.current = cycle;
    if (isArrivalCaption(captionBeatId)) {
      arrivalCaptionDoneRef.current = false;
    }
    const hold = captionHoldMs(fast);
    const delayIn = cycle === 1 ? 32 : SNAIL_FLIGHT_CAPTION_FADE_MS;
    setCaptionVisible(false);
    let arrivalTimer = 0;
    const showTimer = window.setTimeout(() => {
      if (captionCycleRef.current !== cycle) return;
      setCaptionCardId(captionBeatId);
      setCaptionVisible(true);
    }, delayIn);
    const hideTimer = window.setTimeout(() => {
      if (captionCycleRef.current !== cycle) return;
      setCaptionVisible(false);
      if (!isArrivalCaption(captionBeatId)) return;
      arrivalTimer = window.setTimeout(() => {
        if (captionCycleRef.current !== cycle) return;
        arrivalCaptionDoneRef.current = true;
        tryFinishRef.current();
      }, SNAIL_FLIGHT_CAPTION_FADE_MS);
    }, delayIn + hold);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(arrivalTimer);
    };
  }, [captionsOn, fast, captionBeatId]);

  useEffect(() => {
    syncCaptionVoiceText(captionVisible ? captionCard : null, captionVisible);
  }, [captionCard, captionVisible]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const quality = detectSnailFlightQuality();
    const duration = fast ? SNAIL_FLIGHT_FAST_DURATION_MS : SNAIL_FLIGHT_DURATION_MS;
    let viewer: {
      destroy: () => void;
      camera: {
        lookAt: (target: unknown, offset: unknown) => void;
        frustum: { near?: number };
      };
      scene: { screenSpaceCameraController: Record<string, boolean> };
    } | null = null;
    let raf = 0;
    let landSafetyTimer = 0;
    let cancelled = false;

    const onKey = (event: KeyboardEvent) => {
      const look = lookRef.current;
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        look.lateral = Math.max(-280, look.lateral - 18);
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        look.lateral = Math.min(280, look.lateral + 18);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      draggingRef.current = true;
      lastPtrRef.current = { x: event.clientX, y: event.clientY };
      host.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = event.clientX - lastPtrRef.current.x;
      const dy = event.clientY - lastPtrRef.current.y;
      lastPtrRef.current = { x: event.clientX, y: event.clientY };
      const look = lookRef.current;
      look.heading += dx * 0.0045;
      look.pitch = Math.min(0.1, Math.max(-0.32, look.pitch - dy * 0.0038));
    };
    const onPointerUp = (event: PointerEvent) => {
      draggingRef.current = false;
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    };

    const boot = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL =
          `${import.meta.env.BASE_URL}cesium/r2/`;
        const Cesium = await import('cesium');
        await import('cesium/Build/Cesium/Widgets/widgets.css');
        if (cancelled || !hostRef.current) return;
        const nextViewer = new Cesium.Viewer(hostRef.current, {
          animation: false,
          timeline: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
          baseLayer: false,
          creditContainer: document.createElement('div'),
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          msaaSamples: quality === 'low' ? 1 : 4,
        });
        viewer = nextViewer as unknown as NonNullable<typeof viewer>;
        if (cancelled) {
          nextViewer.destroy();
          return;
        }
        nextViewer.resolutionScale = snailFlightResolutionScale(quality);
        nextViewer.scene.globe.maximumScreenSpaceError = quality === 'low' ? 4 : 2;
        nextViewer.scene.globe.loadingDescendantLimit = 1;
        nextViewer.scene.globe.tileCacheSize = quality === 'low' ? 160 : 400;
        nextViewer.scene.globe.preloadAncestors = true;
        nextViewer.scene.globe.preloadSiblings = true;
        nextViewer.scene.globe.enableLighting = false;
        nextViewer.scene.fog.enabled = false;
        if (nextViewer.scene.skyAtmosphere) {
          nextViewer.scene.skyAtmosphere.show = false;
        }
        if (nextViewer.scene.skyBox) {
          nextViewer.scene.skyBox.show = false;
        }
        nextViewer.scene.globe.showGroundAtmosphere = false;
        nextViewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#7d9a90');
        nextViewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#1a2420');
        nextViewer.scene.logarithmicDepthBuffer = true;
        if (nextViewer.scene.moon) {
          nextViewer.scene.moon.show = false;
        }
        nextViewer.shadows = false;
        const frustum = nextViewer.camera.frustum as { near?: number; far?: number; fov?: number };
        if (typeof frustum.near === 'number') {
          frustum.near = 20;
        }
        if (typeof frustum.far === 'number') {
          frustum.far = 600_000;
        }
        if (typeof frustum.fov === 'number') {
          frustum.fov = (52 * Math.PI) / 180;
        }
        const controller = nextViewer.scene.screenSpaceCameraController;
        controller.enableRotate = false;
        controller.enableTranslate = false;
        controller.enableZoom = false;
        controller.enableTilt = false;
        controller.enableLook = false;
        controller.enableCollisionDetection = false;

        nextViewer.imageryLayers.removeAll();
        const maxLevel = snailFlightImageryMaxLevel(quality);
        listSnailFlightImagerySources().forEach((source) => {
          nextViewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: source.url,
              subdomains: source.subdomains,
              maximumLevel: maxLevel,
              tileWidth: 256,
              tileHeight: 256,
              hasAlphaChannel: false,
              credit: source.credit,
            }),
          );
        });

        host.addEventListener('pointerdown', onPointerDown);
        host.addEventListener('pointermove', onPointerMove);
        host.addEventListener('pointerup', onPointerUp);
        host.addEventListener('pointercancel', onPointerUp);
        window.addEventListener('keydown', onKey);

        if (quality === 'high') {
          ambienceRef.current = createAmbience();
        }

        const leadProvider = nextViewer.imageryLayers.get(0)?.imageryProvider;
        const prefetched = new Set<string>();
        const prefetchQueue: { x: number; y: number; level: number }[] = [];
        let lastEnqueue = 0;
        const enqueueLead = (lon: number, lat: number, heading: number, nowMs: number) => {
          if (!leadProvider || nowMs - lastEnqueue < 450 || prefetched.size > 12000) return;
          lastEnqueue = nowMs;
          const level = Math.min(maxLevel, leadProvider.maximumLevel || maxLevel);
          const levels = quality === 'low' ? [level] : [Math.max(level - 1, 0), level];
          const scheme = leadProvider.tilingScheme;
          levels.forEach((tileLevel) => {
            [2600, 4000, 5400].forEach((dist) => {
              [-1400, -700, 0, 700, 1400].forEach((side) => {
                const ahead = moveMeters(lon, lat, heading, dist);
                const spot =
                  side === 0
                    ? ahead
                    : moveMeters(ahead.lon, ahead.lat, heading + Math.PI / 2, side);
                const xy = scheme.positionToTileXY(
                  Cesium.Cartographic.fromDegrees(spot.lon, spot.lat),
                  tileLevel,
                );
                if (!xy) return;
                const key = `${tileLevel}/${xy.x}/${xy.y}`;
                if (prefetched.has(key)) return;
                prefetched.add(key);
                prefetchQueue.push({ x: xy.x, y: xy.y, level: tileLevel });
              });
            });
          });
          if (prefetchQueue.length > 40) prefetchQueue.splice(0, prefetchQueue.length - 40);
        };
        const drainLead = () => {
          const job = prefetchQueue.shift();
          if (!job) return;
          const pending = leadProvider?.requestImage(job.x, job.y, job.level);
          pending?.catch(() => undefined);
        };

        firedCuesRef.current = new Set();
        const applyProgress = (t: number) => {
          const clamped = Math.min(1, Math.max(0, t));
          const pct = clamped * 100;
          const rounded = Math.round(pct);
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${pct}%`;
          }
          useSnailFlightCaptionStore.getState().setProgress(clamped);
          if (lastPctRef.current === rounded) return;
          lastPctRef.current = rounded;
          if (progressLabelRef.current) {
            progressLabelRef.current.textContent = `飞行进度 ${rounded}%`;
          }
          setProgress(clamped);
        };

        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled || !viewer) return;
          const t = Math.min(1, (now - start) / duration);
          const pose = sampleFlightPose(route, t);
          const heading = pose.heading + lookRef.current.heading;
          const shifted = offsetLonLat(pose.lon, pose.lat, heading, lookRef.current.lateral);
          const pitch = Math.min(-0.98, Math.max(-1.22, -1.08 + lookRef.current.pitch));
          const aheadM = pose.height / Math.tan(-pitch);
          const east = Math.sin(heading) * aheadM;
          const north = Math.cos(heading) * aheadM;
          const dLat = north / 111_320;
          const dLon = east / (111_320 * Math.cos((shifted.lat * Math.PI) / 180) || 1);
          const range = Math.hypot(pose.height, aheadM);
          viewer.camera.lookAt(
            Cesium.Cartesian3.fromDegrees(shifted.lon + dLon, shifted.lat + dLat, 0),
            new Cesium.HeadingPitchRange(heading, pitch, range),
          );
          const frame = viewer.camera.frustum;
          if (typeof frame.near === 'number') {
            frame.near = Math.min(80, Math.max(20, pose.height * 0.02));
          }
          if (typeof frame.far === 'number') {
            frame.far = Math.max(range * 40, 180_000);
          }
          enqueueLead(shifted.lon, shifted.lat, heading, now);
          drainLead();
          applyProgress(t);
          const cue = captionCueToFire(t, firedCuesRef.current);
          if (cue && shouldHoldWaypointCaption(cue.id)) {
            firedCuesRef.current.add(cue.id);
            setCaptionBeatId((prev) => (prev === cue.id ? prev : cue.id));
          }
          if (t >= 1) {
            flightDoneRef.current = true;
            const arrivalId = ['qingdao-land', 'qingdao-coast', 'approach'].find((id) =>
              firedCuesRef.current.has(id),
            );
            if (!arrivalId && captionsOnRef.current) {
              firedCuesRef.current.add('qingdao-land');
              setCaptionBeatId((prev) => (prev === 'qingdao-land' ? prev : 'qingdao-land'));
            }
            tryFinishRef.current();
            if (!landedRef.current && !landSafetyTimer) {
              landSafetyTimer = window.setTimeout(
                () => {
                  arrivalCaptionDoneRef.current = true;
                  tryFinishRef.current();
                },
                captionHoldMs(fast) + SNAIL_FLIGHT_CAPTION_FADE_MS * 2,
              );
            }
            return;
          }
          raf = window.requestAnimationFrame(tick);
        };
        raf = window.requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '飞行场景无法启动');
        }
      }
    };
    boot().catch(() => undefined);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(landSafetyTimer);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKey);
      ambienceRef.current?.stop();
      ambienceRef.current = null;
      viewer?.destroy();
    };
  }, [fast, route]);

  return (
    <div className="snail-flight" aria-label="蜗牛号低空观光">
      <div ref={hostRef} className="snail-flight__canvas" />
      <div className={fading ? 'snail-flight__fade is-on' : 'snail-flight__fade'} />
      {error ? <p className="snail-flight__status">{error}。可退出后重试。</p> : null}
      <SnailFlightHud
        progress={progress}
        narration={captionCard}
        captionsOn={captionsOn}
        captionVisible={captionVisible}
        muted={muted}
        progressLabelRef={progressLabelRef}
        progressBarRef={progressBarRef}
        onExit={onExit}
        onToggleCaptions={() => setCaptionsOn((value) => !value)}
        onToggleMute={() => {
          const next = !muted;
          setMuted(next);
          ambienceRef.current?.mute(next);
        }}
      />
    </div>
  );
}
