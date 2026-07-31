import { MapPin } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AsyncFeedback } from '@/components/ui';
import { usePlanMapPoints } from '@/hooks/map/usePlanMapPoints';
import { DEFAULT_AMAP_VIEW } from '@/lib/map/amap';
import { loadAmap } from '@/lib/map/amapLoader';
import { filterMapViewportPoints } from '@/lib/map/planGeoBounds';
import { getMapDisplayPoints, getPlanBaseCenter } from '@/lib/map/planMapPoints';
import { getMapProviderLabel } from '@/lib/map/provider';
import type { PlanMapPoint } from '@/lib/map/planMapPoints';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { cn } from '@/utils/cn';

export type AmapPlanRouteMapProps = {
  plan: TravelPlan;
  className?: string;
};

function markerHtml(point: PlanMapPoint, selected: boolean): string {
  const bg = selected
    ? 'background:#7c3aed;box-shadow:0 0 0 2px #a78bfa'
    : point.geocoded
      ? 'background:#059669'
      : 'background:#2563eb';
  return `<div style="width:28px;height:28px;border-radius:9999px;border:2px solid #fff;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;${bg}">${point.order + 1}</div>`;
}

function popupHtml(point: PlanMapPoint, providerLabel: string): string {
  const location = point.location
    ? `<p style="margin:4px 0 0;color:#64748b;font-size:11px">${point.location}</p>`
    : '';
  return `<div style="max-width:12rem;font-size:12px;line-height:1.4">
    <p style="margin:0;font-size:10px;font-weight:600;color:#2563eb">第 ${point.day} 天 · ${point.time}</p>
    <p style="margin:4px 0 0;font-weight:600;color:#0f172a">${point.name}</p>
    <p style="margin:4px 0 0;color:#475569">${point.description}</p>
    ${location}
    <p style="margin:4px 0 0;font-size:10px;color:#94a3b8">${point.geocoded ? `${providerLabel} 精确定位` : '城市中心估算位置'}</p>
  </div>`;
}

export default function AmapPlanRouteMap({ plan, className }: AmapPlanRouteMapProps) {
  const containerId = useId().replace(/:/g, '');
  const mapRef = useRef<AMapMapInstance | null>(null);
  const markersRef = useRef<AMapMarkerInstance[]>([]);
  const infoWindowRef = useRef<AMapInfoWindowInstance | null>(null);

  const planCenter = useMemo(() => getPlanBaseCenter(plan), [plan]);
  const { points, geocodedCount, isGeocoding, isGeocodingInitial, geocodeError } = usePlanMapPoints(plan);
  const displayPoints = useMemo(
    () => getMapDisplayPoints(points, planCenter),
    [points, planCenter],
  );
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const providerLabel = getMapProviderLabel('amap');

  const selectedPoint = useMemo(
    () => displayPoints.find((point) => point.id === selectedPointId) ?? null,
    [displayPoints, selectedPointId],
  );
  const viewportPoints = useMemo(
    () => filterMapViewportPoints(displayPoints, planCenter),
    [displayPoints, planCenter],
  );

  useEffect(() => {
    let disposed = false;

    loadAmap()
      .then((AMapNS) => {
        if (disposed) {
          return;
        }
        const map = new AMapNS.Map(containerId, {
          zoom: DEFAULT_AMAP_VIEW.zoom,
          center: [planCenter.longitude, planCenter.latitude],
          viewMode: '2D',
        });
        map.add(new AMapNS.Scale());
        map.add(new AMapNS.ToolBar({ position: { top: '10px', right: '10px' } }));
        map.on('click', () => {
          setSelectedPointId(null);
          map.clearInfoWindow();
        });
        mapRef.current = map;
        infoWindowRef.current = new AMapNS.InfoWindow({ offset: [0, -12] });
      })
      .catch((reason: unknown) => {
        setMapError(reason instanceof Error ? reason.message : '高德地图加载失败');
      });

    return () => {
      disposed = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current?.destroy();
      mapRef.current = null;
      infoWindowRef.current = null;
    };
  }, [containerId, planCenter.latitude, planCenter.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || isGeocodingInitial || displayPoints.length === 0) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    loadAmap().then((AMapNS) => {
      const markers = displayPoints.map((point) => {
        const marker = new AMapNS.Marker({
          position: [point.longitude, point.latitude],
          anchor: 'center',
          content: markerHtml(point, false),
          extData: { pointId: point.id },
          zIndex: 100 + point.order,
        });
        marker.on('click', () => {
          setSelectedPointId(point.id);
        });
        marker.setMap(map);
        return marker;
      });
      markersRef.current = markers;

      if (viewportPoints.length === 1) {
        map.setZoomAndCenter(13, [viewportPoints[0].longitude, viewportPoints[0].latitude]);
      } else if (viewportPoints.length >= 2) {
        const viewportMarkers = markers.filter((marker) => {
          const pointId = marker.getExtData<{ pointId: string }>()?.pointId;
          return viewportPoints.some((point) => point.id === pointId);
        });
        map.setFitView(
          viewportMarkers.length > 0 ? viewportMarkers : markers,
          false,
          [56, 56, 56, 56],
          14,
        );
      }
    });
  }, [displayPoints, isGeocodingInitial, viewportPoints]);

  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow) {
      return;
    }

    markersRef.current.forEach((marker) => {
      const pointId = marker.getExtData<{ pointId: string }>()?.pointId;
      const point = displayPoints.find((item) => item.id === pointId);
      if (point) {
        marker.setMap(map);
        const isSelected = point.id === selectedPointId;
        marker.setContent(markerHtml(point, isSelected));
      }
    });

    if (!selectedPoint) {
      infoWindow.close();
      return;
    }

    infoWindow.setContent(popupHtml(selectedPoint, providerLabel));
    infoWindow.open(map, [selectedPoint.longitude, selectedPoint.latitude]);
  }, [displayPoints, selectedPoint, selectedPointId, providerLabel]);

  if (mapError) {
    return (
      <section className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}>
        <p className="text-sm text-rose-600">{mapError}</p>
      </section>
    );
  }

  if (displayPoints.length === 0 && !isGeocoding) {
    return (
      <section
        className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}
        aria-labelledby="travel-plan-map-title"
      >
        <h2 id="travel-plan-map-title" className="mb-3 text-sm font-semibold text-slate-900">
          行程地图
        </h2>
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          暂无可展示的沿途景点。
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}
      aria-labelledby="travel-plan-map-title"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <MapPin className="h-4 w-4 text-brand-600" aria-hidden />
        <h2 id="travel-plan-map-title" className="text-sm font-semibold text-slate-900">
          行程地图
        </h2>
        <span className="text-xs text-slate-500">
          {displayPoints.length} 处要去的地方 ·{' '}
          {isGeocoding
            ? '解析中'
            : geocodedCount > 0
              ? `${geocodedCount} 处已精确定位`
              : '暂未精确定位，仅显示估算位置'}
        </span>
      </div>

      <AsyncFeedback
        className="mb-2"
        isLoading={isGeocoding}
        loadingMessage={`正在通过 ${providerLabel} 精确定位活动地点…`}
        error={geocodeError}
      />

      <div className="relative overflow-hidden rounded-xl border border-slate-200/90 shadow-sm">
        <div id={containerId} className="h-[min(22rem,50vh)] w-full min-h-56" />
      </div>
    </section>
  );
}
