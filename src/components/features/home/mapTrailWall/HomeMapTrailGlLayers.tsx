import { useCallback, useEffect, useMemo } from 'react';
import MapboxMap, { Layer, Source } from 'react-map-gl/mapbox';
import MaplibreMap, { Layer as MaplibreLayer, Source as MaplibreSource } from 'react-map-gl/maplibre';
import type { MapMouseEvent } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent as MaplibreLayerMouseEvent } from 'react-map-gl/maplibre';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { TrailWallMapRuntime } from '@/lib/map/trailWall/runtime';
import type { FeatureCollection, LineString, Point } from 'geojson';
import { cn } from '@/utils/cn';
import type { HomeMapTrailLayersProps } from '@/components/features/home/mapTrailWall/types';

type HomeMapTrailGlLayersProps = HomeMapTrailLayersProps & {
  runtime: Extract<TrailWallMapRuntime, { provider: 'mapbox' } | { provider: 'maplibre' }>;
};

const INTERACTIVE_LAYERS = ['trail-wall-core', 'trail-wall-glow'];

function readTrailIdFromFeatures(
  features: Array<{ layer?: { id?: string }; properties?: unknown }> | undefined,
): string | null {
  const feature = features?.find((item) => INTERACTIVE_LAYERS.includes(item.layer?.id ?? ''));
  const trailId = (feature?.properties as { id?: string } | undefined)?.id;
  return typeof trailId === 'string' ? trailId : null;
}

type TrailMapLayersProps = {
  activeTrailId: string | null;
  pulseOpacity: number;
  pulseBrightness: number;
  lineCollection: FeatureCollection<LineString>;
  userRouteCollection?: FeatureCollection<LineString> | null;
  userOriginCollection?: FeatureCollection<Point> | null;
  crawlerCollection: FeatureCollection<Point>;
};

