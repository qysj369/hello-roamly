import AMapLoader from '@amap/amap-jsapi-loader';
import { configureAmapSecurity, getAmapKey } from '@/lib/map/amap';

let loadPromise: Promise<typeof AMap> | null = null;

/** 单例加载高德 JS API 2.0 */
export function loadAmap(): Promise<typeof AMap> {
  const key = getAmapKey();
  if (!key) {
    return Promise.reject(new Error('未配置 VITE_AMAP_KEY'));
  }

  if (!loadPromise) {
    configureAmapSecurity();
    loadPromise = AMapLoader.load({
      key,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Polyline', 'AMap.Marker', 'AMap.InfoWindow', 'AMap.Geocoder', 'AMap.PlaceSearch'],
    }) as Promise<typeof AMap>;
  }

  return loadPromise;
}
