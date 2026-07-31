import { blindBoxCities, type BlindBoxCity, type BlindBoxRarity } from '@/data/blindBoxCities';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

export type BlindBoxMode = 'region' | 'random';

export type BlindBoxRequest = {
  mode: BlindBoxMode;
  lat?: number;
  lng?: number;
};

/** 区域扫描最大直线距离（公里），超出视为无信号 */
export const BLIND_BOX_REGION_MAX_KM = 1200;

/** 地球点击后的区域扫描时长（ms） */
export const BLIND_BOX_REGION_SCAN_MS = 1400;

/** 盲盒按钮随机抽取前的短扫描（ms） */
export const BLIND_BOX_RANDOM_SCAN_MS = 900;

/** @deprecated 使用 BLIND_BOX_REGION_MAX_KM */
export const BLIND_BOX_REGION_MAX_DEG = 12;

const RARITY_LABELS: Record<BlindBoxRarity, string> = {
  1: '传说目的地',
  2: '精选目的地',
  3: '经典目的地',
};

const citiesByRarity = {
  1: blindBoxCities.filter((city) => city.rarity === 1),
  2: blindBoxCities.filter((city) => city.rarity === 2),
  3: blindBoxCities.filter((city) => city.rarity === 3),
} as const;

export function blindBoxCityId(name: string): string {
  return `blind-${name}`;
}

export function blindBoxCityToCapsulePoint(city: BlindBoxCity): CapsuleCityPoint {
  return {
    id: blindBoxCityId(city.name),
    label: city.name,
    lat: city.lat,
    lng: city.lng,
  };
}

export function getBlindBoxRarityLabel(rarity: BlindBoxRarity): string {
  return RARITY_LABELS[rarity];
}

export function getBlindBoxRarityClass(rarity: BlindBoxRarity): '' | 'legendary' | 'epic' {
  if (rarity === 1) {
    return 'legendary';
  }
  if (rarity === 2) {
    return 'epic';
  }
  return '';
}

export function getBlindBoxPulseIntensity(rarity: BlindBoxRarity): number {
  if (rarity === 1) {
    return 1.15;
  }
  if (rarity === 2) {
    return 0.9;
  }
  return 0.75;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 两点间大圆距离（公里）— Haversine */
export function blindBoxDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  let dLng = toRadians(lng2 - lng1);
  if (dLng > Math.PI) {
    dLng -= 2 * Math.PI;
  }
  if (dLng < -Math.PI) {
    dLng += 2 * Math.PI;
  }

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(earthRadiusKm * c));
}

export type BlindBoxRegionMatch = {
  city: BlindBoxCity;
  distanceKm: number;
};

/** 点击坐标吸附为出发地名称的最大距离（公里） */
export const BLIND_BOX_DEPARTURE_SNAP_KM = 55;

export type BlindBoxRegionJourney = {
  departureLat: number;
  departureLng: number;
  departureLabel: string;
  destination: BlindBoxCity;
  distanceKm: number;
};

function rankBlindBoxCitiesByDistance(lat: number, lng: number): BlindBoxRegionMatch[] {
  return blindBoxCities
    .map((city) => ({
      city,
      distanceKm: blindBoxDistanceKm(lat, lng, city.lat, city.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** 将点击坐标解析为可读的出发地名称 */
export function resolveBlindBoxDepartureLabel(lat: number, lng: number): string {
  const ranked = rankBlindBoxCitiesByDistance(lat, lng);
  const nearest = ranked[0];
  if (!nearest) {
    const latDir = lat >= 0 ? '北纬' : '南纬';
    const lngDir = lng >= 0 ? '东经' : '西经';
    return `${latDir}${Math.abs(lat).toFixed(1)}° ${lngDir}${Math.abs(lng).toFixed(1)}°`;
  }

  if (nearest.distanceKm <= BLIND_BOX_DEPARTURE_SNAP_KM) {
    return nearest.city.name;
  }

  if (nearest.distanceKm <= 120) {
    return `${nearest.city.name}附近`;
  }

  const latDir = lat >= 0 ? '北纬' : '南纬';
  const lngDir = lng >= 0 ? '东经' : '西经';
  return `${latDir}${Math.abs(lat).toFixed(1)}° ${lngDir}${Math.abs(lng).toFixed(1)}°`;
}

function isSameDepartureAndDestination(
  departureLabel: string,
  destinationName: string,
  distanceKm: number,
): boolean {
  if (distanceKm > BLIND_BOX_DEPARTURE_SNAP_KM) {
    return false;
  }
  return departureLabel === destinationName || departureLabel === `${destinationName}附近`;
}

/**
 * 规划区域旅程：出发地=点击位置，目的地=池中推荐城市，距离=真实直线公里。
 * 若点击点已落在一座城市上，则推荐第二近的城市作为目的地。
 */
export function planRegionalBlindBoxJourney(lat: number, lng: number): BlindBoxRegionJourney | null {
  const ranked = rankBlindBoxCitiesByDistance(lat, lng);
  if (ranked.length === 0) {
    return null;
  }

  const departureLabel = resolveBlindBoxDepartureLabel(lat, lng);
  let destinationMatch = ranked[0]!;

  if (
    isSameDepartureAndDestination(
      departureLabel,
      destinationMatch.city.name,
      destinationMatch.distanceKm,
    )
  ) {
    const alternate = ranked.find((match) => match.city.name !== destinationMatch.city.name);
    if (!alternate) {
      return null;
    }
    destinationMatch = alternate;
  }

  if (destinationMatch.distanceKm > BLIND_BOX_REGION_MAX_KM) {
    return null;
  }

  return {
    departureLat: lat,
    departureLng: lng,
    departureLabel,
    destination: destinationMatch.city,
    distanceKm: destinationMatch.distanceKm,
  };
}

/** 在盲盒池中找离点击点最近的城市；超出阈值返回 null */
export function findNearestBlindBoxCity(lat: number, lng: number): BlindBoxRegionMatch | null {
  const journey = planRegionalBlindBoxJourney(lat, lng);
  if (!journey) {
    return null;
  }

  return {
    city: journey.destination,
    distanceKm: journey.distanceKm,
  };
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** 加权随机抽取城市 — 传说 1% · 精选 19% · 经典 80% */
export function drawBlindBoxCity(random = Math.random()): BlindBoxCity {
  if (random < 0.01) {
    const legendary = citiesByRarity[1];
    if (legendary.length > 0) {
      return pickRandom(legendary);
    }
  }

  if (random < 0.2) {
    const epic = citiesByRarity[2];
    if (epic.length > 0) {
      return pickRandom(epic);
    }
  }

  return pickRandom(citiesByRarity[3]);
}

/** @deprecated 使用 drawBlindBoxCity */
export const getRandomCity = drawBlindBoxCity;

type EarthHitList = { length: number } | null | undefined;

/**
 * 点击地球 → 区域扫描盲盒（非全局随机）。
 * R3F mesh onClick 已等价于射线命中，传 [{ length: 1 }] 即可。
 */
export function handleEarthClick(
  _event: unknown,
  intersects: EarthHitList,
  lat: number,
  lng: number,
): boolean {
  if (!intersects || intersects.length === 0) {
    return false;
  }

  const state = useCapsuleOneStore.getState();
  if (state.blindBoxActive || state.phase === 'launching' || state.phase === 'processing') {
    return false;
  }

  state.requestBlindBox({ mode: 'region', lat, lng });
  return true;
}
