import { useCallback, useRef } from 'react';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { buildHoloMapSvgDataUrl } from '@/lib/capsule/holoMapSvg';
import { handleEarthClick } from '@/lib/capsule/blindBox';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

const HOLO_MAP_URL = buildHoloMapSvgDataUrl();

type OrbitSpec = {
  className: string;
  color: string;
  rx: number;
  ry: number;
  mode: 'solid' | 'particle';
  strokeWidth?: number;
  opacity?: number;
  dash?: string;
  dashOffset?: string;
};

const ORBITS: OrbitSpec[] = [
  {
    className: 'capsule-css-globe__orbit--1',
    color: '#9AD4E8',
    rx: 96,
    ry: 38,
    mode: 'solid',
    strokeWidth: 0.65,
    opacity: 0.42,
  },
  {
    className: 'capsule-css-globe__orbit--2',
    color: '#B8E8F5',
    rx: 100,
    ry: 42,
    mode: 'particle',
    strokeWidth: 1.1,
    opacity: 0.78,
    dash: '1.2 10',
  },
  {
    className: 'capsule-css-globe__orbit--3',
    color: '#FFFFFF',
    rx: 104,
    ry: 34,
    mode: 'particle',
    strokeWidth: 1.15,
    opacity: 0.62,
    dash: '1 12',
    dashOffset: '4',
  },
  {
    className: 'capsule-css-globe__orbit--4',
    color: '#8A9398',
    rx: 108,
    ry: 36,
    mode: 'particle',
    strokeWidth: 1,
    opacity: 0.34,
    dash: '2.5 16',
    dashOffset: '8',
  },
];

type CapsuleOneCssGlobeProps = {
  onCitySelect?: (city: CapsuleCityPoint) => void;
};

function clickToLatLng(event: React.MouseEvent<HTMLButtonElement>, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  const r2 = nx * nx + ny * ny;
  if (r2 > 1) {
    return null;
  }

  const z = Math.sqrt(1 - r2);
  const lat = (Math.asin(Math.max(-1, Math.min(1, -ny))) * 180) / Math.PI;
  let lng = (Math.atan2(z, -nx) * 180) / Math.PI - 180;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

function ParticleOrbit({
  className,
  color,
  rx,
  ry,
  mode,
  strokeWidth = 1.2,
  opacity = 0.72,
  dash = '1 12',
  dashOffset = '0',
}: OrbitSpec) {
  const filterId = `orbit-glow-${className.replace(/[^a-z0-9]/gi, '')}`;
  const isSolid = mode === 'solid';

  return (
    <div className={`capsule-css-globe__orbit ${className}`}>
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={isSolid ? 0.6 : 1} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx="100"
          cy="100"
          rx={rx}
          ry={ry}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={isSolid ? undefined : dash}
          strokeDashoffset={isSolid ? undefined : dashOffset}
          strokeLinecap="round"
          opacity={opacity}
          filter={`url(#${filterId})`}
        />
        {!isSolid && (
          <ellipse
            cx="100"
            cy="100"
            rx={rx}
            ry={ry}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 0.85}
            strokeDasharray={dash}
            strokeDashoffset={String(Number(dashOffset) + 6)}
            strokeLinecap="round"
            opacity={opacity * 0.42}
            filter={`url(#${filterId})`}
          />
        )}
      </svg>
    </div>
  );
}

/** 全息地球 · 纯 CSS 3D（参考图精修） */
export default function CapsuleOneCssGlobe({ onCitySelect: _onCitySelect }: CapsuleOneCssGlobeProps) {
  const shellRef = useRef<HTMLButtonElement>(null);
  const addRipple = useCapsuleOneStore((state) => state.addRipple);

  const handleGlobeClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!shellRef.current) {
        return;
      }

      const hit = clickToLatLng(event, shellRef.current);
      if (!hit) {
        return;
      }

      addRipple(hit.lat, hit.lng);
      handleEarthClick(event, [{ length: 1 }], hit.lat, hit.lng);
    },
    [addRipple],
  );

  return (
    <div className="capsule-css-globe" aria-hidden>
      <div className="capsule-css-globe__viewport">
        <div className="capsule-css-globe__world">
          <div className="capsule-css-globe__orbits">
            {ORBITS.map((orbit) => (
              <ParticleOrbit key={orbit.className} {...orbit} />
            ))}
          </div>

          <div className="capsule-css-globe__planet">
            <div className="capsule-css-globe__planet-spin">
              <div className="capsule-css-globe__aura" />
              <button
                ref={shellRef}
                type="button"
                className="capsule-css-globe__shell"
                onClick={handleGlobeClick}
                aria-label="转动地球，点选目的地"
              >
                <span className="capsule-css-globe__ocean-glow" />
                <span
                  className="capsule-css-globe__map"
                  style={{ backgroundImage: HOLO_MAP_URL }}
                />
                <span className="capsule-css-globe__fluid" />
                <span className="capsule-css-globe__glass" />
                <span className="capsule-css-globe__specular" />
                <span className="capsule-css-globe__rim" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
