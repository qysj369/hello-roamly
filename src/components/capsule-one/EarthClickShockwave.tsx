import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3 } from '@/components/capsule-one/geoMath';
import { CAPSULE_INK_COLORS } from '@/lib/config/capsuleDesignTokens';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

type InkRippleRingProps = {
  lat: number;
  lng: number;
  delay: number;
  onDone: () => void;
};

function InkRippleRing({ lat, lng, delay, onDone }: InkRippleRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const position = latLngToVector3(lat, lng, EARTH_RADIUS + 0.04);
  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }
    const elapsed = clock.elapsedTime;
    if (startRef.current === null) {
      startRef.current = elapsed;
    }
    const t = elapsed - startRef.current - delay;
    if (t < 0) {
      meshRef.current.visible = false;
      return;
    }
    if (t > 1.4) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onDone();
      }
      return;
    }

    meshRef.current.visible = true;
    const progress = t / 1.4;
    const scale = 0.1 + progress * 1.6;
    meshRef.current.scale.setScalar(scale);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = (1 - progress) * 0.16;
  });

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion} raycast={() => null}>
      <ringGeometry args={[0.1, 0.18, 48]} />
      <meshBasicMaterial
        color={CAPSULE_INK_COLORS.inkMist}
        transparent
        opacity={0.16}
        toneMapped={false}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

type InkRippleBurstProps = {
  id: number;
  lat: number;
  lng: number;
};

function InkRippleBurst({ id, lat, lng }: InkRippleBurstProps) {
  const removeRipple = useCapsuleOneStore((state) => state.removeRipple);
  const doneCount = useRef(0);

  const handleRingDone = () => {
    doneCount.current += 1;
    if (doneCount.current >= 3) {
      removeRipple(id);
    }
  };

  return (
    <group>
      <InkRippleRing lat={lat} lng={lng} delay={0} onDone={handleRingDone} />
      <InkRippleRing lat={lat} lng={lng} delay={0.16} onDone={handleRingDone} />
      <InkRippleRing lat={lat} lng={lng} delay={0.32} onDone={handleRingDone} />
    </group>
  );
}

/** 点击地球后的水墨涟漪扩散 */
export default function EarthClickShockwave() {
  const rippleHits = useCapsuleOneStore((state) => state.rippleHits);

  return (
    <group>
      {rippleHits.map((hit) => (
        <InkRippleBurst key={hit.id} id={hit.id} lat={hit.lat} lng={hit.lng} />
      ))}
    </group>
  );
}
