import { useTexture } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  computeEarthFocusRotationY,
  EARTH_SPIN_SPEED,
  earthFocusSpinProgress,
  lerpAngleRadians,
} from '@/components/capsule-one/earthMotion';
import EarthCityDots from '@/components/capsule-one/EarthCityDots';
import EarthClickShockwave from '@/components/capsule-one/EarthClickShockwave';
import EarthDataStream from '@/components/capsule-one/EarthDataStream';
import EarthEntryBurst from '@/components/capsule-one/EarthEntryBurst';
import EarthGlazeShell from '@/components/capsule-one/EarthGlazeShell';
import EarthHologramReveal from '@/components/capsule-one/EarthHologramReveal';
import EarthHologramShell from '@/components/capsule-one/EarthHologramShell';
import EarthLockBeam from '@/components/capsule-one/EarthLockBeam';
import EarthLockedPulse from '@/components/capsule-one/EarthLockedPulse';
import EarthLockedReticle from '@/components/capsule-one/EarthLockedReticle';
import EarthRimGlow from '@/components/capsule-one/EarthRimGlow';
import EarthScanBand from '@/components/capsule-one/EarthScanBand';
import EarthOrbitSatellites from '@/components/capsule-one/EarthOrbitSatellites';
import { EARTH_RADIUS, vector3ToLatLng } from '@/components/capsule-one/geoMath';
import { type CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { findNearestHoloCity } from '@/data/holoFeatureCities';
import { handleEarthClick } from '@/lib/capsule/blindBox';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

const EARTH_TEXTURES = {
  color: '/textures/earth_atmos_2048.jpg',
  specular: '/textures/earth_specular_2048.jpg',
  normal: '/textures/earth_normal_2048.jpg',
} as const;

type EarthGlobeCoreProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
  autoRotate?: boolean;
  /** daylight = 真实地球；night = 全息线框；ink = 水墨；glaze = 2+4 琉璃 */
  variant?: 'daylight' | 'night' | 'ink' | 'glaze';
  /** blindbox = Capsule 盲盒；navigate = 跳转；display = 仅观赏（不跳转） */
  interactionMode?: 'blindbox' | 'navigate' | 'display';
};

function EarthGlazeGlobeCore({
  onCitySelect,
  interactionMode = 'blindbox',
}: Pick<EarthGlobeCoreProps, 'onCitySelect' | 'interactionMode'>) {
  const groupRef = useRef<THREE.Group>(null);
  const entryScaleRef = useRef(0.22);
  const entryProgressRef = useRef(0);
  const focusFromRef = useRef(0);
  const focusStartedAtRef = useRef<number | null>(null);
  const focusTargetRef = useRef<number | null>(null);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const earthFocusLng = useCapsuleOneStore((state) => state.earthFocusLng);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const addRipple = useCapsuleOneStore((state) => state.addRipple);

  useEffect(() => {
    if (earthFocusLng == null || !lockedCity) {
      focusStartedAtRef.current = null;
      focusTargetRef.current = null;
      return;
    }

    focusFromRef.current = groupRef.current?.rotation.y ?? focusFromRef.current;
    focusTargetRef.current = computeEarthFocusRotationY(lockedCity.lat, earthFocusLng);
    focusStartedAtRef.current = performance.now();
  }, [earthFocusLng, lockedCity]);

  useFrame((_, delta) => {
    entryScaleRef.current = THREE.MathUtils.lerp(entryScaleRef.current, 1, delta * 1.15);
    entryProgressRef.current = THREE.MathUtils.clamp((entryScaleRef.current - 0.22) / 0.78, 0, 1);

    if (!groupRef.current) {
      return;
    }

    groupRef.current.scale.setScalar(entryScaleRef.current);

    const focusTarget = focusTargetRef.current;
    const focusStartedAt = focusStartedAtRef.current;
    const isFocusing =
      focusTarget != null && focusStartedAt != null && earthFocusLng != null && lockedCity;

    if (isFocusing) {
      const elapsed = (performance.now() - focusStartedAt) / 1000;
      const progress = earthFocusSpinProgress(elapsed);
      groupRef.current.rotation.y = lerpAngleRadians(focusFromRef.current, focusTarget, progress);
      if (progress >= 1) {
        focusStartedAtRef.current = null;
      }
    }
  });

  const handleGlobeClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!groupRef.current || draggedRef.current) {
      draggedRef.current = false;
      return;
    }

    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const { lat, lng } = vector3ToLatLng(localPoint);
    if (interactionMode === 'display') {
      // 观赏模式：地球本体不跳转，仅保留轻微涟漪反馈
      addRipple(lat, lng);
      return;
    }
    addRipple(lat, lng);
    if (interactionMode === 'navigate') {
      onCitySelect(findNearestHoloCity(lat, lng));
      return;
    }
    handleEarthClick(event, [event], lat, lng);
  };

  return (
    <group ref={groupRef}>
      <EarthGlazeShell
        onClick={handleGlobeClick}
        onPointerDown={(event) => {
          pointerDownRef.current = { x: event.clientX, y: event.clientY };
          draggedRef.current = false;
        }}
        onPointerMove={(event) => {
          const start = pointerDownRef.current;
          if (!start) {
            return;
          }
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (dx * dx + dy * dy > 36) {
            draggedRef.current = true;
          }
        }}
        onPointerUp={() => {
          pointerDownRef.current = null;
        }}
        onPointerLeave={() => {
          pointerDownRef.current = null;
        }}
      />
      <EarthClickShockwave />
      <EarthLockedPulse />
    </group>
  );
}

