import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Texture } from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

const holoVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const holoFragment = /* glsl */ `
uniform sampler2D colorMap;
uniform sampler2D specMap;
uniform float time;
uniform float boost;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
void main() {
  vec4 base = texture2D(colorMap, vUv);
  vec4 spec = texture2D(specMap, vUv);

  float scan = pow(sin(vUv.y * 280.0 + time * 4.5) * 0.5 + 0.5, 2.0);
  float grid = step(0.92, fract(vUv.x * 48.0)) + step(0.92, fract(vUv.y * 24.0));
  float sweep = smoothstep(0.02, 0.0, abs(fract(vUv.y * 1.6 - time * 0.22) - 0.5));

  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(vec3(0.55, 0.25, 0.8));
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.8);
  float night = smoothstep(0.15, 0.85, 1.0 - max(dot(vNormal, lightDir), 0.0));
  float cityGlow = spec.r * night;

  vec3 tint = vec3(0.0, 0.55, 0.48);
  vec3 color = base.rgb * 0.95;
  color += tint * scan * 0.06;
  color += tint * grid * 0.035;
  color += tint * sweep * 0.04;
  color += tint * fresnel * 0.12;
  color += vec3(0.15, 0.42, 0.35) * cityGlow * 0.2;

  float alpha = 0.1 + fresnel * 0.08;
  gl_FragColor = vec4(color, alpha);
}
`;

type EarthHologramShellProps = {
  colorMap: Texture;
  specMap: Texture;
};

/** 全息扫描叠加层 — 强对比扫描线 + 暗夜城市灯 */
export default function EarthHologramShell({ colorMap, specMap }: EarthHologramShellProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const particleBoost = useCapsuleOneStore((state) => state.particleBoost);

  const uniforms = useMemo(
    () => ({
      colorMap: { value: colorMap },
      specMap: { value: specMap },
      time: { value: 0 },
      boost: { value: 0 },
    }),
    [colorMap, specMap],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }
    materialRef.current.uniforms.time.value = clock.elapsedTime;
    materialRef.current.uniforms.boost.value = particleBoost - 1;
  });

  return (
    <mesh scale={1.006} raycast={() => null}>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={holoVertex}
        fragmentShader={holoFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        toneMapped={true}
      />
    </mesh>
  );
}
