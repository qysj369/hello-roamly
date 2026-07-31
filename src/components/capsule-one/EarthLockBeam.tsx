import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { buildSurfaceFrame } from '@/components/capsule-one/geoMath';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

/** 锁定城市后向太空发射的数据光柱 */
export default function EarthLockBeam() {
  const beamRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const pulseKey = useCapsuleOneStore((state) => state.pulseKey);

  useFrame(({ clock }) => {
    if (!beamRef.current || !glowRef.current || !lockedCity) {
      return;
    }
    const wave = Math.sin(clock.elapsedTime * 4.2 + pulseKey) * 0.5 + 0.5;
    const beamMaterial = beamRef.current.material as THREE.MeshBasicMaterial;
    const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
    beamMaterial.opacity = 0.28 + wave * 0.18;
    glowMaterial.opacity = 0.12 + wave * 0.1;
    beamRef.current.scale.y = 0.85 + wave * 0.3;
  });

  if (!lockedCity) {
    return null;
  }

  const frame = buildSurfaceFrame(lockedCity.lat, lockedCity.lng, 0.05);
  const beamCenter = frame.position.clone().add(frame.normal.clone().multiplyScalar(1.1));

  return (
    <group raycast={() => null}>
      <mesh
        ref={beamRef}
        position={beamCenter}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), frame.normal)}
      >
        <cylinderGeometry args={[0.03, 0.12, 2.2, 10]} />
        <meshBasicMaterial
          color="#336655"
          transparent
          opacity={0.15}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={glowRef}
        position={beamCenter.clone().add(frame.normal.clone().multiplyScalar(1.3))}
        quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), frame.normal)}
      >
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial
          color="#557766"
          transparent
          opacity={0.1}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
