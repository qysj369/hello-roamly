import { resolveMapProvider } from '@/lib/map/provider';
import type { MapCoordinates } from '@/types/domain/travelPlan';

/** 坐标参考系：高德为 GCJ-02，Mapbox 为 WGS84 */
export type CoordinateSystem = 'wgs84' | 'gcj02';

const PI = Math.PI;
const AXIS = 6378245.0;
const EE = 0.00669342162296594323;

function outOfChina(longitude: number, latitude: number): boolean {
  return longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271;
}

function transformLat(longitude: number, latitude: number): number {
  let ret =
    -100.0 +
    2.0 * longitude +
    3.0 * latitude +
    0.2 * latitude * latitude +
    0.1 * longitude * latitude +
    0.2 * Math.sqrt(Math.abs(longitude));
  ret += ((20.0 * Math.sin(6.0 * longitude * PI) + 20.0 * Math.sin(2.0 * longitude * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(latitude * PI) + 40.0 * Math.sin((latitude / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((160.0 * Math.sin((latitude / 12.0) * PI) + 320 * Math.sin((latitude * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(longitude: number, latitude: number): number {
  let ret =
    300.0 +
    longitude +
    2.0 * latitude +
    0.1 * longitude * longitude +
    0.1 * longitude * latitude +
    0.1 * Math.sqrt(Math.abs(longitude));
  ret += ((20.0 * Math.sin(6.0 * longitude * PI) + 20.0 * Math.sin(2.0 * longitude * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(longitude * PI) + 40.0 * Math.sin((longitude / 3.0) * PI)) * 2.0) / 3.0;
  ret +=
    ((150.0 * Math.sin((longitude / 12.0) * PI) + 300.0 * Math.sin((longitude / 30.0) * PI)) * 2.0) /
    3.0;
  return ret;
}

/** WGS84 → GCJ-02（仅中国大陆范围内偏移） */
export function wgs84ToGcj02(longitude: number, latitude: number): MapCoordinates {
  if (outOfChina(longitude, latitude)) {
    return { longitude, latitude };
  }
  let dLat = transformLat(longitude - 105.0, latitude - 35.0);
  let dLng = transformLng(longitude - 105.0, latitude - 35.0);
  const radLat = (latitude / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((AXIS * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((AXIS / sqrtMagic) * Math.cos(radLat) * PI);
  return { longitude: longitude + dLng, latitude: latitude + dLat };
}

/** GCJ-02 → WGS84（迭代逼近） */
export function gcj02ToWgs84(longitude: number, latitude: number): MapCoordinates {
  if (outOfChina(longitude, latitude)) {
    return { longitude, latitude };
  }
  const gcj = wgs84ToGcj02(longitude, latitude);
  return {
    longitude: longitude * 2 - gcj.longitude,
    latitude: latitude * 2 - gcj.latitude,
  };
}

/** GCJ-02 → BD-09（百度街景 / 百度地图） */
export function gcj02ToBd09(longitude: number, latitude: number): MapCoordinates {
  const z =
    Math.sqrt(longitude * longitude + latitude * latitude) +
    0.00002 * Math.sin((latitude * Math.PI * 3000.0) / 180.0);
  const theta =
    Math.atan2(latitude, longitude) +
    0.000003 * Math.cos((longitude * Math.PI * 3000.0) / 180.0);
  return {
    longitude: z * Math.cos(theta) + 0.0065,
    latitude: z * Math.sin(theta) + 0.006,
  };
}

export function convertCoordinates(
  coords: MapCoordinates,
  from: CoordinateSystem,
  to: CoordinateSystem,
): MapCoordinates {
  if (from === to) {
    return coords;
  }
  if (from === 'wgs84' && to === 'gcj02') {
    return wgs84ToGcj02(coords.longitude, coords.latitude);
  }
  return gcj02ToWgs84(coords.longitude, coords.latitude);
}

/** 当前地图服务商使用的坐标系 */
export function getActiveCoordinateSystem(): CoordinateSystem {
  return resolveMapProvider() === 'amap' ? 'gcj02' : 'wgs84';
}

/**
 * 将坐标规范为当前地图服务商使用的坐标系。
 * @param assumed 输入坐标原先所属的坐标系（默认 WGS84，兼容历史 Mapbox 数据）
 */
export function normalizeCoordinatesForActiveProvider(
  coords: MapCoordinates,
  assumed: CoordinateSystem = 'wgs84',
): MapCoordinates {
  const target = getActiveCoordinateSystem();
  return convertCoordinates(coords, assumed, target);
}

export function getCoordinateSystemLabel(system: CoordinateSystem): string {
  return system === 'gcj02' ? 'GCJ-02（国测局）' : 'WGS84';
}
