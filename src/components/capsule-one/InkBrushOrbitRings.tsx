import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_SPIN_SPEED } from '@/components/capsule-one/earthMotion';
import { CAPSULE_INK_COLORS } from '@/lib/config/capsuleDesignTokens';

/** 仅一条极淡黛青轨道 */
const RING = {
  radiusX: 7.6,
  radiusY: 6.6,
  tilt: [0.44, 0.1, 0.05] as [number, number, number],
  speedRatio: 0.28,
};

function buildEllipsePoints(radiusX: number, radiusY: number, segments = 128): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, 0, Math.sin(angle) * radiusY));
  }
  return points;
}

export default function InkBrushOrbitRings() {
  const groupRef = useRef<THREE.Group>(null);
  const points = useMemo(() => buildEllipsePoints(RING.radiusX, RING.radiusY), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * EARTH_SPIN_SPEED * RING.speedRatio;
    }
  });

  return (
    <group ref={groupRef} rotation={RING.tilt}>
      <Line
        points={points}
        color={CAPSULE_INK_COLORS.daiBlue}
        transparent
        opacity={CAPSULE_INK_COLORS.orbitOpacity}
        lineWidth={0.8}
        raycast={() => null}
      />
    </group>
  );
}