function UserOriginLayerMapbox({
  userOriginCollection,
}: {
  userOriginCollection: FeatureCollection<Point>;
}) {
  return (
    <Source id="user-origin-point" type="geojson" data={userOriginCollection}>
      <Layer
        id="user-origin-glow"
        type="circle"
        paint={{
          'circle-radius': 14,
          'circle-color': '#22d3ee',
          'circle-opacity': 0.25,
          'circle-blur': 0.6,
        }}
      />
      <Layer
        id="user-origin-core"
        type="circle"
        paint={{
          'circle-radius': 6,
          'circle-color': '#22d3ee',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />
    </Source>
  );
}

function UserRouteLayersMapbox({
  userRouteCollection,
}: {
  userRouteCollection: FeatureCollection<LineString>;
}) {
  return (
    <Source id="user-route-line" type="geojson" data={userRouteCollection} lineMetrics>
      <Layer
        id="user-route-glow"
        type="line"
        paint={{
          'line-color': '#a855f7',
          'line-width': 7,
          'line-opacity': 0.35,
          'line-blur': 2,
        }}
      />
      <Layer
        id="user-route-core"
        type="line"
        paint={{
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            '#22d3ee',
            1,
            '#a855f7',
          ],
          'line-width': 3.2,
          'line-opacity': 0.95,
        }}
      />
    </Source>
  );
}

function buildLinePaint(props: TrailMapLayersProps) {
  const glowOpacity = props.pulseOpacity * 0.35 * props.pulseBrightness;
  const activeId = props.activeTrailId ?? '';

  return {
    glow: {
      'line-color': ['case', ['==', ['get', 'id'], activeId], '#6ee7b7', '#334155'],
      'line-width': ['case', ['==', ['get', 'id'], activeId], 8, 3],
      'line-opacity': glowOpacity,
      'line-blur': 2.5,
    },
    core: {
      'line-gradient': [
        'interpolate',
        ['linear'],
        ['line-progress'],
        0,
        ['get', 'colorStart'],
        1,
        ['get', 'colorEnd'],
      ],
      'line-width': ['case', ['==', ['get', 'id'], activeId], 3.2, 1.6],
      'line-opacity': ['case', ['==', ['get', 'id'], activeId], props.pulseOpacity, 0.45],
    },
  };
}

function TrailMapLayersMapbox(props: TrailMapLayersProps) {
  const paint = buildLinePaint(props);

  return (
    <>
      <Source id="trail-wall-lines" type="geojson" data={props.lineCollection} lineMetrics>
        <Layer id="trail-wall-glow" type="line" paint={paint.glow as never} />
        <Layer id="trail-wall-core" type="line" paint={paint.core as never} />
      </Source>
      {props.userRouteCollection?.features.length ? (
        <UserRouteLayersMapbox userRouteCollection={props.userRouteCollection} />
      ) : null}
      {props.userOriginCollection?.features.length ? (
        <UserOriginLayerMapbox userOriginCollection={props.userOriginCollection} />
      ) : null}
      <Source id="trail-wall-crawler" type="geojson" data={props.crawlerCollection}>
        <Layer
          id="trail-wall-crawler-glow"
          type="circle"
          paint={{
            'circle-radius': 12,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.25,
            'circle-blur': 0.8,
          }}
        />
        <Layer
          id="trail-wall-crawler"
          type="circle"
          paint={{
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': ['get', 'color'],
          }}
        />
      </Source>
    </>
  );
}

function TrailMapLayersMaplibre(props: TrailMapLayersProps) {
  const paint = buildLinePaint(props);

  return (
    <>
      <MaplibreSource id="trail-wall-lines" type="geojson" data={props.lineCollection} lineMetrics>
        <MaplibreLayer id="trail-wall-glow" type="line" paint={paint.glow as never} />
        <MaplibreLayer id="trail-wall-core" type="line" paint={paint.core as never} />
      </MaplibreSource>
      {props.userRouteCollection?.features.length ? (
        <MaplibreSource id="user-route-line" type="geojson" data={props.userRouteCollection} lineMetrics>
          <MaplibreLayer
            id="user-route-glow"
            type="line"
            paint={{
              'line-color': '#a855f7',
              'line-width': 7,
              'line-opacity': 0.35,
              'line-blur': 2,
            }}
          />
          <MaplibreLayer
            id="user-route-core"
            type="line"
            paint={{
              'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0,
                '#22d3ee',
                1,
                '#a855f7',
              ],
              'line-width': 3.2,
              'line-opacity': 0.95,
            }}
          />
        </MaplibreSource>
      ) : null}
      {props.userOriginCollection?.features.length ? (
        <MaplibreSource id="user-origin-point" type="geojson" data={props.userOriginCollection}>
          <MaplibreLayer
            id="user-origin-glow"
            type="circle"
            paint={{
              'circle-radius': 14,
              'circle-color': '#22d3ee',
              'circle-opacity': 0.25,
              'circle-blur': 0.6,
            }}
          />
          <MaplibreLayer
            id="user-origin-core"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': '#22d3ee',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </MaplibreSource>
      ) : null}
      <MaplibreSource id="trail-wall-crawler" type="geojson" data={props.crawlerCollection}>
        <MaplibreLayer
          id="trail-wall-crawler-glow"
          type="circle"
          paint={{
            'circle-radius': 12,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.25,
            'circle-blur': 0.8,
          }}
        />
        <MaplibreLayer
          id="trail-wall-crawler"
          type="circle"
          paint={{
            'circle-radius': 5,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': ['get', 'color'],
          }}
        />
      </MaplibreSource>
    </>
  );
}

