import { useMemo } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapServicePlaceholder from '@/components/features/map/MapServicePlaceholder';
import { DEFAULT_MAP_VIEW, getMapboxToken } from '@/lib/map/mapbox';
import type { MapClickEvent } from '@/lib/map/types';
import { cn } from '@/utils/cn';

export type MapboxMapProps = {
  className?: string;
  onMapClick?: (event: MapClickEvent) => void;
};

export default function MapboxMap({ className, onMapClick }: MapboxMapProps) {
  const mapboxToken = useMemo(() => getMapboxToken(), []);

  if (!mapboxToken) {
    return <MapServicePlaceholder className={cn('min-h-64', className)} />;
  }

  return (
    <div className={cn('h-full w-full min-h-[12rem]', className)}>
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{ ...DEFAULT_MAP_VIEW }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl
        reuseMaps
        onClick={
          onMapClick
            ? (event) => {
                event.originalEvent.preventDefault();
                onMapClick({
                  lng: event.lngLat.lng,
                  lat: event.lngLat.lat,
                  x: event.point.x,
                  y: event.point.y,
                });
              }
            : undefined
        }
      >
        <NavigationControl position="top-right" showCompass showZoom />
      </Map>
    </div>
  );
}

