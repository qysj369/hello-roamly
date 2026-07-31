import { useFrame } from '@react-three/fiber';
import { useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

type EntryRingProps = {
  delay: number;
  tilt: number;
  progressRef: RefObject<number>;
};

function EntryRing({ delay, tilt, progressRef }: EntryRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }
    const progress = progressRef.current ?? 1;
    if (progress > 0.92) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    const t = Math.max(0, progress - delay);
    const scale = 1 + t * 2.8;
    meshRef.current.scale.setScalar(scale);
    meshRef.current.rotation.z = clock.elapsedTime * (0.7 + tilt);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - progress) * 0.32;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2 + tilt, 0, 0]} raycast={() => null}>
      <torusGeometry args={[EARTH_RADIUS + 0.15, 0.028, 8, 120]} />
      <meshBasicMaterial
        color="#00ccaa"
        transparent
        opacity={0.28}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

type EarthEntryBurstProps = {
  progressRef: RefObject<number>;
};

/** 地球入场时的扩散能量环 */
export default function EarthEntryBurst({ progressRef }: EarthEntryBurstProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.6;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.25;
    }
  });

  return (
    <group ref={groupRef} raycast={() => null}>
      <EntryRing delay={0} tilt={0} progressRef={progressRef} />
      <EntryRing delay={0.08} tilt={0.35} progressRef={progressRef} />
      <EntryRing delay={0.16} tilt={-0.28} progressRef={progressRef} />
    </group>
  );
}
