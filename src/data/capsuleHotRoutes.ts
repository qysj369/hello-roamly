export type CapsuleCityPoint = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

/** 济南降落点坐标（WGS84）— 用于地球点选与光脉（济南演示版） */
export const capsuleCityPoints: readonly CapsuleCityPoint[] = [
  { id: 'bpt', label: '趵突泉', lng: 117.028, lat: 36.662 },
  { id: 'dmh', label: '大明湖', lng: 117.018, lat: 36.671 },
  { id: 'qfs', label: '千佛山', lng: 117.03, lat: 36.636 },
  { id: 'hhq', label: '黑虎泉', lng: 117.028, lat: 36.654 },
  { id: 'jrs', label: '九如山', lng: 117.196, lat: 36.53 },
] as const;

export type CapsuleHotRoute = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
};

/** 地球表面缓慢脉动的济南航线轨迹 */
export const capsuleHotRoutes: readonly CapsuleHotRoute[] = [
  { id: 'bpt-dmh', fromId: 'bpt', toId: 'dmh', label: '趵突泉 → 大明湖' },
  { id: 'dmh-qfs', fromId: 'dmh', toId: 'qfs', label: '大明湖 → 千佛山' },
  { id: 'qfs-hhq', fromId: 'qfs', toId: 'hhq', label: '千佛山 → 黑虎泉' },
  { id: 'hhq-bpt', fromId: 'hhq', toId: 'bpt', label: '黑虎泉 → 趵突泉' },
  { id: 'bpt-jrs', fromId: 'bpt', toId: 'jrs', label: '趵突泉 → 九如山' },
] as const;

export function getCapsuleCityById(id: string): CapsuleCityPoint | undefined {
  return capsuleCityPoints.find((city) => city.id === id);
}

/** 根据球面点击坐标匹配最近热门城市；超出阈值则锁定点击位置本身 */
export function resolveCapsuleDestination(lat: number, lng: number): CapsuleCityPoint {
  const SNAP_DEG = 8;
  let best: CapsuleCityPoint | null = null;
  let bestScore = SNAP_DEG * SNAP_DEG;

  capsuleCityPoints.forEach((city) => {
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
  });

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
