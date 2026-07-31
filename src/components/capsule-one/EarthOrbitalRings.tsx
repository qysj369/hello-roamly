import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { EARTH_SPIN_SPEED } from '@/components/capsule-one/earthMotion';
import { CAPSULE_COLORS } from '@/lib/config/capsuleDesignTokens';

type RingSpec = {
  radius: number;
  tilt: [number, number, number];
  speedRatio: number;
  opacity: number;
};

const RINGS: RingSpec[] = [
  { radius: 7.2, tilt: [0.55, 0.2, 0.1], speedRatio: 0.85, opacity: 0.12 },
  { radius: 8.4, tilt: [-0.35, 0.45, 0.25], speedRatio: -0.62, opacity: 0.09 },
  { radius: 9.6, tilt: [0.15, -0.5, 0.35], speedRatio: 0.48, opacity: 0.07 },
];

function DataRing({ radius, tilt, speedRatio, opacity }: RingSpec) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * EARTH_SPIN_SPEED * speedRatio;
    }
  });

  return (
    <group ref={groupRef} rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[radius, 0.018, 8, 128]} />
        <meshBasicMaterial
          color={CAPSULE_COLORS.electronicCyan}
          transparent
          opacity={opacity}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** 地球外轨道数据环 — 转速与地球自转协调 */
export default function EarthOrbitalRings() {
  return (
    <group>
      {RINGS.map((ring) => (
        <DataRing key={ring.radius} {...ring} />
      ))}
    </group>
  );
}
