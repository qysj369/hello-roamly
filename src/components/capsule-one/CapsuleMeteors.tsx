import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type MeteorSpec = {
  id: number;
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  length: number;
  waitDuration: number;
};

function randomMeteor(id: number): MeteorSpec {
  const fromLeft = Math.random() > 0.5;
  const origin = new THREE.Vector3(
    (fromLeft ? -1 : 1) * (18 + Math.random() * 14),
    10 + Math.random() * 14,
    -28 - Math.random() * 22,
  );
  const direction = new THREE.Vector3(
    fromLeft ? 0.82 + Math.random() * 0.12 : -(0.82 + Math.random() * 0.12),
    -(0.28 + Math.random() * 0.12),
    0.45 + Math.random() * 0.1,
  ).normalize();

  return {
    id,
    origin,
    direction,
    speed: 95 + Math.random() * 35,
    length: 5 + Math.random() * 3,
    waitDuration: 14 + Math.random() * 16 + id * 8,
  };
}

function meteorOpacity(progress: number): number {
  if (progress < 0.08) {
    return progress / 0.08;
  }
  if (progress > 0.55) {
    return Math.max(0, 1 - (progress - 0.55) / 0.45);
  }
  return 1;
}

function Meteor({ spec }: { spec: MeteorSpec }) {
  const meteorRef = useRef(spec);
  const waitRef = useRef(spec.waitDuration);
  const progressRef = useRef(0);
  const lineRef = useRef<THREE.LineBasicMaterial>(null);
  const trailPoints = useMemo(
    () => Array.from({ length: 8 }, () => new THREE.Vector3()),
    [],
  );

  useFrame((_, delta) => {
    if (waitRef.current > 0) {
      waitRef.current -= delta;
      if (lineRef.current) {
        lineRef.current.opacity = 0;
      }
      return;
    }

    const meteor = meteorRef.current;
    progressRef.current += delta * (meteor.speed / 72);
    const opacity = meteorOpacity(progressRef.current);

    const dist = progressRef.current * 72;
    const head = meteor.origin.clone().add(meteor.direction.clone().multiplyScalar(dist));
    const tail = meteor.origin.clone().add(
      meteor.direction.clone().multiplyScalar(dist - meteor.length),
    );

    for (let i = 0; i < trailPoints.length; i += 1) {
      const ratio = i / (trailPoints.length - 1);
      trailPoints[i].copy(tail).lerp(head, ratio);
    }

    if (lineRef.current) {
      lineRef.current.opacity = opacity * 0.62;
    }

    if (progressRef.current >= 1) {
      meteorRef.current = randomMeteor(meteor.id);
      waitRef.current = meteorRef.current.waitDuration;
      progressRef.current = 0;
    }
  });

  return (
    <group raycast={() => null}>
      <Line points={trailPoints} color="#f3efe6" lineWidth={1.6} transparent opacity={0}>
        <lineBasicMaterial ref={lineRef} attach="material" transparent opacity={0} toneMapped={false} />
      </Line>
    </group>
  );
}

/** 夏夜偶发流星 — 一两颗，划破夜空转瞬即逝 */
export default function CapsuleMeteors() {
  const meteors = useMemo(() => [0, 1].map((id) => randomMeteor(id)), []);

  return (
    <group>
      {meteors.map((meteor) => (
        <Meteor key={meteor.id} spec={meteor} />
      ))}
    </group>
  );
}
