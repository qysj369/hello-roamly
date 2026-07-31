import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const SPECULAR_SCALE = 1.003;

function createSpecularTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  ctx.clearRect(0, 0, size, size);

  const highlight = ctx.createRadialGradient(size * 0.34, size * 0.28, 0, size * 0.34, size * 0.28, size * 0.22);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
  highlight.addColorStop(0.18, 'rgba(220, 244, 248, 0.14)');
  highlight.addColorStop(0.42, 'rgba(180, 230, 240, 0.06)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, size, size);

  const rim = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.34, size * 0.5, size * 0.5, size * 0.5);
  rim.addColorStop(0, 'rgba(255, 255, 255, 0)');
  rim.addColorStop(0.82, 'rgba(200, 236, 244, 0.08)');
  rim.addColorStop(0.94, 'rgba(160, 220, 232, 0.18)');
  rim.addColorStop(1, 'rgba(126, 205, 224, 0.24)');

  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** 参考图 · 左上高光 + 边缘柔光 */
export default function EarthGlazeSpecular() {
  const meshRef = useRef<THREE.Mesh>(null);
  const map = useMemo(() => createSpecularTexture(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.08) * 0.015;
  });

  return (
    <mesh ref={meshRef} scale={SPECULAR_SCALE} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshBasicMaterial
        map={map}
        transparent
        opacity={0.28}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
