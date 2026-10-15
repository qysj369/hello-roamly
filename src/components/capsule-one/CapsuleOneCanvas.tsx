import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import EarthGlobe from '@/components/capsule-one/EarthGlobe';
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

/** 基础地球：拖拽旋转/缩放；城市圆点点击由上层处理。不做云层与高级光影 */
export default function CapsuleOneCanvas({ onCitySelect }: CapsuleOneCanvasProps) {
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
        if (import.meta.env.DEV) {
          Object.assign(gl.domElement, { __capsule: { scene, camera } });
        }
      }}
    >
      <ambientLight intensity={0.7} color="#fffaf4" />
      <directionalLight position={[6, 8, 4]} intensity={1.05} color="#fffef8" />
      <hemisphereLight args={['#f4f7fa', '#9eb4c4', 0.45]} />

      <group position={[0, earthLift, 0]}>
        <EarthGlobe onCitySelect={onCitySelect} variant="daylight" interactionMode="display" />
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.35}
        minDistance={isMobile ? 7 : 7.5}
        maxDistance={isMobile ? 24 : 26}
        enablePan={false}
        enableZoom
        zoomSpeed={isMobile ? 0.8 : 1}
        rotateSpeed={isMobile ? 0.7 : 0.85}
        target={lookAtChina.target}
      />
    </Canvas>
  );
}
