import { matchCityShareSeed } from '@/data/cityShareSeedKit';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { SHANGHAI_PLAN_ASIDE_ASSETS } from '@/data/shanghaiPlanAsideKit';
import { getPlanCityAtmosphere } from '@/lib/home/planCityAtmosphere';
import { getSearchPlanNoteCoverUrl } from '@/lib/home/searchPlanNoteSlides';
import { searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import { scoreSpotNameHit } from '@/lib/home/spotNameHit';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

/** 图库统一适配的三种发布画幅；渲染时 cover crop，不另存三套文件。 */
export const CITY_SHARE_PHOTO_FRAMES = {
  xhs: { ratio: '3:4', width: 540, height: 720 },
  douyin: { ratio: '9:16', width: 1080, height: 1920 },
  wechat: { ratio: '1:1', width: 1080, height: 1080 },
} as const;

export type CitySharePadSpot = {
  name: string;
  photoPath: string;
  blurb: string;
};

export { scoreSpotNameHit };

function pickBestPath(
  items: ReadonlyArray<{ label: string; keys: string[]; path: string }>,
  needle: string,
  used: Set<string>,
): string | null {
  let bestPath: string | null = null;
  let bestScore = 0;
  for (const item of items) {
    if (!item.path || used.has(item.path)) continue;
    const score = scoreSpotNameHit(item.label, item.keys, needle);
    if (score > bestScore) {
      bestScore = score;
      bestPath = item.path;
    }
  }
  return bestPath;
}

function take(path: string, used: Set<string>): string {
  used.add(path);
  return path;
}

/** 按当前行程城市 + 单点名称匹配配图，禁止串到别的城市风景。 */
export function matchSearchPlanSpotPhoto(
  plan: SearchStructuredPlan,
  name: string,
  used: Set<string>,
): string {
  const city = searchPlanShareCityName(plan);
  const kit = findHoloHomeCityKit(city);

  const seedShots = (matchCityShareSeed(plan)?.douyin ?? []).flatMap((script) => script.shots);
  const atmosphere = getPlanCityAtmosphere(city, { baseInfo: plan.baseInfo, dayList: plan.dayList });
  const pool = [...(atmosphere?.foods ?? []), ...(atmosphere?.scenery ?? [])];
  const hit = pickBestPath(
    [
      ...(kit?.spots ?? []).map((spot) => ({
        label: spot.name,
        keys: spot.keys,
        path: spot.photoPath,
      })),
      ...(/上海/.test(city)
        ? SHANGHAI_PLAN_ASIDE_ASSETS.map((item) => ({
            label: item.name,
            keys: item.keys,
            path: item.photoPath,
          }))
        : []),
      ...seedShots.map((shot) => ({ label: shot.title, keys: shot.keys, path: shot.imageUrl })),
      ...pool.map((item) => ({ label: item.name, keys: [], path: item.photoPath })),
    ],
    name,
    used,
  );
  if (hit) return take(hit, used);

  if (kit?.coverPath && !used.has(kit.coverPath)) return take(kit.coverPath, used);

  const cover = getSearchPlanNoteCoverUrl(plan);
  return take(cover, used);
}

/** 同城未用景点，用来把小红书补满 3 张，不拿外城图凑数。 */
export function listSameCityPadSpots(
  plan: SearchStructuredPlan,
  usedPhotos: Set<string>,
  usedTitles: Set<string>,
): CitySharePadSpot[] {
  const city = searchPlanShareCityName(plan);
  const kit = findHoloHomeCityKit(city);
  const pads: CitySharePadSpot[] = [];
  const seen = new Set<string>();

  const push = (name: string, photoPath: string, blurb: string) => {
    if (!name || !photoPath || usedTitles.has(name) || usedPhotos.has(photoPath) || seen.has(photoPath)) {
      return;
    }
    seen.add(photoPath);
    pads.push({ name, photoPath, blurb });
  };

  for (const spot of kit?.spots ?? []) {
    push(spot.name, spot.photoPath, spot.blurb || `${city}随便走走`);
  }

  const atmosphere = getPlanCityAtmosphere(city, { baseInfo: plan.baseInfo, dayList: plan.dayList });
  for (const item of atmosphere?.scenery ?? []) {
    push(item.name, item.photoPath, `${city}随便走走`);
  }
  for (const item of atmosphere?.foods ?? []) {
    push(item.name, item.photoPath, '按自己的胃口点就好');
  }

  return pads;
}
