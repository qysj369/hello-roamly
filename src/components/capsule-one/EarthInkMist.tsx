import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type MistSpec = {
  offset: THREE.Vector3;
  scale: THREE.Vector3;
  speed: number;
  phase: number;
};

const MIST_CLOUDS: MistSpec[] = [
  { offset: new THREE.Vector3(-2.2, 0.4, 1.1), scale: new THREE.Vector3(2.8, 0.55, 1.4), speed: 0.08, phase: 0.2 },
  { offset: new THREE.Vector3(1.8, -0.3, -1.4), scale: new THREE.Vector3(3.2, 0.45, 1.6), speed: 0.06, phase: 1.4 },
  { offset: new THREE.Vector3(0.6, 0.8, 2.0), scale: new THREE.Vector3(2.4, 0.35, 1.2), speed: 0.05, phase: 2.6 },
  { offset: new THREE.Vector3(-1.0, -0.6, -2.2), scale: new THREE.Vector3(2.6, 0.4, 1.5), speed: 0.07, phase: 3.8 },
];

function MistCloud({ offset, scale, speed, phase }: MistSpec) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }
    const t = clock.elapsedTime * speed + phase;
    meshRef.current.position.x = offset.x + Math.sin(t) * 0.35;
    meshRef.current.position.y = offset.y + Math.cos(t * 0.8) * 0.12;
    meshRef.current.position.z = offset.z + Math.sin(t * 0.6) * 0.25;
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.05 + (Math.sin(t * 1.2) + 1) * 0.035;
  });

  return (
    <mesh ref={meshRef} position={offset} scale={scale} raycast={() => null}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial
        color="#8a8a8a"
        transparent
        opacity={0.07}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

/** 闲置时地球周围飘动的半透明水墨云雾 */
export default function EarthInkMist() {
  const clouds = useMemo(() => MIST_CLOUDS, []);

  return (
    <group>
      {clouds.map((cloud, index) => (
        <MistCloud key={index} {...cloud} />
      ))}
    </group>
  );
}
