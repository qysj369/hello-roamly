import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';

export type HoloFeatureCity = CapsuleCityPoint & {
  tag: string;
  hot?: boolean;
  /** 百度街景是否覆盖该城市 */
  streetViewAvailable?: boolean;
  /** 街景默认视角坐标（GCJ-02，组件内转 BD-09） */
  streetViewLng?: number;
  streetViewLat?: number;
};

/** 首页热门漫游城市（济南置顶） */
export const holoFeatureCities: readonly HoloFeatureCity[] = [
  {
    id: 'jinan',
    label: '济南',
    tag: '泉城·平价穷游',
    lat: 36.65,
    lng: 117.12,
    hot: true,
    streetViewAvailable: false,
  },
  {
    id: 'dali',
    label: '大理',
    tag: '小众环湖',
    lat: 25.7,
    lng: 100.1,
    streetViewAvailable: false,
  },
  {
    id: 'chengdu',
    label: '成都',
    tag: '美食慢游',
    lat: 30.6,
    lng: 104.0,
    streetViewAvailable: true,
    streetViewLng: 104.0665,
    streetViewLat: 30.5728,
  },
  {
    id: 'lhasa',
    label: '拉萨',
    tag: '高原治愈',
    lat: 29.6,
    lng: 91.1,
    streetViewAvailable: true,
    streetViewLng: 91.1185,
    streetViewLat: 29.6544,
  },
  {
    id: 'xian',
    label: '西安',
    tag: '古都漫步',
    lat: 34.3,
    lng: 108.9,
    streetViewAvailable: true,
    streetViewLng: 108.948,
    streetViewLat: 34.259,
  },
  {
    id: 'hangzhou',
    label: '杭州',
    tag: '西湖慢生活',
    lat: 30.2,
    lng: 120.2,
    streetViewAvailable: true,
    streetViewLng: 120.1551,
    streetViewLat: 30.2421,
  },
  {
    id: 'xiamen',
    label: '厦门',
    tag: '海岛轻旅',
    lat: 24.5,
    lng: 118.1,
    streetViewAvailable: false,
  },
  {
    id: 'qingdao',
    label: '青岛',
    tag: '海滨度假',
    lat: 36.1,
    lng: 120.4,
    streetViewAvailable: false,
  },
  {
    id: 'yangshuo',
    label: '阳朔',
    tag: '喀斯特慢游',
    lat: 24.78,
    lng: 110.5,
    streetViewAvailable: false,
  },
] as const;

/** 草图首页快捷城市：成都 / 杭州 / 大理 / 阳朔 */
export const holoShortcutCityIds = ['chengdu', 'hangzhou', 'dali', 'yangshuo'] as const;

/** 热门目的地横向标签：成都 / 杭州 / 西安 / 大理 / 阳朔 */
export const holoHotTagCityIds = ['chengdu', 'hangzhou', 'xian', 'dali', 'yangshuo'] as const;

/** 地球悬停时浮现的微光点位：济南 / 大理 / 杭州 / 阳朔 */
export const holoEarthSpotlightCityIds = ['jinan', 'dali', 'hangzhou', 'yangshuo'] as const;

/** 有百度街景的城市，用于无覆盖时推荐切换 */
export const holoStreetViewCities = holoFeatureCities.filter((city) => city.streetViewAvailable);

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestHoloCity(lat: number, lng: number): HoloFeatureCity {
  return holoFeatureCities.reduce<HoloFeatureCity>((nearest, city) => {
    const distance = haversineKm(lat, lng, city.lat, city.lng);
    const best = haversineKm(lat, lng, nearest.lat, nearest.lng);
    return distance < best ? city : nearest;
  }, holoFeatureCities[0]);
}
