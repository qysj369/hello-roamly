export type CapsuleCityPoint = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

/** 热门城市坐标（WGS84）— 用于地球点选与光脉 */
export const capsuleCityPoints: readonly CapsuleCityPoint[] = [
  { id: 'xian', label: '西安', lng: 108.94, lat: 34.26 },
  { id: 'chengdu', label: '成都', lng: 104.07, lat: 30.57 },
  { id: 'chongqing', label: '重庆', lng: 106.55, lat: 29.56 },
  { id: 'hangzhou', label: '杭州', lng: 120.17, lat: 30.25 },
  { id: 'nanjing', label: '南京', lng: 118.8, lat: 32.06 },
  { id: 'suzhou', label: '苏州', lng: 120.62, lat: 31.3 },
  { id: 'xiamen', label: '厦门', lng: 118.09, lat: 24.48 },
  { id: 'qingdao', label: '青岛', lng: 120.38, lat: 36.07 },
  { id: 'dali', label: '大理', lng: 100.27, lat: 25.6 },
  { id: 'jinan', label: '济南', lng: 117.12, lat: 36.65 },
  { id: 'changsha', label: '长沙', lng: 112.94, lat: 28.23 },
  { id: 'iceland', label: '冰岛，雷克雅未克', lng: -21.82, lat: 64.13 },
] as const;

export type CapsuleHotRoute = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
};

/** 地球表面缓慢脉动的热门轨迹 */
export const capsuleHotRoutes: readonly CapsuleHotRoute[] = [
  { id: 'cd-dali', fromId: 'chengdu', toId: 'dali', label: '成都 → 大理' },
  { id: 'hz-xm', fromId: 'hangzhou', toId: 'xiamen', label: '杭州 → 厦门' },
  { id: 'xa-qd', fromId: 'xian', toId: 'qingdao', label: '西安 → 青岛' },
  { id: 'nj-sz', fromId: 'nanjing', toId: 'suzhou', label: '南京 → 苏州' },
  { id: 'cs-cq', fromId: 'changsha', toId: 'chongqing', label: '长沙 → 重庆' },
  { id: 'jn-iceland', fromId: 'jinan', toId: 'iceland', label: '济南 → 冰岛' },
] as const;

export function getCapsuleCityById(id: string): CapsuleCityPoint | undefined {
  return capsuleCityPoints.find((city) => city.id === id);
}

/** 根据球面点击坐标匹配最近热门城市；超出阈值则锁定点击位置本身 */
export function resolveCapsuleDestination(lat: number, lng: number): CapsuleCityPoint {
  const SNAP_DEG = 8;
  let best: CapsuleCityPoint | null = null;
  let bestScore = SNAP_DEG * SNAP_DEG;

  for (const city of capsuleCityPoints) {
    const dLat = city.lat - lat;
    let dLng = city.lng - lng;
    if (dLng > 180) {
      dLng -= 360;
    }
    if (dLng < -180) {
      dLng += 360;
    }
    const score = dLat * dLat + dLng * dLng;
    if (score < bestScore) {
      bestScore = score;
      best = city;
    }
  }

  if (best) {
    return best;
  }

  const latDir = lat >= 0 ? '北纬' : '南纬';
  const lngDir = lng >= 0 ? '东经' : '西经';
  return {
    id: `pin-${lat.toFixed(2)}-${lng.toFixed(2)}`,
    label: `${latDir}${Math.abs(lat).toFixed(1)}° ${lngDir}${Math.abs(lng).toFixed(1)}°`,
    lat,
    lng,
  };
}

/** @deprecated 使用 resolveCapsuleDestination */
export function nearestCapsuleCity(lat: number, lng: number): CapsuleCityPoint {
  return resolveCapsuleDestination(lat, lng);
}
