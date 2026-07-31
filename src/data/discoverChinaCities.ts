import { CITY_COORDINATES } from '@/data/cityCoordinates';

/** 发现页 / 筛选可用的中国城市（与地图坐标库一致） */
const RAW_CITIES = Object.keys(CITY_COORDINATES).filter((city) => city !== '周村古城');

export const DISCOVER_CHINA_CITIES = [...RAW_CITIES].sort((a, b) =>
  a.localeCompare(b, 'zh-CN'),
) as readonly string[];

export const DISCOVER_CHINA_CITY_COUNT = DISCOVER_CHINA_CITIES.length;

export function isDiscoverChinaCity(name: string): boolean {
  return DISCOVER_CHINA_CITIES.includes(name.trim());
}
