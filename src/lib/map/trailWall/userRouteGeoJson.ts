import type { FeatureCollection, LineString } from 'geojson';
import { sampleQuadraticBezier } from '@/lib/map/trailWall/bezier';

const USER_ROUTE_ID = '__user_route__';

/** 用户当前位置 → 点击目的地的规划弧线（WGS84） */
export function buildUserRouteLineCollection(
  origin: [number, number],
  destination: [number, number],
): FeatureCollection<LineString> {
  const coordinates = sampleQuadraticBezier(origin, destination, 48, USER_ROUTE_ID);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: USER_ROUTE_ID,
          colorStart: '#22d3ee',
          colorEnd: '#a855f7',
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    ],
  };
}

/** 出发地 → 多站联游路线（WGS84，逐段贝塞尔拼接） */
export function buildMultiStopRouteLineCollection(
  waypoints: [number, number][],
): FeatureCollection<LineString> {
  if (waypoints.length < 2) {
    return { type: 'FeatureCollection', features: [] };
  }

  const coordinates: [number, number][] = [];
  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const segment = sampleQuadraticBezier(
      waypoints[index]!,
      waypoints[index + 1]!,
      32,
      `${USER_ROUTE_ID}_${index}`,
    );
    if (index === 0) {
      coordinates.push(...segment);
    } else {
      coordinates.push(...segment.slice(1));
    }
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: USER_ROUTE_ID,
          colorStart: '#22d3ee',
          colorEnd: '#a855f7',
          waypointCount: waypoints.length,
          waypoints,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    ],
  };
}

export function computeRouteFlyTarget(
  origin: [number, number],
  destination: [number, number],
): { longitude: number; latitude: number; zoom: number } {
  return computeBoundsFlyTarget([origin, destination]);
}

/** 多点路线自动缩放视野 */
export function computeBoundsFlyTarget(
  points: [number, number][],
): { longitude: number; latitude: number; zoom: number } {
  if (points.length === 0) {
    return { longitude: 117.076, latitude: 36.666, zoom: 8 };
  }
  if (points.length === 1) {
    return { longitude: points[0]![0], latitude: points[0]![1], zoom: 9 };
  }

  let minLng = points[0]![0];
  let maxLng = points[0]![0];
  let minLat = points[0]![1];
  let maxLat = points[0]![1];
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;
  const span = Math.max(maxLng - minLng, maxLat - minLat);
  const zoom =
    span > 12 ? 4.5 : span > 8 ? 5.2 : span > 5 ? 6 : span > 2 ? 7 : span > 0.8 ? 8 : 9;
  return { longitude, latitude, zoom };
}
