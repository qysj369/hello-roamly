import type { MapClickEvent } from '@/lib/map/types';

function toMapClickEvent(event: AMapMapClickEvent): MapClickEvent {
  return {
    lng: event.lnglat.getLng(),
    lat: event.lnglat.getLat(),
    x: event.pixel?.x ?? 0,
    y: event.pixel?.y ?? 0,
  };
}

/**
 * 绑定高德 map.on('click')，initAMap 重复调用时先 off 旧 listener，避免多次弹窗。
 */
export function bindAmapMapClick(
  map: AMapMapInstance,
  handleMapClick: (event: MapClickEvent) => void,
): () => void {
  const listener = (event: AMapMapClickEvent) => {
    handleMapClick(toMapClickEvent(event));
  };

  if (map.clickListener) {
    map.off('click', map.clickListener);
  }

  map.clickListener = listener;
  map.on('click', map.clickListener);

  return () => {
    if (map.clickListener) {
      map.off('click', map.clickListener);
      map.clickListener = undefined;
    }
  };
}
