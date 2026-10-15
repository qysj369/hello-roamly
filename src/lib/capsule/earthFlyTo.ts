import { EARTH_ROAM_CAMERA, clampOrbitDistance } from '@/lib/capsule/earthRoamCamera';

export type EarthFlyDestinationId = 'paris' | 'lhasa' | 'rio';

export type OrbitSpherical = {
  theta: number;
  phi: number;
  radius: number;
};

export const EARTH_FLY_DESTINATIONS: readonly {
  id: EarthFlyDestinationId;
  label: string;
  blurb: string;
  lat: number;
  lng: number;
}[] = [
  {
    id: 'paris',
    label: '巴黎',
    blurb:
      '塞纳河把巴黎分成两岸：一边是行政中心和19世纪林荫道，一边是普通街区与博物馆。人多、天气不定，它是叠着观光的大城市，不必当成永恒浪漫。',
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: 'lhasa',
    label: '拉萨',
    blurb:
      '拉萨在青藏高原上，长期是藏传佛教的政教中心；布达拉宫记下的是这段历史，不是风景明信片。海拔高、日照强，走路要留出适应时间。',
    lat: 29.65,
    lng: 91.12,
  },
  {
    id: 'rio',
    label: '里约热内卢',
    blurb:
      '里约热内卢夹在大西洋海湾与山地之间，葡萄牙殖民与非洲裔文化叠在同一座城里。海滩和陡坡社区并存，热闹里也有拥挤和起伏的日常。',
    lat: -22.9068,
    lng: -43.1729,
  },
] as const;

export const EARTH_FLY_TO = {
  minDurationMs: 1700,
  maxDurationMs: 3200,
  /** 中段轻微抬升，仍夹在 min/max 距离内 */
  glideLift: 1.05,
} as const;

export function getEarthFlyDestination(id: string) {
  return EARTH_FLY_DESTINATIONS.find((item) => item.id === id) ?? null;
}

export function easeInOutCubic(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

export function shortestAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/** 与 geoMath.latLngToVector3 同一套球坐标，再转成 OrbitControls 的 y-up spherical */
export function latLngToOrbitSpherical(lat: number, lng: number): { theta: number; phi: number } {
  const phiGeo = ((90 - lat) * Math.PI) / 180;
  const thetaGeo = ((lng + 180) * Math.PI) / 180;
  const x = -Math.sin(phiGeo) * Math.cos(thetaGeo);
  const y = Math.cos(phiGeo);
  const z = Math.sin(phiGeo) * Math.sin(thetaGeo);
  return {
    theta: Math.atan2(x, z),
    phi: Math.acos(Math.min(1, Math.max(-1, y))),
  };
}

export function lookAtOrbitSpherical(
  lat: number,
  lng: number,
  radius: number,
  isMobile: boolean,
): OrbitSpherical {
  const limits = isMobile ? EARTH_ROAM_CAMERA.mobile : EARTH_ROAM_CAMERA.desktop;
  const { theta, phi } = latLngToOrbitSpherical(lat, lng);
  return {
    theta,
    phi: Math.min(EARTH_ROAM_CAMERA.maxPolarAngle, Math.max(EARTH_ROAM_CAMERA.minPolarAngle, phi)),
    radius: clampOrbitDistance(radius, limits.minDistance, limits.maxDistance),
  };
}

export function flyDurationMs(from: OrbitSpherical, to: OrbitSpherical): number {
  const angle = Math.abs(shortestAngleDelta(from.theta, to.theta)) + Math.abs(to.phi - from.phi);
  const t = Math.min(1, angle / Math.PI);
  return EARTH_FLY_TO.minDurationMs + t * (EARTH_FLY_TO.maxDurationMs - EARTH_FLY_TO.minDurationMs);
}

export function interpolateFlyOrbit(
  from: OrbitSpherical,
  to: OrbitSpherical,
  t: number,
  isMobile: boolean,
): OrbitSpherical {
  const eased = easeInOutCubic(t);
  const limits = isMobile ? EARTH_ROAM_CAMERA.mobile : EARTH_ROAM_CAMERA.desktop;
  const lift = Math.sin(Math.PI * eased) * EARTH_FLY_TO.glideLift;
  return {
    theta: from.theta + shortestAngleDelta(from.theta, to.theta) * eased,
    phi: from.phi + (to.phi - from.phi) * eased,
    radius: clampOrbitDistance(
      from.radius + (to.radius - from.radius) * eased + lift,
      limits.minDistance,
      limits.maxDistance,
    ),
  };
}
