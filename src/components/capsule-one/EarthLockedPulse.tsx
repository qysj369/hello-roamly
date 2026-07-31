import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { CAPSULE_INK_COLORS } from '@/lib/config/capsuleDesignTokens';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

/** 锁定目的地后的淡墨脉冲环 */
export default function EarthLockedPulse() {
  const ringRef = useRef<THREE.Mesh>(null);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const pulseKey = useCapsuleOneStore((state) => state.pulseKey);

  useFrame(({ clock }) => {
    if (!ringRef.current || !lockedCity) {
      return;
    }
    const t = clock.elapsedTime;
    const progress = (t * 1.4 + pulseKey) % 1;
    ringRef.current.scale.setScalar(1 + progress * 0.42);
    const material = ringRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.22 * (1 - progress);
  });

  if (!lockedCity) {
    return null;
  }

  const position = latLngToVector3(lockedCity.lat, lockedCity.lng, EARTH_RADIUS + 0.04);
  const normal = position.clone().normalize();

  return (
    <mesh
      ref={ringRef}
      position={position}
      quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)}
      raycast={() => null}
    >
      <ringGeometry args={[0.18, 0.28, 36]} />
      <meshBasicMaterial
        color={CAPSULE_INK_COLORS.cinnabar}
        transparent
        opacity={0.22}
        toneMapped={true}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
