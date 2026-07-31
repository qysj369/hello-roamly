import { getBaiduMapAk } from '@/lib/map/baidu';

let baiduSdkPromise: Promise<typeof BMap> | null = null;

declare global {
  interface Window {
    BMap?: typeof BMap;
    initBaiduPanoramaSdk?: () => void;
  }
}

/** 百度街景 SDK（callback 加载，避免 document.write 失效） */
export function loadBaiduPanorama(): Promise<typeof BMap> {
  const ak = getBaiduMapAk();
  if (!ak) {
    return Promise.reject(new Error('未配置 VITE_BAIDU_MAP_AK'));
  }

  if (window.BMap?.Panorama) {
    return Promise.resolve(window.BMap);
  }

  if (!baiduSdkPromise) {
    baiduSdkPromise = new Promise((resolve, reject) => {
      const callbackName = 'initBaiduPanoramaSdk';
      window[callbackName as 'initBaiduPanoramaSdk'] = () => {
        delete window[callbackName as 'initBaiduPanoramaSdk'];
        if (window.BMap?.Panorama) {
          resolve(window.BMap);
          return;
        }
        reject(new Error('BMap.Panorama 不可用，请确认 AK 已开通 JavaScript API'));
      };

      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(ak)}&callback=${callbackName}`;
      script.async = true;
      script.onerror = () => {
        delete window[callbackName as 'initBaiduPanoramaSdk'];
        reject(new Error('百度地图 SDK 加载失败'));
      };
      document.head.appendChild(script);
    });
  }

  return baiduSdkPromise;
}
