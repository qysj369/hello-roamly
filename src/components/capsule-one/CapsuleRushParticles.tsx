import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

type Streak = {
  x: number;
  y: number;
  z: number;
  speed: number;
  len: number;
};

const COUNT = 96;

function spawnStreak(): Streak {
  return {
    x: (Math.random() - 0.5) * 36,
    y: (Math.random() - 0.5) * 22,
    z: -55 - Math.random() * 45,
    speed: 32 + Math.random() * 38,
    len: 1.2 + Math.random() * 2.4,
  };
}

function StreakMesh({ index, streaksRef }: { index: number; streaksRef: MutableRefObject<Streak[]> }) {
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const streak = streaksRef.current[index];
    if (!headRef.current || !tailRef.current || !coreRef.current) {
      return;
    }
    streak.z += streak.speed * delta;
    if (streak.z > 14) {
      Object.assign(streak, spawnStreak());
    }
    const depth = THREE.MathUtils.smoothstep(streak.z, -70, 12);
    const spread = 0.25 + depth * 1.1;
    const headX = streak.x * spread;
    const headY = streak.y * spread;
    const headZ = streak.z;
    const tailZ = headZ - streak.len * (0.8 + depth * 1.6);

    headRef.current.position.set(headX, headY, headZ);
    tailRef.current.position.set(headX * 0.98, headY * 0.98, tailZ);
    coreRef.current.position.set(headX, headY, (headZ + tailZ) * 0.5);
    coreRef.current.scale.set(0.04 + depth * 0.12, 0.04 + depth * 0.12, streak.len * (0.5 + depth));

    const headMat = headRef.current.material as THREE.MeshBasicMaterial;
    const tailMat = tailRef.current.material as THREE.MeshBasicMaterial;
    const coreMat = coreRef.current.material as THREE.MeshBasicMaterial;
    headMat.opacity = 0.45 + depth * 0.5;
    tailMat.opacity = 0.15 + depth * 0.25;
    coreMat.opacity = 0.2 + depth * 0.35;
  });

  return (
    <group raycast={() => null}>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color="#aaf0ff" transparent opacity={0.7} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={tailRef}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#55bbcc" transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#77ddee" transparent opacity={0.35} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** 扑面粒子流 — 带拖尾的速度线 */
export default function CapsuleRushParticles() {
  const streaksRef = useRef(Array.from({ length: COUNT }, () => spawnStreak()));

  return (
    <group>
      {useMemo(() => Array.from({ length: COUNT }, (_, i) => i), []).map((index) => (
        <StreakMesh key={`rush-${index}`} index={index} streaksRef={streaksRef} />
      ))}
    </group>
  );
}
