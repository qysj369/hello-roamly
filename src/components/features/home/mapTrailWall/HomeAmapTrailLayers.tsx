import { useEffect, useId, useRef, useState } from 'react';
import { bindAmapMapClick } from '@/lib/map/bindAmapMapClick';
import {
  bindAmapTrailZoomFeatures,
  createAmapTrailMapOptions,
  trailMapVisualFilter,
} from '@/lib/map/amapTrailMapSetup';
import { HOME_MAP_TRAIL_VIEW } from '@/lib/config/homeMapTrail';
import { wgs84LineToAmapPath, wgs84PointToAmapPoint } from '@/lib/map/trailWall/amapPaths';
import { loadAmap } from '@/lib/map/amapLoader';
import { bindHideInjectedMapAssistants } from '@/lib/map/hideInjectedMapAssistants';
import { wgs84ToGcj02 } from '@/lib/map/coordinates';
import { cn } from '@/utils/cn';
import type { HomeMapTrailLayersProps } from '@/components/features/home/mapTrailWall/types';

type TrailLinePair = {
  glow: AMapPolylineInstance;
  core: AMapPolylineInstance;
};

function crawlerMarkerHtml(color: string): string {
  return `<div style="position:relative;width:22px;height:22px">
  <div style="position:absolute;inset:0;border-radius:9999px;background:${color}44;filter:blur(2px)"></div>
  <div style="position:absolute;left:6px;top:6px;width:10px;height:10px;border-radius:9999px;background:#fff;border:2px solid ${color}"></div>
</div>`;
}

function applyAmapFlyTo(map: AMapMapInstance, target: NonNullable<HomeMapTrailLayersProps['flyTo']>) {
  if (target.longitude == null || target.latitude == null) {
    return;
  }
  const gcj = wgs84ToGcj02(target.longitude, target.latitude);
  map.setZoomAndCenter(target.zoom ?? 9, [gcj.longitude, gcj.latitude]);
}

function readTrailProps(properties: unknown): {
  id: string;
  colorEnd: string;
} | null {
  const props = properties as { id?: string; colorEnd?: string };
  if (!props.id) {
    return null;
  }
  return {
    id: props.id,
    colorEnd: props.colorEnd ?? '#10b981',
  };
}

