import { DEFAULT_AMAP_VIEW } from '@/lib/map/amap';
import { DEFAULT_MAP_VIEW } from '@/lib/map/mapbox';
import { resolveMapProvider } from '@/lib/map/provider';
import type { MapViewState } from '@/lib/map/types';

export function getDefaultMapView(): MapViewState {
  if (resolveMapProvider() === 'amap') {
    return DEFAULT_AMAP_VIEW;
  }
  return DEFAULT_MAP_VIEW;
}
