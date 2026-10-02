import { getHoloCityPreviewPanel } from '@/data/holoCityPreviewPanel';
import { findHoloHomeCityKit, type HoloCitySpotKit } from '@/data/holoHotCityKit';
import { SHANGHAI_PLAN_ASIDE_ASSETS, type PlanAsideAsset } from '@/data/shanghaiPlanAsideKit';
import { classifySearchPlanParty, type SearchPlanPartyFocus } from '@/lib/home/searchPlanParty';

export type PlanCitySceneryCard = {
  name: string;
  photoPath: string;
};

export type PlanCityFoodCard = {
  name: string;
  photoPath: string;
  place?: string;
};

export type PlanCityAtmosphere = {
  cityName: string;
  scenery: PlanCitySceneryCard[];
  foods: PlanCityFoodCard[];
};

type CityFoodPhoto = {
  src: string;
  keys: string[];
};

/** 仅美食实拍；禁止把封面 / 景点风景图写进此表 */
const CITY_FOOD_PHOTOS: Record<string, readonly CityFoodPhoto[]> = {
  杭州: [
    { src: '/city-kit/hangzhou/spot-food-noodles.jpg', keys: ['片儿川', '面', '粉'] },
    { src: '/city-kit/hangzhou/spot-food-dumpling.jpg', keys: ['饺', '点心', '糕'] },
  ],
  成都: [
    { src: '/city-kit/chengdu/spot-hotpot.jpg', keys: ['火锅'] },
    { src: '/city-kit/chengdu/spot-food-stall.jpg', keys: ['冒菜', '小吃', '摊'] },
    { src: '/city-kit/chengdu/spot-mapo.jpg', keys: ['麻婆', '豆腐'] },
  ],
  广州: [
    { src: '/city-kit/guangzhou/spot-dimsum-local.jpg', keys: ['早茶', '点心', '茶'] },
    { src: '/city-kit/guangzhou/spot-food-cheungfun.jpg', keys: ['肠粉'] },
    { src: '/city-kit/guangzhou/spot-food-tongshui.jpg', keys: ['糖水', '杨枝'] },
  ],
  上海: [
    { src: '/plan-scenes/shanghai/spot-food-shengjian.jpg', keys: ['生煎'] },
    { src: '/plan-scenes/shanghai/spot-food-xiaolong.jpg', keys: ['小笼', '南翔'] },
    { src: '/plan-scenes/shanghai/spot-food-xiaolong.jpg', keys: ['沈大成', '点心', '糕'] },
    { src: '/plan-scenes/shanghai/spot-food-benbang.jpg', keys: ['本帮', '红烧'] },
    { src: '/plan-scenes/shanghai/spot-food-cafe.jpg', keys: ['咖啡'] },
  ],
  深圳: [
    { src: '/plan-scenes/shenzhen/dimsum.jpg', keys: ['早茶', '点心', '肠粉'] },
    { src: '/plan-scenes/shenzhen/cantonese.jpg', keys: ['花胶', '煲', '粤'] },
    { src: '/plan-scenes/shenzhen/food.jpg', keys: ['糖水', '粥'] },
  ],
};

const FOOD_SRC_HINT = /food|dimsum|dumpling|noodle|hotpot|mapo|cantonese|shengjian|xiaolong|benbang|cafe|shendacheng/i;

