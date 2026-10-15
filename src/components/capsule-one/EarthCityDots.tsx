import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { capsuleCityPoints, type CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { themeTokens } from '@/styles/themeTokens';

/** 轻量圆点：低分段球体 + 单材质实例化，避免逐城图标/贴图 */
const DOT_RADIUS = 0.12;
const DOT_ALTITUDE = 0.08;
const DOT_SEGMENTS = 8;
/** 超过该像素位移视为拖拽（10px），避免地球旋转时误点 */
const DRAG_PX2 = 100;
/** 按下到松开超过此时长，视为按住而非单击 */
const MAX_CLICK_MS = 400;

export type CityDotPointerMode = 'idle' | 'click' | 'drag';

type EarthCityDotsProps = {
  onCityClick: (city: CapsuleCityPoint) => void;
};

type PointerSession = {
  x: number;
  y: number;
  instanceId: number;
  startedAt: number;
};

export function nextCityDotInteractionMode(
  mode: CityDotPointerMode,
  dx: number,
  dy: number,
  thresholdPx2 = DRAG_PX2,
): CityDotPointerMode {
  if (mode === 'idle' || mode === 'drag') {
    return mode;
  }
  if (dx * dx + dy * dy > thresholdPx2) {
    return 'drag';
  }
  return 'click';
}

export function isCityDotTap(
  pointerMode: CityDotPointerMode,
  elapsedMs: number,
  maxClickMs = MAX_CLICK_MS,
): boolean {
  return pointerMode === 'click' && elapsedMs >= 0 && elapsedMs <= maxClickMs;
}

export function resolveCityDotClick(
  instanceId: number | undefined,
  pointerMode: CityDotPointerMode,
  elapsedMs = 0,
  cities: readonly CapsuleCityPoint[] = capsuleCityPoints,
): CapsuleCityPoint | null {
  if (!isCityDotTap(pointerMode, elapsedMs) || instanceId == null || instanceId < 0) {
    return null;
  }
  return cities[instanceId] ?? null;
}

export function cityDotWorldPosition(lat: number, lng: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, EARTH_RADIUS + DOT_ALTITUDE);
}

export default function EarthCityDots({ onCityClick }: EarthCityDotsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pointerModeRef = useRef<CityDotPointerMode>('idle');
  const sessionRef = useRef<PointerSession | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const onCityClickRef = useRef(onCityClick);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = capsuleCityPoints.length;
  onCityClickRef.current = onCityClick;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    capsuleCityPoints.forEach((city, index) => {
      dummy.position.copy(cityDotWorldPosition(city.lat, city.lng));
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [dummy]);

  useEffect(
    () => () => {
      detachRef.current?.();
      detachRef.current = null;
    },
    [],
  );

  const bindWindowPointer = () => {
    detachRef.current?.();
    const onMove = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (!session) {
        return;
      }
      pointerModeRef.current = nextCityDotInteractionMode(
        pointerModeRef.current,
        event.clientX - session.x,
        event.clientY - session.y,
      );
    };
    const onUp = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (session) {
        pointerModeRef.current = nextCityDotInteractionMode(
          pointerModeRef.current,
          event.clientX - session.x,
          event.clientY - session.y,
        );
      }
      detachRef.current?.();
      detachRef.current = null;
      const pointerMode = pointerModeRef.current;
      const instanceId = session?.instanceId;
      const elapsedMs = session
        ? Math.max(0, performance.now() - session.startedAt)
        : Number.POSITIVE_INFINITY;
      sessionRef.current = null;
      pointerModeRef.current = 'idle';
      const city = resolveCityDotClick(instanceId, pointerMode, elapsedMs);
      if (city) {
        onCityClickRef.current(city);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    detachRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  };

  return (
    <instancedMesh
      ref={meshRef}
      name="earth-city-dots"
      args={[undefined, undefined, count]}
      frustumCulled={false}
      onPointerDown={(event) => {
        if (event.instanceId == null) {
          return;
        }
        sessionRef.current = {
          x: event.clientX,
          y: event.clientY,
          instanceId: event.instanceId,
          startedAt: performance.now(),
        };
        pointerModeRef.current = 'click';
        bindWindowPointer();
      }}
    >
      <sphereGeometry args={[DOT_RADIUS, DOT_SEGMENTS, DOT_SEGMENTS]} />
      <meshBasicMaterial color={themeTokens.accentSoft} toneMapped={false} />
    </instancedMesh>
  );
}
