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
    blurb: '浪漫之都，漫步塞纳河畔，邂逅古典建筑与文艺风情。',
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    id: 'lhasa',
    label: '拉萨',
    blurb: '雪域高原，置身圣洁雪山，感受藏地的宁静与辽阔。',
    lat: 29.65,
    lng: 91.12,
  },
  {
    id: 'rio',
    label: '里约热内卢',
    blurb: '阳光海岸，群山环抱，感受南美热烈奔放的气息。',
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
