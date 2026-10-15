import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { capsuleCityPoints, type CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { themeTokens } from '@/styles/themeTokens';

/** 轻量圆点：低分段球体 + 单材质实例化，避免逐城图标/贴图 */
const DOT_RADIUS = 0.12;
const DOT_ALTITUDE = 0.08;
const DOT_SEGMENTS = 8;
/** 超过该像素位移视为拖拽（10px²），避免地球旋转时误点 */
const DRAG_PX2 = 100;

export type CityDotInteractionMode = 'idle' | 'click' | 'drag';

type EarthCityDotsProps = {
  onCityClick: (city: CapsuleCityPoint) => void;
};

type PointerSession = {
  x: number;
  y: number;
  instanceId: number;
};

export function nextCityDotInteractionMode(
  mode: CityDotInteractionMode,
  dx: number,
  dy: number,
  thresholdPx2 = DRAG_PX2,
): CityDotInteractionMode {
  if (mode === 'idle' || mode === 'drag') {
    return mode;
  }
  if (dx * dx + dy * dy > thresholdPx2) {
    return 'drag';
  }
  return 'click';
}

export function resolveCityDotClick(
  instanceId: number | undefined,
  interactionMode: CityDotInteractionMode,
  cities: readonly CapsuleCityPoint[] = capsuleCityPoints,
): CapsuleCityPoint | null {
  if (interactionMode !== 'click' || instanceId == null || instanceId < 0) {
    return null;
  }
  return cities[instanceId] ?? null;
}

export function cityDotWorldPosition(lat: number, lng: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, EARTH_RADIUS + DOT_ALTITUDE);
}

export default function EarthCityDots({ onCityClick }: EarthCityDotsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const interactionModeRef = useRef<CityDotInteractionMode>('idle');
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
      interactionModeRef.current = nextCityDotInteractionMode(
        interactionModeRef.current,
        event.clientX - session.x,
        event.clientY - session.y,
      );
    };
    const onUp = (event: PointerEvent) => {
      const session = sessionRef.current;
      if (session) {
        interactionModeRef.current = nextCityDotInteractionMode(
          interactionModeRef.current,
          event.clientX - session.x,
          event.clientY - session.y,
        );
      }
      detachRef.current?.();
      detachRef.current = null;
      const mode = interactionModeRef.current;
      const instanceId = session?.instanceId;
      sessionRef.current = null;
      interactionModeRef.current = 'idle';
      const city = resolveCityDotClick(instanceId, mode);
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
        };
        interactionModeRef.current = 'click';
        bindWindowPointer();
      }}
    >
      <sphereGeometry args={[DOT_RADIUS, DOT_SEGMENTS, DOT_SEGMENTS]} />
      <meshBasicMaterial color={themeTokens.accentSoft} toneMapped={false} />
    </instancedMesh>
  );
}
