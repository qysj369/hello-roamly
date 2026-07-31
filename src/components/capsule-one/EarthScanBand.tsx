import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

/** 环绕地球的扫描光带 */
export default function EarthScanBand() {
  const bandRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!bandRef.current) {
      return;
    }
    bandRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.55) * 0.85 + 0.35;
    bandRef.current.rotation.z = clock.elapsedTime * 0.22;
    const material = bandRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.18 + Math.sin(clock.elapsedTime * 4.0) * 0.06;
  });

  return (
    <group>
      <mesh ref={bandRef} raycast={() => null}>
        <torusGeometry args={[EARTH_RADIUS + 0.05, 0.018, 10, 160]} />
        <meshBasicMaterial
          color="#226655"
          transparent
          opacity={0.18}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[1.1, 0.4, 0.6]} raycast={() => null}>
        <torusGeometry args={[EARTH_RADIUS + 0.08, 0.012, 8, 128]} />
        <meshBasicMaterial
          color="#224466"
          transparent
          opacity={0.1}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
