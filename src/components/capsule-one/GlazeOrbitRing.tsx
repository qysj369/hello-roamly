import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PAPER_ROAM_ORBITS } from '@/lib/capsule/earthGlazeCore';

function buildOrbitPoints(radiusX: number, radiusY: number, segments = 320): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= segments; index += 1) {
    const t = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radiusX, Math.sin(t) * radiusY, 0));
  }
  return points;
}

function ParticleOrbitLayer({ orbit }: { orbit: (typeof PAPER_ROAM_ORBITS)[number] }) {
  const groupRef = useRef<THREE.Group>(null);

  const orbitPoints = useMemo(
    () => buildOrbitPoints(orbit.radiusX, orbit.radiusY),
    [orbit.radiusX, orbit.radiusY],
  );

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(orbitPoints.length * 3);
    orbitPoints.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    return positions;
  }, [orbitPoints]);

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    return geometry;
  }, [particlePositions]);

  const particleMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: orbit.color,
        size: orbit.size,
        transparent: true,
        opacity: orbit.opacity,
        blending: THREE.NormalBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [orbit.color, orbit.opacity, orbit.size],
  );

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += orbit.spinSpeed;
    }
  });

  return (
    <group ref={groupRef} rotation={[orbit.tiltX, 0, orbit.tiltZ]}>
      <Line
        points={orbitPoints}
        color={orbit.color}
        transparent
        opacity={orbit.lineOpacity}
        dashed
        dashSize={0.42}
        gapSize={0.48}
        lineWidth={1}
        raycast={() => null}
      />
      <points geometry={particleGeometry} material={particleMaterial} raycast={() => null} />
    </group>
  );
}

/** 东方现代 · 淡墨粒子轨道 */
export default function GlazeOrbitRing() {
  return (
    <group>
      {PAPER_ROAM_ORBITS.map((orbit) => (
        <ParticleOrbitLayer key={`${orbit.radiusX}-${orbit.radiusY}-${orbit.color}`} orbit={orbit} />
      ))}
    </group>
  );
}
