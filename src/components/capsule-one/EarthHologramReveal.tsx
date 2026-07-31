import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const revealVertex = /* glsl */ `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const revealFragment = /* glsl */ `
uniform float reveal;
uniform float time;
varying vec3 vPosition;
void main() {
  float lat = asin(clamp(vPosition.y / ${EARTH_RADIUS.toFixed(1)}, -1.0, 1.0));
  float unfold = smoothstep(reveal * 3.14159 - 1.35, reveal * 3.14159 - 0.25, abs(lat));
  float slice = step(0.82, fract(abs(lat) * 18.0 - time * 2.5));
  float scan = pow(sin(vPosition.y * 36.0 + time * 5.0) * 0.5 + 0.5, 2.0);
  float alpha = unfold * (0.18 + slice * 0.2 + scan * 0.12);
  alpha *= 1.0 - smoothstep(0.82, 1.0, reveal);
  gl_FragColor = vec4(0.0, 0.72, 0.62, alpha);
}
`;

type EarthHologramRevealProps = {
  progressRef: RefObject<number>;
};

/** 地球入场全息展开切片 */
export default function EarthHologramReveal({ progressRef }: EarthHologramRevealProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      reveal: { value: 0 },
      time: { value: 0 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }
    const reveal = progressRef.current ?? 1;
    materialRef.current.uniforms.reveal.value = reveal;
    materialRef.current.uniforms.time.value = clock.elapsedTime;
    materialRef.current.visible = reveal < 0.98;
  });

  return (
    <mesh scale={1.01} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={revealVertex}
        fragmentShader={revealFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
