/* eslint-disable react/no-unknown-property -- React Three Fiber mesh props */
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

const washFragment = /* glsl */ `
uniform vec3 innerColor;
uniform vec3 edgeColor;
uniform float intensity;
uniform float time;
varying vec3 vNormal;
void main() {
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
  float pulse = 0.96 + sin(time * 0.45) * 0.04;
  float alpha = smoothstep(0.2, 0.88, fresnel) * intensity * pulse;
  vec3 color = mix(innerColor, edgeColor, smoothstep(0.35, 1.0, fresnel));
  gl_FragColor = vec4(color, alpha);
}
`;

type EarthRimGlowProps = {
  variant?: 'ink' | 'glaze' | 'wash';
};

export default function EarthRimGlow({ variant = 'ink' }: EarthRimGlowProps) {
  const isWash = variant === 'wash';
  const isGlaze = variant === 'glaze';
  const glowColor = isGlaze ? CAPSULE_GLAZE_COLORS.holoCyan : CAPSULE_INK_COLORS.glowCyan;
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo((): Record<string, THREE.IUniform> => {
    if (isWash) {
      return {
        innerColor: { value: new THREE.Color('#eaf6ff') },
        edgeColor: { value: new THREE.Color('#d7e6ee') },
        intensity: { value: 0.82 },
        time: { value: 0 },
      };
    }
    return {
      glowColor: { value: new THREE.Color(glowColor) },
      intensity: { value: isGlaze ? 0.34 : 0.16 },
      time: { value: 0 },
    };
  }, [glowColor, isGlaze, isWash]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.elapsedTime;
    }
  });

  const shellScale = isWash ? 1.02 : 1.045;
  const glazeScale = isGlaze ? 1.04 : shellScale;
  const shellOpacity = isWash ? 0.07 : 0.04;
  const glazeOpacity = isGlaze ? 0.08 : shellOpacity;

  return (
    <group raycast={() => null}>
      <mesh scale={isWash ? shellScale : glazeScale}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={isWash ? '#d7e6ee' : glowColor}
          transparent
          opacity={isWash ? shellOpacity : glazeOpacity}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh scale={isWash ? 1.012 : 1.018}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={rimVertex}
          fragmentShader={isWash ? washFragment : rimFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
