import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { createInnerMistTexture } from '@/lib/capsule/earthGlazeHolo';

const MIST_SCALE = 0.94;

export default function EarthGlazeInnerMist() {
  const groupRef = useRef<THREE.Group>(null);
  const mistMap = useMemo(() => createInnerMistTexture(), []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) {
      return;
    }
    groupRef.current.rotation.y += delta * 0.045;
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={MIST_SCALE} raycast={() => null}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial
          map={mistMap}
          transparent
          opacity={0.38}
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
