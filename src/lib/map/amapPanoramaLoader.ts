import { configureAmapSecurity, getAmapKey } from '@/lib/map/amap';

let panoramaSdkPromise: Promise<typeof AMap> | null = null;

declare global {
  interface Window {
    AMap?: typeof AMap;
    initAmapPanoramaSdk?: () => void;
  }
}

/** 街景专用 SDK — 高德 2.0 不含 Panorama，独立加载 1.4.15 */
export function loadAmapPanorama(): Promise<typeof AMap> {
  const key = getAmapKey();
  if (!key) {
    return Promise.reject(new Error('未配置 VITE_AMAP_KEY'));
  }

  if (window.AMap?.Panorama) {
    return Promise.resolve(window.AMap);
  }

  if (!panoramaSdkPromise) {
    configureAmapSecurity();
    panoramaSdkPromise = new Promise((resolve, reject) => {
      const callbackName = 'initAmapPanoramaSdk';
      window[callbackName as 'initAmapPanoramaSdk'] = () => {
        delete window[callbackName as 'initAmapPanoramaSdk'];
        if (window.AMap?.Panorama) {
          resolve(window.AMap);
          return;
        }
        reject(new Error('AMap.Panorama 不可用，请确认 Key 已开通 Web 端 JS API'));
      };

      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${encodeURIComponent(key)}&plugin=AMap.Panorama,AMap.PanoramaService&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => {
        delete window[callbackName as 'initAmapPanoramaSdk'];
        reject(new Error('高德街景 SDK 加载失败'));
      };
      document.head.appendChild(script);
    });
  }

  return panoramaSdkPromise;
}
