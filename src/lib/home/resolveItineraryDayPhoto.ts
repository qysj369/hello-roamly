import {
  resolvePlanCoverImage,
  resolvePlanSpotImage,
  type PlanSceneImageRef,
} from '@/data/planSceneImages';
import {
  PLAN_ASIDE_SCENERY_PLACEHOLDER,
  getPlanCityAtmosphere,
} from '@/lib/home/planCityAtmosphere';
import { matchShanghaiSharePhoto } from '@/lib/home/shanghaiSharePhotoMatch';
import type { SearchPlanDay, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const PLAN_DAY_PHOTO_FALLBACK = PLAN_ASIDE_SCENERY_PLACEHOLDER;

function asRef(src: string, alt: string): PlanSceneImageRef | null {
  const path = src.trim();
  if (!path || path.startsWith('data:image/svg+xml')) return null;
  return { src: path, alt };
}

/** 每日行程配图：先对景点名，再对城市场景库，失败才灰底，不写「美景占位」。 */
export function resolveItineraryDayPhoto(
  plan: SearchStructuredPlan,
  day: SearchPlanDay,
  used: Set<string>,
): PlanSceneImageRef {
  const city = plan.baseInfo.targetCity.trim();
  const context = `${city}\n${day.title}\n${day.spots.map((spot) => spot.name).join(' ')}`;
  const names = [
    day.spots[0]?.name,
    day.title,
    ...day.spots.slice(1).map((spot) => spot.name),
  ].filter((name): name is string => Boolean(name?.trim()));

  let namedHit: PlanSceneImageRef | null = null;
  names.some((name) => {
    const kit = resolvePlanSpotImage(name, {
      dayLabel: `D${day.day}`,
      context,
      usedIds: used,
    });
    if (!kit) return false;
    namedHit = kit;
    return true;
  });
  if (namedHit) return namedHit;

  if (/上海/.test(city)) {
    const needle = names[0] || context;
    const path = matchShanghaiSharePhoto(plan, needle, used);
    const hit = asRef(path, `${city}${needle}实拍`);
    if (hit) return hit;
  }

  const atmosphere = getPlanCityAtmosphere(city, plan);
  const scenery = Array.isArray(atmosphere?.scenery) ? atmosphere.scenery : [];
  const scene = scenery[Math.max(0, day.day - 1)] ?? scenery[0] ?? null;
  const sceneHit = scene ? asRef(scene.photoPath, `${city}${scene.name}实拍`) : null;
  if (sceneHit && !used.has(sceneHit.src)) {
    used.add(sceneHit.src);
    return sceneHit;
  }

  const cover = resolvePlanCoverImage({
    initialQuery: city,
    intro: city,
    itinerary: context,
  });
  if (cover && !used.has(cover.src)) {
    used.add(cover.src);
    return cover;
  }

  return { src: PLAN_DAY_PHOTO_FALLBACK, alt: `${names[0] || city}配图` };
}