function EarthGlobeCore({
  autoRotate = false,
  variant = 'daylight',
  onCitySelect,
  interactionMode = 'blindbox',
}: EarthGlobeCoreProps) {
  const isInk = variant === 'ink';
  const isDaylight = variant === 'daylight' || isInk;
  const groupRef = useRef<THREE.Group>(null);
  const wireInnerRef = useRef<THREE.Mesh>(null);
  const wireOuterRef = useRef<THREE.Mesh>(null);
  const entryScaleRef = useRef(0.22);
  const entryProgressRef = useRef(0);
  const focusFromRef = useRef(0);
  const focusStartedAtRef = useRef<number | null>(null);
  const focusTargetRef = useRef<number | null>(null);
  const earthBrightness = useCapsuleOneStore((state) => state.earthBrightness);
  const particleBoost = useCapsuleOneStore((state) => state.particleBoost);
  const earthFocusLng = useCapsuleOneStore((state) => state.earthFocusLng);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const addRipple = useCapsuleOneStore((state) => state.addRipple);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const [colorMap, specMap, bumpMap] = useTexture([
    EARTH_TEXTURES.color,
    EARTH_TEXTURES.specular,
    EARTH_TEXTURES.normal,
  ]);

  useEffect(() => {
    if (earthFocusLng == null || !lockedCity) {
      focusStartedAtRef.current = null;
      focusTargetRef.current = null;
      return;
    }

    focusFromRef.current = groupRef.current?.rotation.y ?? focusFromRef.current;
    focusTargetRef.current = computeEarthFocusRotationY(lockedCity.lat, earthFocusLng);
    focusStartedAtRef.current = performance.now();
  }, [earthFocusLng, lockedCity]);

  useFrame((state, delta) => {
    entryScaleRef.current = THREE.MathUtils.lerp(entryScaleRef.current, 1, delta * 1.15);
    entryProgressRef.current = THREE.MathUtils.clamp((entryScaleRef.current - 0.22) / 0.78, 0, 1);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(entryScaleRef.current);

      const focusTarget = focusTargetRef.current;
      const focusStartedAt = focusStartedAtRef.current;
      const isFocusing =
        focusTarget != null && focusStartedAt != null && earthFocusLng != null && lockedCity;

      if (isFocusing) {
        const elapsed = (performance.now() - focusStartedAt) / 1000;
        const progress = earthFocusSpinProgress(elapsed);
        groupRef.current.rotation.y = lerpAngleRadians(focusFromRef.current, focusTarget, progress);

        if (progress >= 1) {
          focusStartedAtRef.current = null;
        }
      } else if (entryProgressRef.current < 0.95 && interactionMode !== 'display') {
        groupRef.current.rotation.y +=
          delta * (0.45 * (1 - entryProgressRef.current) + EARTH_SPIN_SPEED);
      } else if (autoRotate && earthFocusLng == null) {
        groupRef.current.rotation.y += delta * EARTH_SPIN_SPEED;
      }
    }
    if (wireInnerRef.current) {
      wireInnerRef.current.rotation.y += delta * EARTH_SPIN_SPEED * 0.55;
    }
    if (wireOuterRef.current) {
      wireOuterRef.current.rotation.y += delta * EARTH_SPIN_SPEED * 0.35;
      wireOuterRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }

    const emissiveFrame = 0.35 * earthBrightness + (particleBoost - 1) * 0.12;
    if (wireOuterRef.current && !isDaylight) {
      const outerMaterial = wireOuterRef.current.material as THREE.MeshBasicMaterial;
      outerMaterial.opacity = 0.1 + emissiveFrame * 0.14 * entryProgressRef.current;
    }
    if (wireInnerRef.current && !isDaylight) {
      const innerMaterial = wireInnerRef.current.material as THREE.MeshBasicMaterial;
      innerMaterial.opacity = 0.16 + emissiveFrame * 0.16 * entryProgressRef.current;
    }

    const storeState = useCapsuleOneStore.getState();
    useCapsuleOneStore.setState({
      earthBrightness: THREE.MathUtils.lerp(storeState.earthBrightness, 1, delta * 1.6),
      particleBoost: THREE.MathUtils.lerp(storeState.particleBoost, 1, delta * 1.2),
    });
  });

  /**
   * 等价于原生 Three.js：
   * renderer.domElement.addEventListener('click', … raycaster.intersectObjects([earthMesh]) … handleEarthClick)
   * R3F 的 mesh onClick 已内置射线检测，命中地球才触发。
   */
  const handleGlobeClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!groupRef.current || draggedRef.current) {
      draggedRef.current = false;
      return;
    }

    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const { lat, lng } = vector3ToLatLng(localPoint);

    addRipple(lat, lng);
    if (interactionMode === 'display') {
      return;
    }
    if (interactionMode === 'navigate') {
      onCitySelect(findNearestHoloCity(lat, lng));
      return;
    }
    handleEarthClick(event, [event], lat, lng);
  };

  return (
    <group ref={groupRef}>
      <mesh
        onClick={handleGlobeClick}
        onPointerDown={(event) => {
          pointerDownRef.current = { x: event.clientX, y: event.clientY };
          draggedRef.current = false;
        }}
        onPointerMove={(event) => {
          const start = pointerDownRef.current;
          if (!start) {
            return;
          }
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (dx * dx + dy * dy > 36) {
            draggedRef.current = true;
          }
        }}
        onPointerUp={() => {
          pointerDownRef.current = null;
        }}
        onPointerLeave={() => {
          pointerDownRef.current = null;
        }}
      >
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={isInk ? 0.04 : isDaylight ? 0.05 : 0.08}
          roughness={isInk ? 0.92 : isDaylight ? 0.62 : 0.78}
          metalness={isInk ? 0 : isDaylight ? 0.02 : 0.04}
          color={isInk ? '#42505c' : '#ffffff'}
          emissive={isInk ? '#1a2430' : isDaylight ? '#8ecae6' : '#0c1e2a'}
          emissiveIntensity={isInk ? 0.1 : isDaylight ? 0.06 : 0.1}
          transparent
          opacity={1}
        />
      </mesh>
      <EarthCityDots onCityClick={onCitySelect} />

      {!isDaylight ? <EarthHologramReveal progressRef={entryProgressRef} /> : null}
      {!isDaylight ? <EarthEntryBurst progressRef={entryProgressRef} /> : null}
      {!isDaylight ? <EarthHologramShell colorMap={colorMap} specMap={specMap} /> : null}
      <EarthRimGlow variant="ink" />
      {!isDaylight && !isInk ? <EarthScanBand /> : null}
      {!isDaylight && !isInk ? <EarthDataStream /> : null}
      <EarthClickShockwave />
      <EarthLockedPulse />
      {!isDaylight && !isInk ? <EarthLockedReticle /> : null}
      {!isInk ? <EarthLockBeam /> : null}

      {!isDaylight ? (
        <>
          <mesh ref={wireInnerRef} scale={1.018} raycast={() => null}>
            <sphereGeometry args={[EARTH_RADIUS, 42, 42]} />
            <meshBasicMaterial color="#3388aa" wireframe transparent opacity={0.16} toneMapped />
          </mesh>

          <mesh ref={wireOuterRef} scale={1.035} raycast={() => null}>
            <sphereGeometry args={[EARTH_RADIUS, 28, 28]} />
            <meshBasicMaterial color="#33aa99" wireframe transparent opacity={0.1} toneMapped />
          </mesh>
        </>
      ) : null}

      {!isDaylight ? <EarthOrbitSatellites /> : null}
    </group>
  );
}

