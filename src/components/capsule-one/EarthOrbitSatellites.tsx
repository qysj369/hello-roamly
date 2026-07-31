import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_SPIN_SPEED } from '@/components/capsule-one/earthMotion';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { capsuleCityPoints } from '@/data/capsuleHotRoutes';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

type SatelliteSpec = {
  id: string;
  orbitRadius: number;
  tilt: number;
  speed: number;
  phase: number;
  anchor: THREE.Vector3;
};

function OrbitSatellite({ spec }: { spec: SatelliteSpec }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }
    const angle = clock.elapsedTime * spec.speed + spec.phase;
    meshRef.current.position.set(
      Math.cos(angle) * spec.orbitRadius,
      Math.sin(angle * 0.7 + spec.tilt) * 0.6,
      Math.sin(angle) * spec.orbitRadius,
    );
    meshRef.current.lookAt(spec.anchor);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = lockedCity ? 0.22 : 0.14;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.12, 0.05, 0.18]} />
      <meshBasicMaterial
        color="#335544"
        transparent
        opacity={0.14}
        toneMapped={true}
        depthWrite={false}
      />
    </mesh>
  );
}

/** 环绕地球的微型数据卫星 */
export default function EarthOrbitSatellites() {
  const satellites = useMemo(
    () =>
      capsuleCityPoints.slice(0, 8).map((city, index) => ({
        id: city.id,
        orbitRadius: EARTH_RADIUS + 1.1 + (index % 3) * 0.35,
        tilt: (index * 0.55) % Math.PI,
        speed: EARTH_SPIN_SPEED * (1.3 + (index % 4) * 0.4),
        phase: index * 0.78,
        anchor: latLngToVector3(city.lat, city.lng, EARTH_RADIUS),
      })),
    [],
  );

  return (
    <group raycast={() => null}>
      {satellites.map((sat) => (
        <OrbitSatellite key={sat.id} spec={sat} />
      ))}
    </group>
  );
}
