import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import EarthGlobe from '@/components/capsule-one/EarthGlobe';
import { useEarthRoam } from '@/components/capsule-one/EarthRoamContext';
import EarthRoamControls from '@/components/capsule-one/EarthRoamControls';
import { latLngToVector3 } from '@/components/capsule-one/geoMath';
import { getCapsuleCityById, type CapsuleCityPoint } from '@/data/capsuleHotRoutes';

type CapsuleOneCanvasProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
};

function useCapsuleMobileLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return isMobile;
}

/** 基础地球：拖拽旋转/缩放。不做云层与高级光影 */
export default function CapsuleOneCanvas({ onCitySelect }: CapsuleOneCanvasProps) {
  const { roaming, interruptRoamOnOrbitStart } = useEarthRoam();
  const isMobile = useCapsuleMobileLayout();
  const earthLift = isMobile ? 0.28 : 0.55;
  const lookAtChina = useMemo(() => {
    const city = getCapsuleCityById('chengdu') ?? { lat: 30.57, lng: 104.07 };
    const dir = latLngToVector3(city.lat, city.lng).normalize();
    const distance = isMobile ? 16 : 13.5;
    return {
      position: [dir.x * distance, dir.y * distance + earthLift, dir.z * distance] as [
        number,
        number,
        number,
      ],
      target: [0, earthLift, 0] as [number, number, number],
    };
  }, [earthLift, isMobile]);

  return (
    <Canvas
      className="capsule-scene__canvas"
      camera={{
        position: lookAtChina.position,
        fov: isMobile ? 46 : 42,
        near: 0.1,
        far: 400,
      }}
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      gl={{
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, scene, camera }) => {
        scene.background = new THREE.Color('#eaf0f3');
        gl.setClearColor('#eaf0f3', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.38;
        if (import.meta.env.DEV) {
          Object.assign(gl.domElement, { __capsule: { scene, camera } });
        }
      }}
    >
      <ambientLight intensity={1.12} color="#fff6ee" />
      <directionalLight position={[-3.5, 7.5, -9]} intensity={1.22} color="#fff4dc" />
      <directionalLight position={[-1, 11, -4]} intensity={0.36} color="#ffeec8" />
      <directionalLight position={[5, 2, 7]} intensity={0.62} color="#6ea8c8" />
      <directionalLight position={[8, 3, -2]} intensity={0.28} color="#6aa3c0" />
      <hemisphereLight args={['#f4f8fc', '#8aa0ae', 0.88]} />

      <group position={[0, earthLift, 0]}>
        <EarthGlobe onCitySelect={onCitySelect} variant="daylight" interactionMode="display" />
      </group>

      <EarthRoamControls
        roaming={roaming}
        onOrbitStart={interruptRoamOnOrbitStart}
        target={lookAtChina.target}
        isMobile={isMobile}
      />
    </Canvas>
  );
}