function moodPlaceholder(kind: 'scenery' | 'food'): string {
  const [c0, c1] =
    kind === 'food' ? (['#f3ebe0', '#d9c8b4'] as const) : (['#e8f0e4', '#c5d4b8'] as const);
  const mark = kind === 'food' ? '食' : '景';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="300" fill="url(#g)"/>
  <circle cx="400" cy="150" r="42" fill="rgba(40,89,72,0.10)"/>
  <text x="400" y="158" text-anchor="middle" fill="rgba(40,89,72,0.38)" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${mark}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PLAN_ASIDE_SCENERY_PLACEHOLDER = moodPlaceholder('scenery');
export const PLAN_ASIDE_FOOD_PLACEHOLDER = moodPlaceholder('food');

export function isPlanAsideFoodPhoto(src: string): boolean {
  if (!src || src.startsWith('data:')) return false;
  return FOOD_SRC_HINT.test(src);
}

export function isPlanAsidePlaceholder(src: string): boolean {
  return src.startsWith('data:image/svg+xml');
}

function foodPlaceHint(cityName: string, dish: string): string | undefined {
  const panelFood = getHoloCityPreviewPanel(cityName)?.foods.find((item) => item.name === dish);
  if (!panelFood) return undefined;
  const bits = [panelFood.shop, panelFood.area, panelFood.note].filter(
    (bit): bit is string => Boolean(bit?.trim()),
  );
  return bits.length > 0 ? bits.join(' · ') : undefined;
}

function matchFoodPhoto(cityName: string, dish: string, used: Set<string>): string {
  const pool = CITY_FOOD_PHOTOS[cityName] ?? [];
  const keyed = pool.find(
    (item) => !used.has(item.src) && item.keys.some((key) => dish.includes(key)),
  );
  const leftover = pool.find((item) => !used.has(item.src) && isPlanAsideFoodPhoto(item.src));
  const hit = keyed && isPlanAsideFoodPhoto(keyed.src) ? keyed : leftover;
  if (!hit) return PLAN_ASIDE_FOOD_PLACEHOLDER;
  used.add(hit.src);
  return hit.src;
}

function sceneryPhotoPath(photoPath: string): string {
  const src = photoPath.trim();
  if (!src || isPlanAsideFoodPhoto(src)) return PLAN_ASIDE_SCENERY_PLACEHOLDER;
  return src;
}

type PlanAsideHint = {
  baseInfo?: { peopleType?: string };
  dayList?: Array<{
    spots?: Array<{ name?: string }>;
    foods?: Array<{ shop?: string; dish?: string }>;
  }>;
};

const MIN_ASIDE_CARDS = 4;

function scoreAsideAsset(asset: PlanAsideAsset, hay: string, party: SearchPlanPartyFocus): number {
  const hayHit =
    Boolean(hay) &&
    (hay.includes(asset.name) || asset.keys.some((key) => key.trim().length >= 2 && hay.includes(key.trim())));
  const partyHit = party !== 'other' && asset.parties.includes(party);
  let score = 0;
  if (hayHit) score += 80;
  if (partyHit) score += 25;
  if (hayHit && partyHit) score += 15;
  if (asset.kind === 'party' && partyHit) score += 12;
  if (asset.kind === 'food' && hayHit) score += 8;
  return score;
}

function pickShanghaiAside(
  hay: string,
  party: SearchPlanPartyFocus,
): { scenery: PlanCitySceneryCard[]; foods: PlanCityFoodCard[] } {
  const ranked = SHANGHAI_PLAN_ASIDE_ASSETS.map((asset) => ({
    asset,
    score: scoreAsideAsset(asset, hay, party),
  })).sort((left, right) => right.score - left.score);

  const picked: PlanAsideAsset[] = [];
  const used = new Set<string>();
  const take = (asset: PlanAsideAsset) => {
    if (used.has(asset.photoPath) || used.has(asset.name)) return;
    used.add(asset.photoPath);
    used.add(asset.name);
    picked.push(asset);
  };

  for (const row of ranked) {
    if (row.score > 0) take(row.asset);
  }
  for (const row of ranked) {
    if (picked.length >= MIN_ASIDE_CARDS) break;
    take(row.asset);
  }

  const cards = picked.slice(0, 12);
  return {
    scenery: cards
      .filter((item) => item.kind !== 'food')
      .map((item) => ({ name: item.name, photoPath: sceneryPhotoPath(item.photoPath) })),
    foods: cards
      .filter((item) => item.kind === 'food')
      .map((item) => ({ name: item.name, photoPath: item.photoPath, place: item.place })),
  };
}

function planAsideHaystack(plan: PlanAsideHint): string {
  return (plan.dayList ?? [])
    .flatMap((day) => [
      ...(day.spots ?? []).map((spot) => spot.name?.trim() || ''),
      ...(day.foods ?? []).flatMap((food) => [food.shop?.trim() || '', food.dish?.trim() || '']),
    ])
    .filter(Boolean)
    .join('\n');
}

function sceneryMatchesPlan(spot: HoloCitySpotKit, hay: string): boolean {
  if (!hay) return false;
  if (hay.includes(spot.name)) return true;
  return spot.keys.some((key) => key.trim().length >= 2 && hay.includes(key.trim()));
}

function foodMatchesPlan(cityName: string, dish: string, hay: string): boolean {
  if (!hay) return false;
  if (hay.includes(dish)) return true;
  const place = foodPlaceHint(cityName, dish);
  if (place && place.split(/[·/、\s]+/).some((bit) => bit.trim().length >= 2 && hay.includes(bit.trim()))) {
    return true;
  }
  return false;
}

/** 按当前行程城市读热门城 kit；无该城则返回 null，禁止回退到杭州 */
export function getPlanCityAtmosphere(
  cityOrText: string | null | undefined,
  plan?: PlanAsideHint | null,
): PlanCityAtmosphere | null {
  const kit = cityOrText?.trim() ? findHoloHomeCityKit(cityOrText.trim()) : null;
  if (!kit) return null;

  const hay = plan ? planAsideHaystack(plan) : '';
  const party = classifySearchPlanParty(plan?.baseInfo?.peopleType ?? '');

  if (kit.name === '上海') {
    const picked = pickShanghaiAside(hay, party);
    return { cityName: kit.name, scenery: picked.scenery, foods: picked.foods };
  }

  const usedFood = new Set<string>();
  const sceneryMatched = hay ? kit.spots.filter((spot) => sceneryMatchesPlan(spot, hay)) : [];
  const scenerySource: HoloCitySpotKit[] = [...sceneryMatched];
  for (const spot of kit.spots) {
    if (scenerySource.length >= MIN_ASIDE_CARDS) break;
    if (!scenerySource.some((item) => item.photoPath === spot.photoPath)) {
      scenerySource.push(spot);
    }
  }
  const scenery = (scenerySource.length > 0 ? scenerySource : kit.spots).map((spot) => ({
    name: spot.name,
    photoPath: sceneryPhotoPath(spot.photoPath),
  }));

  const foodNames = kit.foods.map((name) => name.trim()).filter(Boolean);
  const planHasFoods = (plan?.dayList ?? []).some((day) =>
    (day.foods ?? []).some((food) => Boolean(food.shop?.trim() || food.dish?.trim())),
  );
  const matchedFoods = hay ? foodNames.filter((name) => foodMatchesPlan(kit.name, name, hay)) : foodNames;
  const foods = (hay && planHasFoods ? matchedFoods : foodNames).map((name) => ({
    name,
    photoPath: matchFoodPhoto(kit.name, name, usedFood),
    place: foodPlaceHint(kit.name, name),
  }));

  return {
    cityName: kit.name,
    scenery,
    foods,
  };
}
