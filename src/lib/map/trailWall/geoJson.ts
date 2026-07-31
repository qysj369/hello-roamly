import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import { sampleQuadraticBezier } from '@/lib/map/trailWall/bezier';
import type { TrailWallGuide } from '@/types/domain/trailWall';

const BEZIER_STEPS = 48;

function buildLineFeature(guide: TrailWallGuide): Feature<LineString> {
  const coordinates = sampleQuadraticBezier(
    guide.start_coords,
    guide.end_coords,
    BEZIER_STEPS,
    guide.id,
  );

  return {
    type: 'Feature',
    properties: {
      id: guide.id,
      title: guide.title,
      start_city: guide.start_city,
      end_city: guide.end_city,
      days: guide.days,
      budget: guide.budget,
      summary: guide.summary,
      colorStart: guide.colorStart,
      colorEnd: guide.colorEnd,
    },
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };
}

/** 攻略列表 → 轨迹线 GeoJSON */
export function buildTrailWallLineCollection(
  guides: TrailWallGuide[],
): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: guides.map(buildLineFeature),
  };
}

/** 按进度 (0–1) 计算蜗牛光点坐标 */
export function buildCrawlerPoint(
  guide: TrailWallGuide,
  progress: number,
): FeatureCollection<Point> {
  const coordinates = sampleQuadraticBezier(
    guide.start_coords,
    guide.end_coords,
    BEZIER_STEPS,
    guide.id,
  );
  const index = Math.min(
    coordinates.length - 1,
    Math.max(0, Math.floor(progress * (coordinates.length - 1))),
  );
  const [longitude, latitude] = coordinates[index]!;

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          id: guide.id,
          color: guide.colorEnd,
        },
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
      },
    ],
  };
}

export function findTrailGuideById(
  guides: TrailWallGuide[],
  id: string | null,
): TrailWallGuide | undefined {
  if (!id) {
    return undefined;
  }
  return guides.find((guide) => guide.id === id);
}
