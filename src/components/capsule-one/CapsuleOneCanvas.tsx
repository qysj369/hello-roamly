import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import EarthGlobe from '@/components/capsule-one/EarthGlobe';
import GlazeOrbitRing from '@/components/capsule-one/GlazeOrbitRing';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { GLAZE_PAPER, PAPER_ROAM_EARTH } from '@/lib/capsule/earthGlazeCore';

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

export default function CapsuleOneCanvas({ onCitySelect }: CapsuleOneCanvasProps) {
  const isMobile = useCapsuleMobileLayout();
  const earthLift = isMobile ? 0.42 : 1.05;

  return (
    <Canvas
      className="capsule-scene__canvas"
      camera={{
        position: [0, isMobile ? 0.75 : 1.2, isMobile ? 17 : 14.5],
        fov: isMobile ? 44 : 42,
        near: 0.1,
        far: 1000,
      }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color(GLAZE_PAPER);
        gl.setClearColor(GLAZE_PAPER, 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = PAPER_ROAM_EARTH.exposure;
      }}
    >
      {/* 宣纸日光 — 柔和、均匀，突出真实地球本色 */}
      <ambientLight intensity={0.52} color="#fffaf4" />
      <directionalLight position={[5, 8, 6]} intensity={1.05} color="#fffef8" />
      <directionalLight position={[-4, 3, -7]} intensity={0.28} color="#dce8f0" />
      <hemisphereLight args={['#faf6ee', '#9ec0d8', 0.42]} />

      <group position={[0, earthLift, 0]}>
        <GlazeOrbitRing />
        <EarthGlobe onCitySelect={onCitySelect} variant="glaze" />
      </group>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.45}
        minDistance={isMobile ? 7.5 : 8}
        maxDistance={isMobile ? 28 : 30}
        enablePan={false}
        enableZoom
        zoomSpeed={isMobile ? 0.85 : 1}
        target={[0, earthLift, 0]}
      />
    </Canvas>
  );
}
