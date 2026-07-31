import { useTexture } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const INK_WASH_TEXTURE = '/textures/ink-wash-overlay.svg';

function EarthInkWashOverlayCore() {
  const inkMap = useTexture(INK_WASH_TEXTURE);

  return (
    <mesh scale={1.004} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshBasicMaterial
        map={inkMap}
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.MultiplyBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/** 地球表面水墨山水半透明叠加 */
export default function EarthInkWashOverlay() {
  return (
    <Suspense fallback={null}>
      <EarthInkWashOverlayCore />
    </Suspense>
  );
}
