import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { capsuleCityPoints, type CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { themeTokens } from '@/styles/themeTokens';

/** 轻量圆点：低分段球体 + 单材质实例化，避免逐城图标/贴图 */
const DOT_RADIUS = 0.12;
const DOT_ALTITUDE = 0.08;
const DOT_SEGMENTS = 8;
const DRAG_PX2 = 36;

type EarthCityDotsProps = {
  onCityClick: (city: CapsuleCityPoint) => void;
};

export function resolveCityDotClick(
  instanceId: number | undefined,
  dragged: boolean,
  cities: readonly CapsuleCityPoint[] = capsuleCityPoints,
): CapsuleCityPoint | null {
  if (dragged || instanceId == null) {
    return null;
  }
  return cities[instanceId] ?? null;
}

export function cityDotWorldPosition(lat: number, lng: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, EARTH_RADIUS + DOT_ALTITUDE);
}

export default function EarthCityDots({ onCityClick }: EarthCityDotsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = capsuleCityPoints.length;

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

  return (
    <instancedMesh
      ref={meshRef}
      name="earth-city-dots"
      args={[undefined, undefined, count]}
      frustumCulled={false}
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
        if (dx * dx + dy * dy > DRAG_PX2) {
          draggedRef.current = true;
        }
      }}
      onPointerUp={() => {
        pointerDownRef.current = null;
      }}
      onPointerLeave={() => {
        pointerDownRef.current = null;
      }}
      onClick={(event) => {
        event.stopPropagation();
        const city = resolveCityDotClick(event.instanceId, draggedRef.current);
        draggedRef.current = false;
        if (city) {
          onCityClick(city);
        }
      }}
    >
      <sphereGeometry args={[DOT_RADIUS, DOT_SEGMENTS, DOT_SEGMENTS]} />
      <meshBasicMaterial color={themeTokens.accentSoft} toneMapped={false} />
    </instancedMesh>
  );
}
