import { Loader2, MapPin, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapServicePlaceholder from '@/components/features/map/MapServicePlaceholder';
import { geocodePlace, reverseGeocodePlace } from '@/lib/map/geocode';
import { loadAmap } from '@/lib/map/amapLoader';
import { getMapboxToken } from '@/lib/map/mapbox';
import { hasMapService, resolveMapProvider } from '@/lib/map/provider';
import { getDefaultMapView } from '@/lib/map/view';
import type { MapViewState } from '@/lib/map/types';
import { formatCoordinatesLabel, type TravelMomentLocationValue } from '@/utils/travelMomentLocation';
import { cn } from '@/utils/cn';

export type TravelMomentMapPickerProps = {
  value: TravelMomentLocationValue;
  onChange: (value: TravelMomentLocationValue) => void;
  className?: string;
};

type MomentMapSurfaceProps = {
  pin?: { longitude: number; latitude: number };
  initialView: MapViewState;
  onPick: (longitude: number, latitude: number) => void;
};

function MapboxMomentSurface({ pin, initialView, onPick }: MomentMapSurfaceProps) {
  const mapboxToken = useMemo(() => getMapboxToken(), []);

  if (!mapboxToken) {
    return null;
  }

  return (
    <Map
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: initialView.longitude,
        latitude: initialView.latitude,
        zoom: pin ? 13 : initialView.zoom,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      attributionControl
      reuseMaps
      cursor="crosshair"
      onClick={(event: MapMouseEvent) => onPick(event.lngLat.lng, event.lngLat.lat)}
    >
      <NavigationControl position="top-right" showCompass={false} showZoom />
      {pin && (
        <Marker longitude={pin.longitude} latitude={pin.latitude} anchor="bottom">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg ring-2 ring-white"
            aria-hidden
          >
            <MapPin className="h-4 w-4" />
          </span>
        </Marker>
      )}
    </Map>
  );
}

function AmapMomentSurface({ pin, initialView, onPick }: MomentMapSurfaceProps) {
  const containerId = useId().replace(/:/g, '');
  const mapRef = useRef<AMapMapInstance | null>(null);
  const markerRef = useRef<AMapMarkerInstance | null>(null);

  useEffect(() => {
    let disposed = false;

    loadAmap().then((AMapNS) => {
      if (disposed) {
        return;
      }
      const map = new AMapNS.Map(containerId, {
        zoom: pin ? 13 : initialView.zoom,
        center: [initialView.longitude, initialView.latitude],
        viewMode: '2D',
      });
      map.on('click', (event) => {
        onPick(event.lnglat.getLng(), event.lnglat.getLat());
      });
      mapRef.current = map;
    });

    return () => {
      disposed = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [containerId, initialView.latitude, initialView.longitude, initialView.zoom, onPick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    loadAmap().then((AMapNS) => {
      if (!pin) {
        markerRef.current?.setMap(null);
        markerRef.current = null;
        map.setZoomAndCenter(initialView.zoom, [initialView.longitude, initialView.latitude]);
        return;
      }

      if (!markerRef.current) {
        markerRef.current = new AMapNS.Marker({
          position: [pin.longitude, pin.latitude],
          anchor: 'bottom-center',
        });
        markerRef.current.setMap(map);
      } else {
        markerRef.current.setPosition([pin.longitude, pin.latitude]);
      }
      map.setZoomAndCenter(13, [pin.longitude, pin.latitude]);
    });
  }, [initialView.latitude, initialView.longitude, initialView.zoom, pin]);

  return <div id={containerId} className="h-full w-full" />;
}

export default function TravelMomentMapPicker({
  value,
  onChange,
  className,
}: TravelMomentMapPickerProps) {
  const provider = useMemo(() => resolveMapProvider(), []);
  const mapReady = hasMapService();
  const defaultView = useMemo(() => getDefaultMapView(), []);

  const [mapOpen, setMapOpen] = useState<boolean>(Boolean(value.coordinates));
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const initialView = useMemo<MapViewState>(() => {
    if (value.coordinates) {
      return { ...value.coordinates, zoom: defaultView.zoom };
    }
    return defaultView;
  }, [value.coordinates, defaultView]);

  const applyPick = useCallback(
    async (longitude: number, latitude: number) => {
      setIsResolving(true);
      setMapError(null);

      const result = await reverseGeocodePlace(longitude, latitude);
      setIsResolving(false);

      if (!result) {
        setMapError('无法解析该位置，请重试或手动输入地点');
        onChange({
          label: formatCoordinatesLabel({ longitude, latitude }),
          coordinates: { longitude, latitude },
        });
        return;
      }

      onChange({
        label: result.placeName,
        coordinates: result.coordinates,
        countryCode: result.countryCode,
      });
    },
    [onChange],
  );

  const handleGeocodeText = useCallback(async () => {
    const query = value.label.trim();
    if (!query || !mapReady) {
      return;
    }

    setIsResolving(true);
    setMapError(null);
    const coords = await geocodePlace(query, { limit: 1 });
    setIsResolving(false);

    if (!coords) {
      setMapError('未找到该地点，请在地图上点击选点');
      return;
    }

    const result = await reverseGeocodePlace(coords.longitude, coords.latitude);
    onChange({
      label: result?.placeName ?? query,
      coordinates: coords,
      countryCode: result?.countryCode,
    });
    setMapOpen(true);
  }, [mapReady, onChange, value.label]);

  const pin = value.coordinates;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMapOpen((prev) => !prev)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
            mapOpen
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200',
          )}
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {mapOpen ? '收起地图' : '地图选点'}
        </button>
        {value.label.trim() && mapReady && (
          <button
            type="button"
            onClick={handleGeocodeText}
            disabled={isResolving}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-200 hover:text-brand-700 disabled:opacity-50"
          >
            文字定位
          </button>
        )}
        {pin && (
          <button
            type="button"
            onClick={() => {
              onChange({ label: value.label, coordinates: undefined, countryCode: undefined });
              setMapError(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            清除标记
          </button>
        )}
      </div>

      {pin && (
        <p className="text-xs text-emerald-700">
          已标记：
          {value.label}
          <span className="ml-1 text-slate-400">({formatCoordinatesLabel(pin)})</span>
        </p>
      )}

      {mapError && (
        <p className="text-xs text-amber-700" role="status">
          {mapError}
        </p>
      )}

      {mapOpen && (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {!mapReady || !provider ? (
            <MapServicePlaceholder className="min-h-52" compact />
          ) : (
            <>
              <div className="h-52 w-full sm:h-56">
                {provider === 'amap' ? (
                  <AmapMomentSurface pin={pin} initialView={initialView} onPick={applyPick} />
                ) : (
                  <MapboxMomentSurface pin={pin} initialView={initialView} onPick={applyPick} />
                )}
              </div>
              {isResolving && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" aria-hidden />
                  <span className="sr-only">正在解析位置</span>
                </div>
              )}
              <p className="border-t border-slate-200/80 bg-white px-3 py-2 text-[10px] text-slate-500">
                点击地图放置标记，将自动填入地点名称
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