export default function HomeAmapTrailLayers({
  lineCollection,
  userRouteCollection,
  userOriginPoint,
  userOriginGcjPoint,
  crawlerCollection,
  activeTrailId,
  pulseOpacity,
  pulseBrightness,
  onTrailClick,
  onTrailHover,
  onMapClick,
  flyTo,
  className,
}: HomeMapTrailLayersProps) {
  const containerId = useId().replace(/:/g, '');
  const mapRef = useRef<AMapMapInstance | null>(null);
  const linesRef = useRef<Map<string, TrailLinePair>>(new Map());
  const userRouteRef = useRef<{ glow: AMapPolylineInstance; core: AMapPolylineInstance } | null>(null);
  const userOriginMarkerRef = useRef<AMapMarkerInstance | null>(null);
  const userMarkersRef = useRef<AMapMarkerInstance[]>([]);
  const crawlerRef = useRef<AMapMarkerInstance | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const pendingFlyRef = useRef(flyTo);
  const unbindZoomFeaturesRef = useRef<(() => void) | null>(null);
  const unbindAssistantGuardRef = useRef<(() => void) | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  onMapClickRef.current = onMapClick;
  pendingFlyRef.current = flyTo;

  const initialCenter = wgs84ToGcj02(HOME_MAP_TRAIL_VIEW.longitude, HOME_MAP_TRAIL_VIEW.latitude);

  useEffect(() => {
    let disposed = false;

    loadAmap()
      .then((AMapNS) => {
        if (disposed) {
          return;
        }
        const map = new AMapNS.Map(
          containerId,
          createAmapTrailMapOptions([initialCenter.longitude, initialCenter.latitude], HOME_MAP_TRAIL_VIEW.zoom),
        );
        unbindZoomFeaturesRef.current = bindAmapTrailZoomFeatures(map);
        mapRef.current = map;
        if (pendingFlyRef.current) {
          applyAmapFlyTo(map, pendingFlyRef.current);
        }
      })
      .catch((reason: unknown) => {
        setMapError(reason instanceof Error ? reason.message : '高德地图加载失败');
      });

    return () => {
      disposed = true;
      unbindZoomFeaturesRef.current?.();
      unbindZoomFeaturesRef.current = null;
      linesRef.current.forEach(({ glow, core }) => {
        glow.setMap(null);
        core.setMap(null);
      });
      linesRef.current.clear();
      userRouteRef.current?.glow.setMap(null);
      userRouteRef.current?.core.setMap(null);
      userRouteRef.current = null;
      userOriginMarkerRef.current?.setMap(null);
      userOriginMarkerRef.current = null;
      userMarkersRef.current.forEach((marker) => marker.setMap(null));
      userMarkersRef.current = [];
      crawlerRef.current?.setMap(null);
      crawlerRef.current = null;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [containerId, initialCenter.latitude, initialCenter.longitude]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || mapError) {
      return undefined;
    }

    unbindAssistantGuardRef.current?.();
    unbindAssistantGuardRef.current = bindHideInjectedMapAssistants(shell);

    return () => {
      unbindAssistantGuardRef.current?.();
      unbindAssistantGuardRef.current = null;
    };
  }, [mapError]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return undefined;
    }

    return bindAmapMapClick(map, (event) => {
      onMapClickRef.current?.(event);
    });
  }, [onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) {
      return;
    }
    applyAmapFlyTo(map, flyTo);
  }, [flyTo]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    linesRef.current.forEach(({ glow, core }) => {
      map.remove(glow);
      map.remove(core);
    });
    linesRef.current.clear();

    if (lineCollection.features.length === 0) {
      return;
    }

    let cancelled = false;

    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }

      lineCollection.features.forEach((feature) => {
        const meta = readTrailProps(feature.properties);
        if (!meta || feature.geometry.type !== 'LineString') {
          return;
        }

        const path = wgs84LineToAmapPath(feature.geometry.coordinates);
        const bindTrailEvents = (line: AMapPolylineInstance) => {
          line.on('click', () => onTrailClick(meta.id));
          line.on('mouseover', () => onTrailHover(meta.id));
          line.on('mouseout', () => onTrailHover(null));
        };

        const glow = new AMapNS.Polyline({
          path,
          strokeColor: '#334155',
          strokeWeight: 3,
          strokeOpacity: 0.25,
          zIndex: 10,
          bubble: false,
          extData: { id: meta.id },
        });
        const core = new AMapNS.Polyline({
          path,
          strokeColor: meta.colorEnd,
          strokeWeight: 1.6,
          strokeOpacity: 0.45,
          zIndex: 11,
          bubble: false,
          extData: { id: meta.id },
        });

        bindTrailEvents(glow);
        bindTrailEvents(core);
        map.add(glow);
        map.add(core);
        linesRef.current.set(meta.id, { glow, core });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [lineCollection, onTrailClick, onTrailHover]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    userRouteRef.current?.glow.setMap(null);
    userRouteRef.current?.core.setMap(null);
    userRouteRef.current = null;
    userMarkersRef.current.forEach((marker) => marker.setMap(null));
    userMarkersRef.current = [];

    const feature = userRouteCollection?.features[0];
    if (!feature || feature.geometry.type !== 'LineString') {
      return;
    }

    const props = feature.properties as {
      waypoints?: [number, number][];
    } | null;
    const waypointCoords =
      props?.waypoints && props.waypoints.length >= 2
        ? props.waypoints
        : [
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[feature.geometry.coordinates.length - 1],
          ];

    let cancelled = false;
    const path = wgs84LineToAmapPath(feature.geometry.coordinates);

    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }

      const glow = new AMapNS.Polyline({
        path,
        strokeColor: '#a855f7',
        strokeWeight: 7,
        strokeOpacity: 0.35,
        zIndex: 45,
        bubble: true,
      });
      const core = new AMapNS.Polyline({
        path,
        strokeColor: '#22d3ee',
        strokeWeight: 3,
        strokeOpacity: 0.95,
        zIndex: 46,
        bubble: true,
      });
      map.add(glow);
      map.add(core);
      userRouteRef.current = { glow, core };

      const markers = waypointCoords
        .filter((point): point is [number, number] => Boolean(point))
        .map((point, index) => {
          const isOrigin = index === 0;
          const isLast = index === waypointCoords.length - 1;
          const color = isOrigin ? '#22d3ee' : isLast ? '#a855f7' : '#fbbf24';
          return new AMapNS.Marker({
            position: wgs84PointToAmapPoint(point),
            anchor: 'center',
            content: `<div style="width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}"></div>`,
            zIndex: 120,
          });
        });
      markers.forEach((marker) => marker.setMap(map));
      userMarkersRef.current = markers;
    });

    return () => {
      cancelled = true;
    };
  }, [userRouteCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    userOriginMarkerRef.current?.setMap(null);
    userOriginMarkerRef.current = null;

    if (!userOriginGcjPoint && !userOriginPoint) {
      return;
    }

    let cancelled = false;
    loadAmap().then((AMapNS) => {
      if (cancelled || !mapRef.current) {
        return;
      }

      const position: [number, number] = userOriginGcjPoint
        ? [userOriginGcjPoint[0], userOriginGcjPoint[1]]
        : wgs84PointToAmapPoint(userOriginPoint!);

      const marker = new AMapNS.Marker({
        position,
        anchor: 'center',
        content:
          '<div style="position:relative;width:18px;height:18px"><div style="position:absolute;inset:-4px;border-radius:9999px;background:#22d3ee33;animation:pulse 2s infinite"></div><div style="position:absolute;inset:0;border-radius:9999px;background:#22d3ee;border:2px solid #fff;box-shadow:0 0 10px #22d3ee"></div></div>',
        zIndex: 125,
      });
      marker.setMap(map);
      userOriginMarkerRef.current = marker;
    });

    return () => {
      cancelled = true;
    };
  }, [userOriginGcjPoint, userOriginPoint]);

  useEffect(() => {
    const glowOpacity = pulseOpacity * 0.35 * pulseBrightness;
    const activeId = activeTrailId ?? '';

    linesRef.current.forEach((pair, id) => {
      const active = id === activeId;
      const meta = lineCollection.features.find(
        (feature) => readTrailProps(feature.properties)?.id === id,
      );
      const colorEnd = readTrailProps(meta?.properties)?.colorEnd ?? '#10b981';

      pair.glow.setOptions({
        strokeColor: active ? '#6ee7b7' : '#334155',
        strokeWeight: active ? 8 : 3,
        strokeOpacity: glowOpacity,
      });
      pair.core.setOptions({
        strokeColor: colorEnd,
        strokeWeight: active ? 3.2 : 1.6,
        strokeOpacity: active ? pulseOpacity : 0.45,
      });
    });
  }, [activeTrailId, lineCollection.features, pulseBrightness, pulseOpacity]);

  useEffect(() => {
    const map = mapRef.current;
    const pointFeature = crawlerCollection.features[0];
    if (!map || !pointFeature || pointFeature.geometry.type !== 'Point') {
      return;
    }

    const props = pointFeature.properties as { color?: string };
    const color = props.color ?? '#10b981';
    const position = wgs84PointToAmapPoint(pointFeature.geometry.coordinates);

    loadAmap().then((AMapNS) => {
      if (!mapRef.current) {
        return;
      }

      if (!crawlerRef.current) {
        crawlerRef.current = new AMapNS.Marker({
          position,
          anchor: 'center',
          content: crawlerMarkerHtml(color),
          zIndex: 130,
        });
        crawlerRef.current.setMap(map);
      } else {
        crawlerRef.current.setPosition(position);
        crawlerRef.current.setContent(crawlerMarkerHtml(color));
      }
    });
  }, [crawlerCollection]);

  if (mapError) {
    return (
      <div className={cn('flex h-full items-center justify-center text-sm text-rose-400', className)}>
        {mapError}
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className={cn('home-amap-trail-layers relative h-full w-full', className)}
      style={{ filter: trailMapVisualFilter(pulseBrightness) }}
    >
      <div id={containerId} className="h-full w-full" />
    </div>
  );
}
