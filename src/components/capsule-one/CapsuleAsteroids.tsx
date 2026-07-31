import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_SPIN_SPEED } from '@/components/capsule-one/earthMotion';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

type AsteroidSpec = {
  id: number;
  radius: number;
  orbitRadius: number;
  tilt: number;
  speedRatio: number;
  phase: number;
  spin: THREE.Vector3;
};

const ASTEROIDS: AsteroidSpec[] = [
  { id: 0, radius: 0.42, orbitRadius: EARTH_RADIUS + 2.8, tilt: 0.35, speedRatio: 2.3, phase: 0.2, spin: new THREE.Vector3(0.8, 1.1, 0.5) },
  { id: 1, radius: 0.32, orbitRadius: EARTH_RADIUS + 3.6, tilt: -0.5, speedRatio: -2.0, phase: 1.4, spin: new THREE.Vector3(1.2, 0.6, 0.9) },
  { id: 2, radius: 0.55, orbitRadius: EARTH_RADIUS + 4.5, tilt: 0.7, speedRatio: 1.6, phase: 2.6, spin: new THREE.Vector3(0.5, 0.9, 1.1) },
  { id: 3, radius: 0.28, orbitRadius: EARTH_RADIUS + 3.1, tilt: -0.3, speedRatio: 2.7, phase: 3.8, spin: new THREE.Vector3(1.0, 0.7, 0.4) },
  { id: 4, radius: 0.38, orbitRadius: EARTH_RADIUS + 5.2, tilt: 1.0, speedRatio: -1.4, phase: 4.5, spin: new THREE.Vector3(0.6, 1.3, 0.7) },
];

function buildRockGeometry(radius: number) {
  const geo = new THREE.IcosahedronGeometry(radius, 1);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const noise = 0.65 + Math.random() * 0.55;
    positions.setXYZ(i, x * noise, y * noise, z * noise);
  }
  geo.computeVertexNormals();
  return geo;
}

function Asteroid({ spec }: { spec: AsteroidSpec }) {
  const orbitRef = useRef<THREE.Group>(null);
  const rockRef = useRef<THREE.Group>(null);
  const orbitAngle = useRef(spec.phase);
  const geometry = useMemo(() => buildRockGeometry(spec.radius), [spec.radius]);
  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i += 1) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(angle) * spec.orbitRadius,
          Math.sin(angle * 0.6 + spec.tilt) * 1.2,
          Math.sin(angle) * spec.orbitRadius * 0.82,
        ),
      );
    }
    return pts;
  }, [spec.orbitRadius, spec.tilt]);

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * EARTH_SPIN_SPEED * 0.9;
    }
    if (rockRef.current) {
      orbitAngle.current += delta * EARTH_SPIN_SPEED * spec.speedRatio;
      rockRef.current.position.set(
        Math.cos(orbitAngle.current) * spec.orbitRadius,
        Math.sin(orbitAngle.current * 0.6 + spec.tilt) * 1.4,
        Math.sin(orbitAngle.current) * spec.orbitRadius * 0.82,
      );
      rockRef.current.rotation.x += delta * spec.spin.x;
      rockRef.current.rotation.y += delta * spec.spin.y;
      rockRef.current.rotation.z += delta * spec.spin.z;
    }
  });

  return (
    <group ref={orbitRef}>
      <Line points={orbitPoints} color="#448899" lineWidth={1.2} transparent opacity={0.22} />
      <group ref={rockRef}>
        <mesh geometry={geometry}>
          <meshStandardMaterial
            color="#667788"
            roughness={0.78}
            metalness={0.18}
            emissive="#224455"
            emissiveIntensity={0.45}
          />
        </mesh>
        <mesh geometry={geometry} scale={1.06}>
          <meshBasicMaterial color="#55aacc" wireframe transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** 环绕地球的小行星 — 轨道与地球同系旋转 */
export default function CapsuleAsteroids() {
  return (
    <group raycast={() => null}>
      {ASTEROIDS.map((spec) => (
        <Asteroid key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
