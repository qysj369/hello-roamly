import { useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import {
  createBrightenedCloudMap,
  createLightenedEarthMap,
  EARTH_GLAZE_ATMOSPHERE,
  EARTH_GLAZE_HOVER,
  PAPER_ROAM_EARTH,
} from '@/lib/capsule/earthGlazeCore';

const EARTH_TEXTURES = {
  map: '/textures/earth_daymap_2048.jpg',
  bump: '/textures/earth_normal_2048.jpg',
  clouds: '/textures/earth_clouds_1024.png',
} as const;

type EarthGlazeShellProps = {
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (event: ThreeEvent<PointerEvent>) => void;
};

/** 真实地球 · 自然贴图 + 薄云，无人工光晕 */
function EarthGlazeShellCore({
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: EarthGlazeShellProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const hoverRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [map, bump, clouds] = useTexture([EARTH_TEXTURES.map, EARTH_TEXTURES.bump, EARTH_TEXTURES.clouds]);
  const earthMap = useMemo(() => {
    if (!(map.image instanceof HTMLImageElement)) {
      return map;
    }
    return createLightenedEarthMap(map.image, PAPER_ROAM_EARTH.oceanLift);
  }, [map]);

  const cloudMap = useMemo(() => {
    if (!(clouds.image instanceof HTMLImageElement)) {
      return clouds;
    }
    return createBrightenedCloudMap(clouds.image);
  }, [clouds]);

  useMemo(() => {
    bump.colorSpace = THREE.NoColorSpace;
    bump.anisotropy = 8;
  }, [bump]);

  useEffect(() => {
    return () => {
      map.dispose();
      bump.dispose();
      clouds.dispose();
      if (earthMap !== map) {
        earthMap.dispose();
      }
      if (cloudMap !== clouds) {
        cloudMap.dispose();
      }
    };
  }, [map, bump, clouds, earthMap, cloudMap]);

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, target, delta * EARTH_GLAZE_HOVER.lerp);
    const scale = THREE.MathUtils.lerp(1, EARTH_GLAZE_HOVER.scale, hoverRef.current);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * PAPER_ROAM_EARTH.cloudSpin;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
    >
      <mesh
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <sphereGeometry args={[EARTH_RADIUS, 72, 72]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bump}
          bumpScale={PAPER_ROAM_EARTH.bumpScale}
          roughness={PAPER_ROAM_EARTH.roughness}
          metalness={PAPER_ROAM_EARTH.metalness}
          color="#ffffff"
          envMapIntensity={0}
        />
      </mesh>

      <mesh ref={cloudsRef} scale={PAPER_ROAM_EARTH.cloudScale} raycast={() => null}>
        <sphereGeometry args={[EARTH_RADIUS, 72, 72]} />
        <meshStandardMaterial
          map={cloudMap}
          color="#fffdf8"
          transparent
          opacity={PAPER_ROAM_EARTH.cloudOpacity}
          alphaTest={PAPER_ROAM_EARTH.cloudAlphaTest}
          depthWrite={false}
          roughness={0.95}
          metalness={0}
          emissive="#fff8ee"
          emissiveIntensity={PAPER_ROAM_EARTH.cloudEmissiveIntensity}
          envMapIntensity={0}
        />
      </mesh>
    </group>
  );
}

function EarthGlazeShellFallback() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, EARTH_GLAZE_ATMOSPHERE.segments, EARTH_GLAZE_ATMOSPHERE.segments]} />
      <meshStandardMaterial color="#7aa8c4" roughness={0.72} metalness={0} />
    </mesh>
  );
}

export default function EarthGlazeShell(props: EarthGlazeShellProps) {
  return (
    <Suspense fallback={<EarthGlazeShellFallback />}>
      <EarthGlazeShellCore {...props} />
    </Suspense>
  );
}
