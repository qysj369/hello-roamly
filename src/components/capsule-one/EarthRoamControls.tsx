import { OrbitControls } from '@react-three/drei';
import { EARTH_ROAM_CAMERA, orbitDistanceLimits } from '@/lib/capsule/earthRoamCamera';

type EarthRoamControlsProps = {
  roaming: boolean;
  onOrbitStart: () => void;
  target: [number, number, number];
  isMobile: boolean;
};

/** 轨道控制器：手动拖拽为默认；漫游时 autoRotate，用户一拖即停 */
export default function EarthRoamControls({
  roaming,
  onOrbitStart,
  target,
  isMobile,
}: EarthRoamControlsProps) {
  const limits = orbitDistanceLimits(isMobile);

  return (
    <OrbitControls
      enableDamping
      dampingFactor={EARTH_ROAM_CAMERA.dampingFactor}
      autoRotate={roaming}
      autoRotateSpeed={EARTH_ROAM_CAMERA.autoRotateSpeed}
      minDistance={limits.minDistance}
      maxDistance={limits.maxDistance}
      minPolarAngle={EARTH_ROAM_CAMERA.minPolarAngle}
      maxPolarAngle={EARTH_ROAM_CAMERA.maxPolarAngle}
      enablePan={false}
      enableZoom
      zoomSpeed={isMobile ? 0.8 : 1}
      rotateSpeed={isMobile ? 0.7 : 0.85}
      target={target}
      onStart={onOrbitStart}
    />
  );
}