export default function HomeMapTrailGlLayers({
  mapRef,
  viewState,
  onViewStateChange,
  lineCollection,
  userRouteCollection,
  userOriginPoint,
  crawlerCollection,
  activeTrailId,
  pulseOpacity,
  pulseBrightness,
  onTrailClick,
  onTrailHover,
  onMapClick,
  flyTo,
  className,
  runtime,
}: HomeMapTrailGlLayersProps) {
  const syncViewState = useCallback(
    (next: { longitude: number; latitude: number; zoom: number; pitch?: number; bearing?: number }) => {
      onViewStateChange({
        longitude: next.longitude,
        latitude: next.latitude,
        zoom: next.zoom,
        pitch: next.pitch ?? 0,
        bearing: next.bearing ?? 0,
      });
    },
    [onViewStateChange],
  );

  useEffect(() => {
    if (!flyTo || flyTo.longitude == null || flyTo.latitude == null) {
      return;
    }
    const map = mapRef.current?.getMap?.();
    if (!map) {
      return;
    }
    map.flyTo({
      center: [flyTo.longitude, flyTo.latitude],
      zoom: flyTo.zoom ?? 9,
      duration: 1200,
    });
  }, [flyTo, mapRef]);

  const handleMapboxClick = useCallback(
    (event: MapMouseEvent) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailClick(trailId);
        return;
      }
      onMapClick?.({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
        x: event.point.x,
        y: event.point.y,
      });
    },
    [onMapClick, onTrailClick],
  );

  const handleMapboxMouseEnter = useCallback(
    (event: MapMouseEvent) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailHover(trailId);
        event.target.getCanvas().style.cursor = 'pointer';
      }
    },
    [onTrailHover],
  );

  const handleMapboxMouseLeave = useCallback(
    (event: MapMouseEvent) => {
      onTrailHover(null);
      event.target.getCanvas().style.cursor = 'grab';
    },
    [onTrailHover],
  );

  const handleMaplibreClick = useCallback(
    (event: MaplibreLayerMouseEvent) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailClick(trailId);
        return;
      }
      onMapClick?.({
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
        x: event.point.x,
        y: event.point.y,
      });
    },
    [onMapClick, onTrailClick],
  );

  const handleMaplibreMouseEnter = useCallback(
    (event: MaplibreLayerMouseEvent) => {
      const trailId = readTrailIdFromFeatures(event.features);
      if (trailId) {
        onTrailHover(trailId);
        event.target.getCanvas().style.cursor = 'pointer';
      }
    },
    [onTrailHover],
  );

  const handleMaplibreMouseLeave = useCallback(
    (event: MaplibreLayerMouseEvent) => {
      onTrailHover(null);
      event.target.getCanvas().style.cursor = 'grab';
    },
    [onTrailHover],
  );

  const userOriginCollection = useMemo<FeatureCollection<Point> | null>(() => {
    if (!userOriginPoint) {
      return null;
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: '__user_origin__' },
          geometry: {
            type: 'Point',
            coordinates: userOriginPoint,
          },
        },
      ],
    };
  }, [userOriginPoint]);

  const layerProps = {
    activeTrailId,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    userRouteCollection,
    userOriginCollection,
    crawlerCollection,
  };

  return (
    <div
      className={cn('home-map-trail-layers relative h-full w-full', className)}
      style={{ filter: `brightness(${pulseBrightness})` }}
    >
      {runtime.provider === 'maplibre' ? (
        <p className="pointer-events-none absolute left-1/2 top-20 z-10 max-w-[90%] -translate-x-1/2 rounded-lg border border-amber-400/30 bg-amber-950/80 px-3 py-1 text-center text-[10px] text-amber-100/90 backdrop-blur-sm">
          演示暗色底图 · 配置 VITE_MAPBOX_TOKEN 可切换 Mapbox 暗黑样式
        </p>
      ) : null}

      {runtime.provider === 'mapbox' ? (
        <MapboxMap
          ref={mapRef}
          mapboxAccessToken={runtime.token}
          {...viewState}
          onMove={(event) => syncViewState(event.viewState)}
          mapStyle={runtime.style}
          interactiveLayerIds={INTERACTIVE_LAYERS}
          onClick={handleMapboxClick}
          onMouseEnter={handleMapboxMouseEnter}
          onMouseLeave={handleMapboxMouseLeave}
          attributionControl={false}
          reuseMaps
          style={{ width: '100%', height: '100%' }}
          cursor="grab"
        >
          <TrailMapLayersMapbox {...layerProps} />
        </MapboxMap>
      ) : (
        <MaplibreMap
          {...viewState}
          onMove={(event) => syncViewState(event.viewState)}
          mapStyle={runtime.style}
          interactiveLayerIds={INTERACTIVE_LAYERS}
          onClick={handleMaplibreClick}
          onMouseEnter={handleMaplibreMouseEnter}
          onMouseLeave={handleMaplibreMouseLeave}
          attributionControl={false}
          reuseMaps
          style={{ width: '100%', height: '100%' }}
          cursor="grab"
        >
          <TrailMapLayersMaplibre {...layerProps} />
        </MaplibreMap>
      )}
    </div>
  );
}
