import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import EarthGlobe from '@/components/capsule-one/EarthGlobe';
import HoloCityMarkers from '@/components/home/holo/HoloCityMarkers';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { detectDevicePerfTier, type DevicePerfTier } from '@/lib/home/devicePerfTier';
import { PAPER_ROAM_EARTH } from '@/lib/capsule/earthGlazeCore';
import { themeTokens } from '@/styles/themeTokens';

/**
 * drei OrbitControls：autoRotateSpeed=2 ≈ 60fps 下 30 秒一圈。
 * 目标 25–30 秒：取 ~28 秒 → 2 * 30 / 28 ≈ 2.14
 */
const BRAND_EARTH_ROTATE_SPEED = 2.14;

/** 按父容器真实宽高纠正绘制缓冲；勿信 R3F 初始 size（常为默认 300×150） */
function CanvasAspectSync() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) {
      return undefined;
    }

    const apply = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width < 2 || height < 2) {
        return;
      }

      gl.setSize(width, height, false);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (camera instanceof THREE.PerspectiveCamera) {
        const nextAspect = width / height;
        if (Math.abs(camera.aspect - nextAspect) > 0.001) {
          camera.aspect = nextAspect;
          camera.updateProjectionMatrix();
        }
      }
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(parent);
    window.addEventListener('orientationchange', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', apply);
    };
  }, [camera, gl]);

  return null;
}

type HoloEarthCanvasProps = {
  /** @deprecated 品牌纯展示区不再跳转；保留参数以兼容旧调用 */
  onCitySelect?: (city: CapsuleCityPoint) => void;
  /** 悬停加速（品牌展示区关闭） */
  hovered?: boolean;
  /**
   * 纯展示品牌微动效：缓慢自转 + 柔和光点，无点击/拖拽/跳转。
   * 首页蜗牛壳地球默认开启。
   */
  displayOnly?: boolean;
};

function useHoloMobileLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 899px)').matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return isMobile;
}

function HoloEarthScene({
  isMobile,
  tier,
  displayOnly,
}: {
  isMobile: boolean;
  tier: DevicePerfTier;
  displayOnly: boolean;
}) {
  const earthLift = isMobile ? 0.08 : 0.42;
  /** 移动端 / 低性能：光点静止，避免闪烁占帧 */
  const softMarkers = displayOnly;
  const markersGentle = isMobile || tier === 'low' || tier === 'medium';

  return (
    <>
      <ambientLight intensity={0.56} color={themeTokens.lightWarm} />
      <directionalLight
        position={[5, 8, 6]}
        intensity={tier === 'low' || isMobile ? 0.88 : 1.02}
        color={themeTokens.lightSoft}
      />
      {!isMobile && tier === 'high' ? (
        <directionalLight position={[-4, 3, -7]} intensity={0.24} color={themeTokens.lightCool} />
      ) : null}
      <hemisphereLight args={[themeTokens.hemiSky, themeTokens.hemiGround, 0.38]} />

      <group position={[0, earthLift, 0]}>
        <Suspense fallback={null}>
          <EarthGlobe
            onCitySelect={() => undefined}
            autoRotate={false}
            variant="glaze"
            interactionMode="display"
          />
        </Suspense>
        {softMarkers ? (
          <HoloCityMarkers
            onCitySelect={() => undefined}
            visible
            interactive={false}
            gentlePulse={!markersGentle}
            reducedMotion={markersGentle}
          />
        ) : null}
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={BRAND_EARTH_ROTATE_SPEED}
        minDistance={isMobile ? 7.2 : 8.2}
        maxDistance={isMobile ? 26 : 28}
        enablePan={false}
        enableRotate={!displayOnly}
        enableZoom={false}
        target={[0, earthLift, 0]}
      />
    </>
  );
}

/** 首页蜗牛壳内地球 — 默认纯展示缓慢自转 */
export default function HoloEarthCanvas({
  displayOnly = true,
}: HoloEarthCanvasProps) {
  const isMobile = useHoloMobileLayout();
  const frameRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<{ width: number; height: number } | null>(null);
  const tier = useMemo(() => detectDevicePerfTier(), []);
  const dpr: [number, number] =
    isMobile || tier === 'low'
      ? [1, 1]
      : tier === 'medium'
        ? [1, 1.25]
        : [1, 1.5];

  useEffect(() => {
    const el = frameRef.current;
    if (!el) {
      return undefined;
    }

    const syncSize = () => {
      const width = Math.round(el.clientWidth);
      const height = Math.round(el.clientHeight);
      if (width < 64 || height < 64) {
        return;
      }
      setViewSize((prev) =>
        prev && prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={frameRef} className="holo-earth__frame" aria-hidden>
      {viewSize ? (
        <Canvas
          className="holo-earth__canvas"
          style={{ width: '100%', height: '100%', pointerEvents: displayOnly ? 'none' : 'auto' }}
          size={{ width: viewSize.width, height: viewSize.height, top: 0, left: 0 }}
          camera={{
            position: [0, isMobile ? 0.45 : 0.75, isMobile ? 14.8 : 13.2],
            fov: isMobile ? 40 : 42,
            aspect: viewSize.width / viewSize.height,
            near: 0.1,
            far: 1000,
          }}
          dpr={dpr}
          resize={{ debounce: 0, scroll: false }}
          frameloop="always"
          gl={{
            antialias: !isMobile && tier !== 'low',
            alpha: false,
            powerPreference: isMobile || tier === 'low' ? 'low-power' : 'high-performance',
          }}
          onCreated={({ gl, scene, camera }) => {
            const bg = new THREE.Color(themeTokens.bg);
            scene.background = bg;
            gl.setClearColor(bg, 1);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = PAPER_ROAM_EARTH.exposure * (tier === 'low' || isMobile ? 0.96 : 1);
            gl.setSize(viewSize.width, viewSize.height, false);
            if (camera instanceof THREE.PerspectiveCamera) {
              camera.aspect = viewSize.width / viewSize.height;
              camera.updateProjectionMatrix();
            }
          }}
        >
          <CanvasAspectSync />
          <HoloEarthScene isMobile={isMobile} tier={tier} displayOnly={displayOnly} />
        </Canvas>
      ) : null}
    </div>
  );
}
