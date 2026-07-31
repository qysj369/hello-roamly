import { useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { EARTH_GLAZE_ATMOSPHERE, EARTH_GLAZE_FRESNEL, GLAZE_HOLO_CYAN } from '@/lib/capsule/earthGlazeCore';
import { FRESNEL_RIM_FRAGMENT, FRESNEL_RIM_VERTEX } from '@/lib/capsule/earthGlazeHolo';

export default function EarthGlazeFresnelRim() {
  const outerUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color(GLAZE_HOLO_CYAN) },
      power: { value: EARTH_GLAZE_FRESNEL.power },
      intensity: { value: EARTH_GLAZE_FRESNEL.intensity },
    }),
    [],
  );

  const innerUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color('#d8f4f8') },
      power: { value: EARTH_GLAZE_FRESNEL.power * 1.1 },
      intensity: { value: EARTH_GLAZE_FRESNEL.intensity * 0.28 },
    }),
    [],
  );

  return (
    <>
      <mesh scale={EARTH_GLAZE_FRESNEL.scale} raycast={() => null}>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_GLAZE_ATMOSPHERE.segments, EARTH_GLAZE_ATMOSPHERE.segments]} />
        <shaderMaterial
          uniforms={outerUniforms}
          vertexShader={FRESNEL_RIM_VERTEX}
          fragmentShader={FRESNEL_RIM_FRAGMENT}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={EARTH_GLAZE_FRESNEL.scale * 0.998} raycast={() => null}>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_GLAZE_ATMOSPHERE.segments, EARTH_GLAZE_ATMOSPHERE.segments]} />
        <shaderMaterial
          uniforms={innerUniforms}
          vertexShader={FRESNEL_RIM_VERTEX}
          fragmentShader={FRESNEL_RIM_FRAGMENT}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
