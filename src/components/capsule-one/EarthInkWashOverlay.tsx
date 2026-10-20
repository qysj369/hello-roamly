/* eslint-disable react/no-unknown-property -- React Three Fiber mesh props */
import { useTexture } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const INK_WASH_TEXTURE = '/textures/ink-wash-overlay.svg?wash=2';

function EarthInkWashOverlayCore({ subtle = false }: { subtle?: boolean }) {
  const inkMap = useTexture(INK_WASH_TEXTURE);

  return (
    <mesh scale={1.004} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshBasicMaterial
        map={inkMap}
        transparent
        opacity={subtle ? 0.34 : 0.22}
        depthWrite={false}
        blending={subtle ? THREE.NormalBlending : THREE.MultiplyBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/** 地球表面水墨山水半透明叠加。subtle 用于亮蓝白天地球，只留淡黛青轮廓 */
export default function EarthInkWashOverlay({ subtle = false }: { subtle?: boolean }) {
  return (
    <Suspense fallback={null}>
      <EarthInkWashOverlayCore subtle={subtle} />
    </Suspense>
  );
}
