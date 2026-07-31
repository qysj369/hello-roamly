import type { MapCoordinates } from '@/types/domain/travelPlan';

export type MapProviderId = 'amap' | 'mapbox';

export type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

export type ReverseGeocodeResult = {
  placeName: string;
  coordinates: MapCoordinates;
  countryCode?: string;
};

export type GeocodeOptions = {
  proximity?: MapCoordinates;
  limit?: number;
  /** 高德 city / citylimit，提高 POI 命中率 */
  city?: string;
};

/** 地图点击事件（用于 AI 规划浮窗定位） */
export type MapClickEvent = {
  lng: number;
  lat: number;
  /** 相对地图容器左上角的像素坐标 */
  x: number;
  y: number;
};
