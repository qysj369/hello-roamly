import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { buildArcPoints, sampleCurve } from '@/components/capsule-one/geoMath';
import {
  capsuleHotRoutes,
  getCapsuleCityById,
  type CapsuleCityPoint,
} from '@/data/capsuleHotRoutes';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

/** 补充能量网络连线，与热门航线共同构成城市矩阵 */
const EXTRA_NETWORK_EDGES: readonly [string, string][] = [
  ['xian', 'chengdu'],
  ['xian', 'jinan'],
  ['chengdu', 'chongqing'],
  ['hangzhou', 'nanjing'],
  ['hangzhou', 'suzhou'],
  ['qingdao', 'jinan'],
  ['changsha', 'xiamen'],
  ['nanjing', 'xian'],
  ['dali', 'changsha'],
  ['chongqing', 'xian'],
] as const;

type NetworkEdge = {
  id: string;
  from: CapsuleCityPoint;
  to: CapsuleCityPoint;
  points: THREE.Vector3[];
};

function buildNetworkEdges(): NetworkEdge[] {
  const seen = new Set<string>();
  const edges: NetworkEdge[] = [];

  const addEdge = (fromId: string, toId: string, suffix: string) => {
    const key = [fromId, toId].sort().join(':');
    if (seen.has(key)) {
      return;
    }
    const from = getCapsuleCityById(fromId);
    const to = getCapsuleCityById(toId);
    if (!from || !to) {
      return;
    }
    seen.add(key);
    edges.push({
      id: `${fromId}-${toId}-${suffix}`,
      from,
      to,
      points: buildArcPoints(from.lat, from.lng, to.lat, to.lng, 36, 0.18),
    });
  };

  capsuleHotRoutes.forEach((route) => addEdge(route.fromId, route.toId, 'route'));
  EXTRA_NETWORK_EDGES.forEach(([fromId, toId]) => addEdge(fromId, toId, 'net'));

  return edges;
}

type EnergyPulseProps = {
  edge: NetworkEdge;
  phase: number;
  boosted: boolean;
};

function EnergyPulse({ edge, phase, boosted }: EnergyPulseProps) {
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.LineBasicMaterial>(null);
  const tRef = useRef(phase);

  useFrame((_, delta) => {
    const speed = boosted ? 0.22 : 0.14;
    tRef.current = (tRef.current + delta * speed) % 1;
    const head = sampleCurve(edge.points, tRef.current);
    const tail = sampleCurve(edge.points, (tRef.current - 0.06 + 1) % 1);
    if (headRef.current) {
      headRef.current.position.copy(head);
    }
    if (tailRef.current) {
      tailRef.current.position.copy(tail);
    }
    if (lineRef.current) {
      lineRef.current.opacity = boosted ? 0.18 : 0.08;
    }
  });

  return (
    <group raycast={() => null}>
      <Line points={edge.points} color="#335566" lineWidth={boosted ? 1.2 : 0.8} transparent opacity={0.1}>
        <lineBasicMaterial ref={lineRef} attach="material" transparent opacity={0.08} />
      </Line>
      <mesh ref={tailRef}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial
          color="#335544"
          transparent
          opacity={boosted ? 0.22 : 0.14}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial
          color="#557766"
          transparent
          opacity={0.28}
          toneMapped={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** 城市之间的能量连线脉冲网络 */
export default function EarthCityEnergyWeb() {
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const edges = useMemo(() => buildNetworkEdges(), []);

  return (
    <group>
      {edges.map((edge, index) => {
        const boosted =
          lockedCity != null && (lockedCity.id === edge.from.id || lockedCity.id === edge.to.id);
        return (
          <EnergyPulse
            key={edge.id}
            edge={edge}
            phase={(index * 0.19) % 1}
            boosted={boosted}
          />
        );
      })}
    </group>
  );
}
