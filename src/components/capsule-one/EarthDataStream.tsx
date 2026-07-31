import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS, latLngToVector3, sampleCurve } from '@/components/capsule-one/geoMath';

type StreamParticle = {
  points: THREE.Vector3[];
  phase: number;
  speed: number;
  size: number;
};

function buildMeridianPoints(lng: number, segments = 56): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const lat = -88 + (176 * i) / segments;
    points.push(latLngToVector3(lat, lng, EARTH_RADIUS + 0.025));
  }
  return points;
}

function buildParallelPoints(lat: number, segments = 56): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const lng = -180 + (360 * i) / segments;
    points.push(latLngToVector3(lat, lng, EARTH_RADIUS + 0.025));
  }
  return points;
}

const MERIDIANS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
const PARALLELS = [-60, -30, 0, 30, 60];

function DataParticle({ stream }: { stream: StreamParticle }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(stream.phase);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }
    tRef.current = (tRef.current + delta * stream.speed) % 1;
    const position = sampleCurve(stream.points, tRef.current);
    meshRef.current.position.copy(position);
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    const flicker = 0.75 + Math.sin(tRef.current * Math.PI * 2 * 6) * 0.25;
    material.opacity = flicker * 0.22;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[stream.size, 6, 6]} />
      <meshBasicMaterial
        color="#335544"
        transparent
        opacity={0.22}
        toneMapped={true}
        depthWrite={false}
      />
    </mesh>
  );
}

/** 沿经纬网格流动的数据粒子 */
export default function EarthDataStream() {
  const streams = useMemo(() => {
    const particles: StreamParticle[] = [];
    let seed = 0;

    MERIDIANS.forEach((lng) => {
      const points = buildMeridianPoints(lng);
      for (let i = 0; i < 3; i += 1) {
        seed += 1;
        particles.push({
          points,
          phase: (seed * 0.17) % 1,
          speed: 0.12 + (seed % 5) * 0.04,
          size: 0.035 + (seed % 3) * 0.012,
        });
      }
    });

    PARALLELS.forEach((lat) => {
      const points = buildParallelPoints(lat);
      for (let i = 0; i < 2; i += 1) {
        seed += 1;
        particles.push({
          points,
          phase: (seed * 0.23) % 1,
          speed: 0.1 + (seed % 4) * 0.035,
          size: 0.03 + (seed % 2) * 0.01,
        });
      }
    });

    return particles;
  }, []);

  return (
    <group raycast={() => null}>
      {streams.map((stream, index) => (
        <DataParticle key={`stream-${index}`} stream={stream} />
      ))}
    </group>
  );
}
