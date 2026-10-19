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
    { src: '/plan-scenes/shanghai/spot-food-shendacheng.jpg', keys: ['沈大成', '点心', '糕'] },
    { src: '/plan-scenes/shanghai/spot-food-benbang.jpg', keys: ['本帮', '红烧'] },
    { src: '/plan-scenes/shanghai/spot-food-cafe.jpg', keys: ['咖啡'] },
  ],
  深圳: [
    { src: '/plan-scenes/shenzhen/dimsum.jpg', keys: ['早茶', '点心', '肠粉'] },
    { src: '/plan-scenes/shenzhen/cantonese.jpg', keys: ['花胶', '煲', '粤'] },
    { src: '/plan-scenes/shenzhen/food.jpg', keys: ['糖水', '粥'] },
  ],
};

const FOOD_SRC_HINT =
  /food|dimsum|dumpling|noodle|hotpot|mapo|cantonese|shengjian|xiaolong|benbang|cafe|shendacheng/i;

function moodPlaceholder(kind: 'scenery' | 'food'): string {
  const [c0, c1] =
    kind === 'food' ? (['#eceae4', '#d5d2c8'] as const) : (['#e8e6e0', '#d2cfc6'] as const);
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
  const bits = [panelFood.shop, panelFood.area, panelFood.note].filter((bit): bit is string =>
    Boolean(bit?.trim()),
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

const MAX_ASIDE_CARDS = 24;
export const MIN_ASIDE_PREVIEW_CARDS = 6;

/** 侧栏补图：只用仓库已有实拍，不新造照片 */
const CITY_ASIDE_PAD_SCENERY: Record<string, readonly PlanCitySceneryCard[]> = {
  上海: [
    { name: '外滩晨光', photoPath: '/city-kit/shanghai/spot-bund.jpg' },
    { name: '陆家嘴夜色', photoPath: '/city-kit/shanghai/spot-bund-night.jpg' },
    { name: '豫园灯影', photoPath: '/city-kit/shanghai/spot-yuyuan.jpg' },
    { name: '黄浦江畔', photoPath: '/city-kit/shanghai/cover.jpg' },
  ],
  杭州: [
    { name: '运河水巷', photoPath: '/city-kit/hangzhou/spot-canal.jpg' },
    { name: '龙井茶园', photoPath: '/city-kit/hangzhou/spot-longjing.jpg' },
    { name: '茶园闲坐', photoPath: '/city-kit/hangzhou/spot-teagarden.jpg' },
    { name: '西湖晨雾', photoPath: '/city-kit/hangzhou/cover.jpg' },
  ],
  北京: [
    { name: '南锣鼓巷', photoPath: '/city-kit/beijing/spot-nanluo.jpg' },
    { name: '京城一角', photoPath: '/city-kit/beijing/cover.jpg' },
  ],
  广州: [
    { name: '小蛮腰夜色', photoPath: '/city-kit/guangzhou/spot-tower-night.jpg' },
    { name: '珠江畔', photoPath: '/city-kit/guangzhou/cover.jpg' },
  ],
  成都: [
    { name: '熊猫基地', photoPath: '/city-kit/chengdu/spot-panda.jpg' },
    { name: '锦里夜色', photoPath: '/city-kit/chengdu/cover.jpg' },
  ],
};

export type PlanAsidePreviewCard = {
  key: string;
  variant: 'scenery' | 'food';
  name: string;
  photoPath: string;
};

function sceneryCards(atmosphere: PlanCityAtmosphere | null | undefined): PlanCitySceneryCard[] {
  if (!atmosphere || !Array.isArray(atmosphere.scenery)) return [];
  return atmosphere.scenery.filter((item) => Boolean(item?.name && item.photoPath));
}

function foodCards(atmosphere: PlanCityAtmosphere | null | undefined): PlanCityFoodCard[] {
  if (!atmosphere || !Array.isArray(atmosphere.foods)) return [];
  return atmosphere.foods.filter((item) => Boolean(item?.name && item.photoPath));
}

function padAtmospherePhotos(
  cityName: string,
  atmosphere: PlanCityAtmosphere | null | undefined,
): PlanCityAtmosphere {
  const scenery = sceneryCards(atmosphere);
  const foods = foodCards(atmosphere);
  const used = new Set([...scenery, ...foods].map((item) => item.photoPath).filter(Boolean));
  (CITY_ASIDE_PAD_SCENERY[cityName] ?? []).some((extra) => {
    if (used.size >= MIN_ASIDE_PREVIEW_CARDS) return true;
    if (extra.photoPath && !used.has(extra.photoPath) && !isPlanAsideFoodPhoto(extra.photoPath)) {
      used.add(extra.photoPath);
      scenery.push(extra);
    }
    return false;
  });
  return {
    cityName: atmosphere?.cityName || cityName,
    foods: Array.isArray(atmosphere?.foods) ? atmosphere.foods : foods,
    scenery,
  };
}

export function listPlanAsidePreviewCards(
  atmosphere: PlanCityAtmosphere | null | undefined,
): PlanAsidePreviewCard[] {
  const scenery = sceneryCards(atmosphere);
  const foods = foodCards(atmosphere);
  const used = new Set<string>();
  const cards: PlanAsidePreviewCard[] = [];
  const push = (variant: 'scenery' | 'food', name: string, photoPath: string) => {
    const src = photoPath.trim();
    if (!src || used.has(src)) return;
    used.add(src);
    cards.push({ key: `${variant}-${src}`, variant, name, photoPath: src });
  };
  const max = Math.max(scenery.length, foods.length);
  for (let index = 0; index < max; index += 1) {
    const spot = scenery[index];
    if (spot) push('scenery', spot.name, spot.photoPath);
    const food = foods[index];
    if (food) push('food', food.name, food.photoPath);
  }
  if (cards.length < MIN_ASIDE_PREVIEW_CARDS) {
    (CITY_ASIDE_PAD_SCENERY[atmosphere?.cityName ?? ''] ?? []).some((extra) => {
      if (cards.length >= MIN_ASIDE_PREVIEW_CARDS) return true;
      push('scenery', extra.name, extra.photoPath);
      return false;
    });
  }
  return cards;
}

function scoreAsideAsset(asset: PlanAsideAsset, hay: string, party: SearchPlanPartyFocus): number {
  const hayHit =
    Boolean(hay) &&
    (hay.includes(asset.name) ||
      asset.keys.some((key) => key.trim().length >= 2 && hay.includes(key.trim())));
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

  ranked.filter((row) => row.score > 0).forEach((row) => take(row.asset));
  ranked.some((row) => {
    if (picked.length >= MAX_ASIDE_CARDS) return true;
    take(row.asset);
    return false;
  });

  const cards = picked.slice(0, MAX_ASIDE_CARDS);
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
  if (
    place &&
    place.split(/[·/、\s]+/).some((bit) => bit.trim().length >= 2 && hay.includes(bit.trim()))
  ) {
    return true;
  }
  return false;
}

function readPlanCityAtmosphere(
  cityOrText: string | null | undefined,
  plan?: PlanAsideHint | null,
): PlanCityAtmosphere | null {
  const kit = cityOrText?.trim() ? findHoloHomeCityKit(cityOrText.trim()) : null;
  if (!kit) return null;

  const hay = plan ? planAsideHaystack(plan) : '';
  const party = classifySearchPlanParty(plan?.baseInfo?.peopleType ?? '');
  const spots = Array.isArray(kit.spots) ? kit.spots : [];
  const kitFoods = Array.isArray(kit.foods) ? kit.foods : [];

  if (kit.name === '上海') {
    const picked = pickShanghaiAside(hay, party);
    return padAtmospherePhotos(kit.name, {
      cityName: kit.name,
      scenery: picked?.scenery ?? [],
      foods: picked?.foods ?? [],
    });
  }

  const usedFood = new Set<string>();
  const sceneryMatched = hay ? spots.filter((spot) => spot && sceneryMatchesPlan(spot, hay)) : [];
  const scenerySource: HoloCitySpotKit[] = [...sceneryMatched];
  spots.some((spot) => {
    if (scenerySource.length >= MAX_ASIDE_CARDS) return true;
    if (spot?.photoPath && !scenerySource.some((item) => item.photoPath === spot.photoPath)) {
      scenerySource.push(spot);
    }
    return false;
  });
  const scenery = (scenerySource.length > 0 ? scenerySource : spots).map((spot) => ({
    name: spot?.name ?? kit.name,
    photoPath: sceneryPhotoPath(spot?.photoPath ?? ''),
  }));

  const foodNames = kitFoods.map((name) => name.trim()).filter(Boolean);
  const planHasFoods = (plan?.dayList ?? []).some((day) =>
    (day.foods ?? []).some((food) => Boolean(food.shop?.trim() || food.dish?.trim())),
  );
  const matchedFoods = hay
    ? foodNames.filter((name) => foodMatchesPlan(kit.name, name, hay))
    : foodNames;
  const foods = (hay && planHasFoods ? matchedFoods : foodNames).map((name) => ({
    name,
    photoPath: matchFoodPhoto(kit.name, name, usedFood),
    place: foodPlaceHint(kit.name, name),
  }));

  return padAtmospherePhotos(kit.name, {
    cityName: kit.name,
    scenery,
    foods,
  });
}

/** 按当前行程城市读热门城 kit；无该城则返回 null，禁止回退到杭州 */
export function getPlanCityAtmosphere(
  cityOrText: string | null | undefined,
  plan?: PlanAsideHint | null,
): PlanCityAtmosphere | null {
  try {
    return readPlanCityAtmosphere(cityOrText, plan);
  } catch {
    return null;
  }
}
