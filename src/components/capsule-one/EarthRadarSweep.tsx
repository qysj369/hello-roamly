import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const radarVertex = /* glsl */ `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const radarFragment = /* glsl */ `
uniform float time;
varying vec3 vPosition;
void main() {
  float angle = atan(vPosition.z, vPosition.x);
  float sweepPos = fract(time * 0.35);
  float sweepAngle = sweepPos * 6.28318;
  float diff = abs(fract((angle - sweepAngle) / 6.28318 + 0.5) - 0.5) * 6.28318;
  float beam = smoothstep(0.55, 0.0, diff);
  float ring = smoothstep(0.04, 0.0, abs(fract(length(vPosition.xz) * 0.18 - time * 0.25) - 0.5));
  float alpha = beam * 0.06 + ring * 0.03;
  gl_FragColor = vec4(0.0, 0.72, 0.62, alpha);
}
`;

/** 旋转雷达扫描扇面 */
export default function EarthRadarSweep() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <mesh scale={1.012} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={radarVertex}
        fragmentShader={radarFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
