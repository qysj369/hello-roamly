import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { CAPSULE_COLORS } from '@/lib/config/capsuleDesignTokens';

const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragment = /* glsl */ `
uniform vec3 glowColor;
uniform float intensity;
uniform float time;
varying vec3 vNormal;
void main() {
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.4);
  float pulse = 0.85 + sin(time * 1.6) * 0.15;
  gl_FragColor = vec4(glowColor, fresnel * intensity * pulse);
}
`;

/** 地球大气辉光层 */
export default function EarthAtmosphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(CAPSULE_COLORS.techBlue) },
      intensity: { value: 0.55 },
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
    <mesh scale={1.09}>
      <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}
