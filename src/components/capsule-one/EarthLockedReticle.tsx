import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  buildSurfaceFrame,
  sampleCurve,
  surfaceLocalToWorld,
  type SurfaceFrame,
} from '@/components/capsule-one/geoMath';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

function ReticleRing({ frame, size, rotationSpeed }: { frame: SurfaceFrame; size: number; rotationSpeed: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const segments = useMemo(() => {
    const gap = size * 0.22;
    const half = size * 0.5;
    const corner = half - gap;
    const lines: [THREE.Vector3, THREE.Vector3][] = [
      [surfaceLocalToWorld(frame, -half, corner), surfaceLocalToWorld(frame, -half, half)],
      [surfaceLocalToWorld(frame, -half, half), surfaceLocalToWorld(frame, -corner, half)],
      [surfaceLocalToWorld(frame, corner, half), surfaceLocalToWorld(frame, half, half)],
      [surfaceLocalToWorld(frame, half, half), surfaceLocalToWorld(frame, half, corner)],
      [surfaceLocalToWorld(frame, half, corner), surfaceLocalToWorld(frame, half, -corner)],
      [surfaceLocalToWorld(frame, half, -corner), surfaceLocalToWorld(frame, half, -half)],
      [surfaceLocalToWorld(frame, half, -half), surfaceLocalToWorld(frame, corner, -half)],
      [surfaceLocalToWorld(frame, corner, -half), surfaceLocalToWorld(frame, -corner, -half)],
      [surfaceLocalToWorld(frame, -corner, -half), surfaceLocalToWorld(frame, -half, -half)],
      [surfaceLocalToWorld(frame, -half, -half), surfaceLocalToWorld(frame, -half, -corner)],
      [surfaceLocalToWorld(frame, -half, -corner), surfaceLocalToWorld(frame, -half, corner)],
    ];
    return lines;
  }, [frame, size]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <group
      ref={groupRef}
      position={frame.position}
      quaternion={new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        frame.normal,
      )}
      raycast={() => null}
    >
      {segments.map((points, index) => (
        <Line
          key={`seg-${index}`}
          points={points.map((point) => point.clone().sub(frame.position))}
          color="#00ccaa"
          lineWidth={1.8}
          transparent
          opacity={0.55}
        />
      ))}
    </group>
  );
}

function Crosshair({ frame, size }: { frame: SurfaceFrame; size: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = -clock.elapsedTime * 0.65;
    }
  });

  const lines = useMemo(
    () => [
      [
        surfaceLocalToWorld(frame, -size, 0).sub(frame.position),
        surfaceLocalToWorld(frame, -size * 0.35, 0).sub(frame.position),
      ],
      [
        surfaceLocalToWorld(frame, size * 0.35, 0).sub(frame.position),
        surfaceLocalToWorld(frame, size, 0).sub(frame.position),
      ],
      [
        surfaceLocalToWorld(frame, 0, -size).sub(frame.position),
        surfaceLocalToWorld(frame, 0, -size * 0.35).sub(frame.position),
      ],
      [
        surfaceLocalToWorld(frame, 0, size * 0.35).sub(frame.position),
        surfaceLocalToWorld(frame, 0, size).sub(frame.position),
      ],
    ],
    [frame, size],
  );

  return (
    <group
      ref={groupRef}
      position={frame.position}
      quaternion={new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        frame.normal,
      )}
      raycast={() => null}
    >
      {lines.map((points, index) => (
        <Line key={`cross-${index}`} points={points} color="#88ccbb" lineWidth={1.4} transparent opacity={0.5} />
      ))}
      <mesh>
        <ringGeometry args={[size * 0.12, size * 0.16, 24]} />
        <meshBasicMaterial
          color="#00ffcc"
          transparent
          opacity={0.5}
          toneMapped={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** 锁定城市后的旋转准星框 */
export default function EarthLockedReticle() {
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);

  if (!lockedCity) {
    return null;
  }

  const frame = buildSurfaceFrame(lockedCity.lat, lockedCity.lng, 0.07);

  return (
    <group raycast={() => null}>
      <ReticleRing frame={frame} size={0.72} rotationSpeed={0.85} />
      <ReticleRing frame={buildSurfaceFrame(lockedCity.lat, lockedCity.lng, 0.075)} size={0.48} rotationSpeed={-1.15} />
      <Crosshair frame={buildSurfaceFrame(lockedCity.lat, lockedCity.lng, 0.08)} size={0.38} />
    </group>
  );
}
