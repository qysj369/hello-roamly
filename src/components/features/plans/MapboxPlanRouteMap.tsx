import { LngLatBounds } from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AsyncFeedback } from '@/components/ui';
import { usePlanMapPoints } from '@/hooks/map/usePlanMapPoints';
import { DEFAULT_MAP_VIEW, getMapboxToken } from '@/lib/map/mapbox';
import { filterMapViewportPoints } from '@/lib/map/planGeoBounds';
import { getMapDisplayPoints, getPlanBaseCenter, type PlanMapPoint } from '@/lib/map/planMapPoints';
import { getMapProviderLabel } from '@/lib/map/provider';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { cn } from '@/utils/cn';

export type MapboxPlanRouteMapProps = {
  plan: TravelPlan;
  className?: string;
};

function PlanMapMarker({
  point,
  selected,
  onSelect,
}: {
  point: PlanMapPoint;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Marker
      longitude={point.longitude}
      latitude={point.latitude}
      anchor="center"
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect();
      }}
    >
      <button
        type="button"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md',
          selected && 'bg-[#2c6b58] ring-2 ring-[#b7cdc4]',
          !selected && point.geocoded && 'bg-emerald-600 hover:bg-emerald-700',
          !selected && !point.geocoded && 'bg-brand-600 hover:bg-brand-700',
        )}
        aria-label={`第 ${point.order + 1} 站：${point.name}`}
        title={point.geocoded ? '已地理编码定位' : '估算位置'}
      >
        {point.order + 1}
      </button>
    </Marker>
  );
}

export default function MapboxPlanRouteMap({ plan, className }: MapboxPlanRouteMapProps) {
  const mapRef = useRef<MapRef>(null);
  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const planCenter = useMemo(() => getPlanBaseCenter(plan), [plan]);
  const { points, geocodedCount, isGeocoding, isGeocodingInitial, geocodeError } = usePlanMapPoints(plan);
  const displayPoints = useMemo(
    () => getMapDisplayPoints(points, planCenter),
    [points, planCenter],
  );
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const viewportPoints = useMemo(
    () => filterMapViewportPoints(displayPoints, planCenter),
    [displayPoints, planCenter],
  );

  const selectedPoint = displayPoints.find((point) => point.id === selectedPointId) ?? null;
  const providerLabel = getMapProviderLabel('mapbox');

  useEffect(() => {
    const map = mapRef.current;
    if (!map || displayPoints.length === 0 || isGeocodingInitial) {
      return;
    }

    if (viewportPoints.length === 1) {
      const only = viewportPoints[0];
      map.flyTo({
        center: [only.longitude, only.latitude],
        zoom: 13,
        duration: 800,
      });
      return;
    }

    const bounds = new LngLatBounds();
    viewportPoints.forEach((point) => {
      bounds.extend([point.longitude, point.latitude]);
    });
    map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 800 });
  }, [displayPoints.length, isGeocodingInitial, viewportPoints]);

  if (!mapboxToken) {
    return null;
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
          {geocodedCount > 0 ? `${geocodedCount} 处已精确定位` : '解析中'}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
          精确定位
          <span className="ml-1 h-2 w-2 rounded-full bg-brand-600" aria-hidden />
          估算
        </span>
      </div>

      <AsyncFeedback
        className="mb-2"
        isLoading={isGeocoding}
        loadingMessage={`正在通过 ${providerLabel} 精确定位活动地点…`}
        error={geocodeError}
      />

      <div className="relative overflow-hidden rounded-xl border border-slate-200/90 shadow-sm">
        <div className="h-[min(22rem,50vh)] w-full min-h-56">
          <Map
            ref={mapRef}
            mapboxAccessToken={mapboxToken}
            initialViewState={{
              longitude: displayPoints[0]?.longitude ?? DEFAULT_MAP_VIEW.longitude,
              latitude: displayPoints[0]?.latitude ?? DEFAULT_MAP_VIEW.latitude,
              zoom: 11,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            attributionControl
            reuseMaps
            onClick={() => setSelectedPointId(null)}
          >
            <NavigationControl position="top-right" showCompass showZoom />

            {displayPoints.map((point) => (
              <PlanMapMarker
                key={point.id}
                point={point}
                selected={selectedPointId === point.id}
                onSelect={() => setSelectedPointId(point.id)}
              />
            ))}

            {selectedPoint && (
              <Popup
                longitude={selectedPoint.longitude}
                latitude={selectedPoint.latitude}
                anchor="bottom"
                offset={12}
                closeOnClick={false}
                onClose={() => setSelectedPointId(null)}
              >
                <div className="max-w-[12rem] p-1 text-xs">
                  <p className="font-mono text-[10px] font-semibold text-brand-600">
                    第 {selectedPoint.day} 天 · {selectedPoint.time}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedPoint.name}</p>
                  <p className="mt-1 leading-relaxed text-slate-600">{selectedPoint.description}</p>
                  {selectedPoint.location && (
                    <p className="mt-1 flex items-start gap-1 text-slate-500">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      {selectedPoint.location}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-400">
                    {selectedPoint.geocoded ? `${providerLabel} 精确定位` : '城市中心估算位置'}
                  </p>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </section>
  );
}
