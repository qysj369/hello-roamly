import { useEffect, useRef, useState } from 'react';
import SnailFlightHud from '@/components/snail-flight/SnailFlightHud';
import { listSnailFlightImagerySources } from '@/lib/snail-flight/imagery';
import {
  detectSnailFlightQuality,
  snailFlightImageryMaxLevel,
  snailFlightResolutionScale,
} from '@/lib/snail-flight/quality';
import {
  narrationAt,
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
  const [canMute, setCanMute] = useState(false);
  const [fading, setFading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narration, setNarration] = useState(() => narrationAt(route, 0));
  const ambienceRef = useRef<Ambience | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const quality = detectSnailFlightQuality();
    const duration = fast ? SNAIL_FLIGHT_FAST_DURATION_MS : SNAIL_FLIGHT_DURATION_MS;
    let viewer: {
      destroy: () => void;
      camera: { setView: (opts: unknown) => void };
      scene: { screenSpaceCameraController: Record<string, boolean> };
    } | null = null;
    let raf = 0;
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
      look.pitch = Math.min(0.28, Math.max(-0.55, look.pitch - dy * 0.0038));
    };
    const onPointerUp = (event: PointerEvent) => {
      draggingRef.current = false;
      if (host.hasPointerCapture(event.pointerId)) {
        host.releasePointerCapture(event.pointerId);
      }
    };

    const boot = async () => {
      try {
        (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL =
          `${import.meta.env.BASE_URL}cesium/`;
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
        nextViewer.scene.globe.maximumScreenSpaceError = quality === 'low' ? 3.6 : 2;
        nextViewer.scene.globe.tileCacheSize = quality === 'low' ? 40 : 100;
        nextViewer.scene.globe.enableLighting = quality === 'high';
        nextViewer.scene.fog.enabled = false;
        if (nextViewer.scene.skyAtmosphere) {
          nextViewer.scene.skyAtmosphere.show = quality === 'high';
        }
        nextViewer.scene.globe.showGroundAtmosphere = quality === 'high';
        if (nextViewer.scene.moon) {
          nextViewer.scene.moon.show = false;
        }
        nextViewer.shadows = false;
        const controller = nextViewer.scene.screenSpaceCameraController;
        controller.enableRotate = false;
        controller.enableTranslate = false;
        controller.enableZoom = false;
        controller.enableTilt = false;
        controller.enableLook = false;
        controller.enableCollisionDetection = false;

        nextViewer.imageryLayers.removeAll();
        nextViewer.imageryLayers.addImageryProvider(
          await Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
          ),
        );
        const maxLevel = snailFlightImageryMaxLevel(quality);
        listSnailFlightImagerySources().forEach((source) => {
          nextViewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: source.url,
              subdomains: source.subdomains,
              maximumLevel: maxLevel,
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
          setCanMute(Boolean(ambienceRef.current));
        }

        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled || !viewer) return;
          const t = Math.min(1, (now - start) / duration);
          const pose = sampleFlightPose(route, t);
          const shifted = offsetLonLat(pose.lon, pose.lat, pose.heading, lookRef.current.lateral);
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(shifted.lon, shifted.lat, pose.height),
            orientation: {
              heading: pose.heading + lookRef.current.heading,
              pitch: -0.34 + lookRef.current.pitch,
              roll: 0,
            },
          });
          const beat = narrationAt(route, t);
          setProgress((prev) => (Math.abs(prev - t) > 0.008 ? t : prev));
          setNarration((prev) => (prev.id === beat.id ? prev : beat));
          if (t >= 1 && !landedRef.current) {
            landedRef.current = true;
            setProgress(1);
            setFading(true);
            window.setTimeout(() => {
              if (!cancelled) onLanded();
            }, 1080);
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
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKey);
      ambienceRef.current?.stop();
      ambienceRef.current = null;
      viewer?.destroy();
    };
  }, [fast, onLanded, route]);

  return (
    <div className="snail-flight" aria-label="蜗牛号低空观光">
      <div ref={hostRef} className="snail-flight__canvas" />
      <div className="snail-flight__cockpit" aria-hidden="true" />
      <div className={fading ? 'snail-flight__fade is-on' : 'snail-flight__fade'} />
      {error ? <p className="snail-flight__status">{error}。可退出后重试。</p> : null}
      <SnailFlightHud
        progress={progress}
        narration={narration}
        captionsOn={captionsOn}
        muted={muted}
        canMute={canMute}
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
