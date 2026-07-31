import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { sampleCurve } from '@/components/capsule-one/geoMath';

type RouteGeometry = {
  id: string;
  points: THREE.Vector3[];
};

type ArcChaserProps = {
  points: THREE.Vector3[];
  phase: number;
  speed: number;
  reverse?: boolean;
};

function ArcChaser({ points, phase, speed, reverse = false }: ArcChaserProps) {
  const headRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(phase);
  const trailPoints = useMemo(() => new Array(8).fill(null).map(() => new THREE.Vector3()), []);

  useFrame((_, delta) => {
    const direction = reverse ? -1 : 1;
    tRef.current = (tRef.current + delta * speed * direction + 1) % 1;
    const head = sampleCurve(points, tRef.current);
    if (headRef.current) {
      headRef.current.position.copy(head);
    }
    if (glowRef.current) {
      glowRef.current.position.copy(head);
    }

    for (let i = 0; i < trailPoints.length; i += 1) {
      const trailT = (tRef.current - i * 0.018 * direction + 1) % 1;
      trailPoints[i].copy(sampleCurve(points, trailT));
    }
  });

  return (
    <group raycast={() => null}>
      <Line points={trailPoints} color="#335555" lineWidth={1.4} transparent opacity={0.2} />
      <mesh ref={headRef}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial
          color="#557766"
          transparent
          opacity={0.3}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial
          color="#335544"
          transparent
          opacity={0.15}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

type EarthRouteChaserProps = {
  routes: RouteGeometry[];
};

/** 沿热门航线追逐的流光 */
export default function EarthRouteChaser({ routes }: EarthRouteChaserProps) {
  return (
    <group>
      {routes.map((route, index) => (
        <group key={route.id}>
          <ArcChaser points={route.points} phase={(index * 0.31) % 1} speed={0.14} />
          <ArcChaser points={route.points} phase={(index * 0.47 + 0.5) % 1} speed={0.11} reverse />
        </group>
      ))}
    </group>
  );
}
