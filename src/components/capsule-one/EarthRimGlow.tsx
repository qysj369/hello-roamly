import { CAPSULE_GLAZE_COLORS, CAPSULE_INK_COLORS } from '@/lib/config/capsuleDesignTokens';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

const rimVertex = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const rimFragment = /* glsl */ `
uniform vec3 glowColor;
uniform float intensity;
uniform float time;
varying vec3 vNormal;
void main() {
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.4);
  float pulse = 0.96 + sin(time * 0.6) * 0.04;
  gl_FragColor = vec4(glowColor, fresnel * intensity * pulse);
}
`;

type EarthRimGlowProps = {
  variant?: 'ink' | 'glaze';
};

export default function EarthRimGlow({ variant = 'ink' }: EarthRimGlowProps) {
  const isGlaze = variant === 'glaze';
  const glowColor = isGlaze ? CAPSULE_GLAZE_COLORS.holoCyan : CAPSULE_INK_COLORS.glowCyan;
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(glowColor) },
      intensity: { value: isGlaze ? 0.34 : 0.16 },
      time: { value: 0 },
    }),
    [glowColor, isGlaze],
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  return (
    <group raycast={() => null}>
      <mesh scale={isGlaze ? 1.04 : 1.045}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isGlaze ? 0.08 : 0.04}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh scale={1.018}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={rimVertex}
          fragmentShader={rimFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
