import type { MapRef } from 'react-map-gl/mapbox';
import type { FeatureCollection, LineString, Point } from 'geojson';
import type { HomeMapTrailViewState } from '@/hooks/home/useHomeTrailWall';
import type { MapClickEvent } from '@/lib/map/types';

export type HomeMapTrailLayersProps = {
  mapRef: React.RefObject<MapRef>;
  viewState: HomeMapTrailViewState;
  onViewStateChange: (viewState: HomeMapTrailViewState) => void;
  lineCollection: FeatureCollection<LineString>;
  /** 用户定位 → 点击目的地的规划弧线 */
  userRouteCollection?: FeatureCollection<LineString> | null;
  /** 用户当前定位点（WGS84），用于地图「你在这里」标记 */
  userOriginPoint?: [number, number] | null;
  /** 高德地图用 GCJ-02 坐标，避免 WGS 往返偏移 */
  userOriginGcjPoint?: [number, number] | null;
  crawlerCollection: FeatureCollection<Point>;
  activeTrailId: string | null;
  pulseOpacity: number;
  pulseBrightness: number;
  onTrailClick: (trailId: string) => void;
  onTrailHover: (trailId: string | null) => void;
  /** 点击地图空白处（非轨迹线） */
  onMapClick?: (event: MapClickEvent) => void;
  /** 搜索/定位后飞到目的地（WGS84） */
  flyTo?: { longitude: number; latitude: number; zoom?: number } | null;
  className?: string;
};