function EarthGlobeFallback({
  autoRotate = false,
  onCitySelect,
  interactionMode = 'blindbox',
}: EarthGlobeCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const addRipple = useCapsuleOneStore((state) => state.addRipple);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * EARTH_SPIN_SPEED;
    }
  });

  const handleGlobeClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!groupRef.current) {
      return;
    }

    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const { lat, lng } = vector3ToLatLng(localPoint);

    addRipple(lat, lng);
    if (interactionMode === 'display') {
      return;
    }
    if (interactionMode === 'navigate') {
      onCitySelect(findNearestHoloCity(lat, lng));
      return;
    }
    handleEarthClick(event, [event], lat, lng);
  };

  return (
    <group ref={groupRef}>
      <mesh onClick={handleGlobeClick}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          color="#9eb8cc"
          transparent
          opacity={0.18}
          transmission={0.92}
          ior={1.45}
          roughness={0.1}
          clearcoat={0.72}
          clearcoatRoughness={0.12}
          depthWrite={false}
          toneMapped
        />
      </mesh>
      <EarthCityDots onCityClick={onCitySelect} />
    </group>
  );
}

type EarthGlobeProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
  autoRotate?: boolean;
  variant?: 'daylight' | 'night' | 'ink' | 'glaze';
  interactionMode?: 'blindbox' | 'navigate' | 'display';
};

export default function EarthGlobe({
  onCitySelect,
  autoRotate,
  variant = 'daylight',
  interactionMode = 'blindbox',
}: EarthGlobeProps) {
  if (variant === 'glaze') {
    return <EarthGlazeGlobeCore onCitySelect={onCitySelect} interactionMode={interactionMode} />;
  }

  return (
    <Suspense
      fallback={
        <EarthGlobeFallback
          onCitySelect={onCitySelect}
          autoRotate={autoRotate}
          interactionMode={interactionMode}
        />
      }
    >
      <EarthGlobeCore
        onCitySelect={onCitySelect}
        autoRotate={autoRotate}
        variant={variant}
        interactionMode={interactionMode}
      />
    </Suspense>
  );
}
