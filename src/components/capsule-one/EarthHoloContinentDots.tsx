import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Texture } from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { buildHoloContinentCloud } from '@/lib/capsule/earthGlazeHolo';
import { EARTH_GLAZE_TEXTURE_DRIFT } from '@/lib/capsule/earthGlazeCore';

type EarthHoloContinentDotsProps = {
  colorMap: Texture;
};

export default function EarthHoloContinentDots({ colorMap }: EarthHoloContinentDotsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const cloud = useMemo(() => {
    const source = colorMap.image as CanvasImageSource | undefined;
    if (!source) {
      return null;
    }
    return buildHoloContinentCloud(source, EARTH_RADIUS * 0.993, 4);
  }, [colorMap]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * EARTH_GLAZE_TEXTURE_DRIFT.speed * 0.35;
    }
  });

  if (!cloud || cloud.count === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={cloud.count} array={cloud.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={cloud.count} array={cloud.colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={cloud.count} array={cloud.sizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
          uniforms={{
            uPixelRatio: { value: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2) },
          }}
          vertexShader={/* glsl */ `
            attribute float size;
            varying vec3 vColor;
            uniform float uPixelRatio;

            void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * uPixelRatio * (280.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={/* glsl */ `
            varying vec3 vColor;

            void main() {
              vec2 uv = gl_PointCoord - vec2(0.5);
              float dist = length(uv);
              if (dist > 0.5) discard;
              float core = smoothstep(0.5, 0.08, dist);
              gl_FragColor = vec4(vColor * core * 1.15, core * 0.92);
            }
          `}
        />
      </points>
    </group>
  );
}
