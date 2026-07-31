import { Html } from '@react-three/drei';

import { useFrame, type ThreeEvent } from '@react-three/fiber';

import { useRef, useState } from 'react';

import * as THREE from 'three';

import { CAPSULE_COLORS } from '@/lib/config/capsuleDesignTokens';



type CityBeaconProps = {

  position: THREE.Vector3;

  label: string;

  locked?: boolean;

  onClick: (event: ThreeEvent<MouseEvent>) => void;

};



/** 城市信标 — 悬停标签、锁定高亮、脉冲环 */

export default function CityBeacon({ position, label, locked = false, onClick }: CityBeaconProps) {

  const pulseRef = useRef<THREE.Mesh>(null);

  const ringRef = useRef<THREE.Mesh>(null);

  const beamRef = useRef<THREE.Mesh>(null);

  const [hovered, setHovered] = useState(false);



  useFrame(({ clock }) => {

    const t = clock.elapsedTime;

    const wave = Math.sin(t * 3.6 + position.x);

    const pulse = 1 + wave * (locked ? 0.35 : 0.25);

    if (pulseRef.current) {

      pulseRef.current.scale.setScalar(pulse);

      const material = pulseRef.current.material as THREE.MeshBasicMaterial;

      material.opacity = locked ? 0.42 + wave * 0.1 : 0.22 + wave * 0.08;

    }

    if (ringRef.current) {

      ringRef.current.rotation.z = t * (locked ? 2.2 : 1.2);

    }

    if (beamRef.current) {

      const beamMaterial = beamRef.current.material as THREE.MeshBasicMaterial;

      beamMaterial.opacity = locked ? 0.22 + wave * 0.06 : hovered ? 0.14 : 0.04;

      beamRef.current.scale.y = locked ? 1.2 + wave * 0.15 : hovered ? 0.9 : 0.5;

    }

  });



  const coreColor = locked ? '#66ccaa' : hovered ? '#55aa88' : '#448877';

  const ringColor = locked ? CAPSULE_COLORS.electronicCyan : '#335566';



  return (

    <group position={position}>

      <mesh

        onClick={onClick}

        onPointerOver={() => setHovered(true)}

        onPointerOut={() => setHovered(false)}

      >

        <sphereGeometry args={[0.22, 12, 12]} />

        <meshBasicMaterial color={CAPSULE_COLORS.electronicCyan} transparent opacity={0.01} />

      </mesh>



      <mesh>

        <sphereGeometry args={[0.05, 10, 10]} />

        <meshBasicMaterial color={coreColor} toneMapped={true} />

      </mesh>



      <mesh ref={pulseRef}>

        <sphereGeometry args={[0.09, 10, 10]} />

        <meshBasicMaterial

          color={locked ? '#55aa99' : '#336655'}

          transparent

          opacity={0.22}

          toneMapped={true}

          depthWrite={false}

        />

      </mesh>



      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>

        <ringGeometry args={[locked ? 0.12 : 0.1, locked ? 0.16 : 0.13, 24]} />

        <meshBasicMaterial

          color={ringColor}

          transparent

          opacity={locked ? 0.48 : 0.28}

          toneMapped={true}

          side={THREE.DoubleSide}

          depthWrite={false}

        />

      </mesh>



      <mesh ref={beamRef} position={[0, 0.35, 0]}>

        <cylinderGeometry args={[0.008, 0.02, 0.7, 8]} />

        <meshBasicMaterial

          color={locked ? '#55ccaa' : '#336655'}

          transparent

          opacity={0.04}

          toneMapped={true}

          depthWrite={false}

        />

      </mesh>



      {(hovered || locked) ? (

        <Html

          position={[0, 0.42, 0]}

          center

          distanceFactor={12}

          className="capsule-city-label-html"

          zIndexRange={[90, 0]}

        >

          <span className={`capsule-city-label ${locked ? 'capsule-city-label--locked' : ''}`}>

            {label}

          </span>

        </Html>

      ) : null}

    </group>

  );

}

