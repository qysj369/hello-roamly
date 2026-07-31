import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';

type BeamSpec = {
  origin: THREE.Vector3;
  target: THREE.Vector3;
  phase: number;
  width: number;
};

const BEAMS: BeamSpec[] = [
  { origin: new THREE.Vector3(-32, 18, -48), target: new THREE.Vector3(-2, 1.5, EARTH_RADIUS), phase: 0, width: 0.09 },
  { origin: new THREE.Vector3(34, 14, -52), target: new THREE.Vector3(2.5, 0.5, EARTH_RADIUS), phase: 1.1, width: 0.08 },
  { origin: new THREE.Vector3(-26, -16, -44), target: new THREE.Vector3(-1.5, -1, EARTH_RADIUS), phase: 2.3, width: 0.07 },
  { origin: new THREE.Vector3(28, -18, -46), target: new THREE.Vector3(2, -1.5, EARTH_RADIUS), phase: 0.7, width: 0.085 },
  { origin: new THREE.Vector3(0, 28, -55), target: new THREE.Vector3(0, 2.5, EARTH_RADIUS), phase: 1.9, width: 0.1 },
  { origin: new THREE.Vector3(-38, 2, -50), target: new THREE.Vector3(-3, 0, EARTH_RADIUS), phase: 2.8, width: 0.075 },
  { origin: new THREE.Vector3(38, -2, -42), target: new THREE.Vector3(3, 0, EARTH_RADIUS), phase: 3.6, width: 0.08 },
  { origin: new THREE.Vector3(-8, -28, -58), target: new THREE.Vector3(-0.5, -2, EARTH_RADIUS), phase: 4.2, width: 0.09 },
];

function orientToDirection(direction: THREE.Vector3): THREE.Quaternion {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function LightBeam({ origin, target, phase, width }: BeamSpec) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const tubeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const { midpoint, length, quaternion } = useMemo(() => {
    const dir = target.clone().sub(origin);
    const len = dir.length();
    const mid = origin.clone().add(target).multiplyScalar(0.5);
    return {
      midpoint: mid,
      length: len,
      quaternion: orientToDirection(dir),
    };
  }, [origin, target]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const wave = Math.sin(t * 2.2 + phase) * 0.5 + 0.5;
    const travel = (t * 0.35 + phase * 0.2) % 1;

    if (tubeRef.current) {
      const mat = tubeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.28 + wave * 0.32;
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + wave * 0.18;
    }
    if (pulseRef.current) {
      const pos = origin.clone().lerp(target, travel);
      pulseRef.current.position.copy(pos);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + wave * 0.4;
      pulseRef.current.scale.setScalar(0.7 + wave * 0.5);
    }
  });

  return (
    <group raycast={() => null}>
      <mesh ref={tubeRef} position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[width * 0.35, width, length, 10, 1, true]} />
        <meshBasicMaterial
          color="#66ddff"
          transparent
          opacity={0.45}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={glowRef} position={midpoint} quaternion={quaternion}>
        <cylinderGeometry args={[width * 1.8, width * 2.4, length, 8, 1, true]} />
        <meshBasicMaterial
          color="#3399bb"
          transparent
          opacity={0.18}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshBasicMaterial
          color="#ccffff"
          transparent
          opacity={0.7}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** 远处射向地球的粗光束 + 脉冲能量球 */
export default function CapsuleLightBeams() {
  return (
    <group>
      {BEAMS.map((beam, index) => (
        <LightBeam key={`beam-${index}`} {...beam} />
      ))}
    </group>
  );
}
