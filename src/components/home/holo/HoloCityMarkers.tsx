import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { latLngToVector3 } from '@/components/capsule-one/geoMath';
import {
  holoEarthSpotlightCityIds,
  holoFeatureCities,
  type HoloFeatureCity,
} from '@/data/holoFeatureCities';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { themeTokens } from '@/styles/themeTokens';

type HoloCityMarkersProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
  /** 悬停地球时才显示点位 */
  visible?: boolean;
  /** 完全关闭缩放脉冲 */
  reducedMotion?: boolean;
  /** 低频柔和呼吸（品牌展示） */
  gentlePulse?: boolean;
  /** 禁止点击 / 悬停标签 */
  interactive?: boolean;
  ignorePointer?: () => boolean;
};

function CityMarker({
  city,
  onSelect,
  pulseMode,
  interactive,
  ignorePointer,
}: {
  city: HoloFeatureCity;
  onSelect: (city: HoloFeatureCity) => void;
  pulseMode: 'off' | 'gentle' | 'normal';
  interactive: boolean;
  ignorePointer?: () => boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [labelOn, setLabelOn] = useState(false);
  const position = useMemo(() => latLngToVector3(city.lat, city.lng, 5.06), [city.lat, city.lng]);

  useFrame((state) => {
    if (!meshRef.current || pulseMode === 'off') {
      return;
    }
    // gentle：约 8s 一呼吸，幅度很小；normal 保留旧节奏
    const speed = pulseMode === 'gentle' ? 0.55 : 2.1;
    const amp = pulseMode === 'gentle' ? 0.06 : 0.18;
    const scale = 1 + Math.sin(state.clock.elapsedTime * speed + city.lat) * amp;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={
          interactive
            ? (event) => {
                event.stopPropagation();
                if (ignorePointer?.()) {
                  return;
                }
                onSelect(city);
              }
            : undefined
        }
        onPointerOver={
          interactive
            ? (event) => {
                event.stopPropagation();
                setLabelOn(true);
                document.body.style.cursor = 'pointer';
              }
            : undefined
        }
        onPointerOut={
          interactive
            ? () => {
                setLabelOn(false);
                document.body.style.cursor = 'auto';
              }
            : undefined
        }
      >
        <sphereGeometry args={[0.09, interactive ? 14 : 10, interactive ? 14 : 10]} />
        <meshBasicMaterial
          color={themeTokens.accent}
          transparent
          opacity={pulseMode === 'gentle' || pulseMode === 'off' ? 0.72 : 0.95}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={1.85}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial
          color={themeTokens.accentSoft}
          transparent
          opacity={0.22}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {interactive && labelOn ? (
        <Html center distanceFactor={14} style={{ pointerEvents: 'none' }}>
          <div className="holo-earth__city-label">{city.label}</div>
        </Html>
      ) : null}
    </group>
  );
}

/** 首页地球城市微光点 — 品牌展示默认柔和、不可点 */
export default function HoloCityMarkers({
  onCitySelect,
  visible = false,
  reducedMotion = false,
  gentlePulse = false,
  interactive = true,
  ignorePointer,
}: HoloCityMarkersProps) {
  const spotlightCities = useMemo(
    () =>
      holoEarthSpotlightCityIds
        .map((id) => holoFeatureCities.find((city) => city.id === id))
        .filter((city): city is HoloFeatureCity => Boolean(city)),
    [],
  );

  if (!visible) {
    return null;
  }

  const pulseMode: 'off' | 'gentle' | 'normal' = reducedMotion
    ? 'off'
    : gentlePulse
      ? 'gentle'
      : 'normal';

  return (
    <group>
      {spotlightCities.map((city) => (
        <CityMarker
          key={city.id}
          city={city}
          pulseMode={pulseMode}
          interactive={interactive}
          onSelect={onCitySelect}
          ignorePointer={ignorePointer}
        />
      ))}
    </group>
  );
}
