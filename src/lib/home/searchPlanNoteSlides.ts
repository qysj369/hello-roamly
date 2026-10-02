import { getDefaultCityCoverUrl, resolveCoverFromPlaceText } from '@/data/cityCoverImages';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { SHANGHAI_PLAN_ASIDE_ASSETS } from '@/data/shanghaiPlanAsideKit';
import { scoreSpotNameHit } from '@/lib/home/spotNameHit';
import { getPlanCityAtmosphere } from '@/lib/home/planCityAtmosphere';
import { classifySearchPlanParty } from '@/lib/home/searchPlanParty';
import type { SearchPlanDay, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanNoteSlide = {
  imageUrl: string;
  eyebrow: string;
  title: string;
  caption: string;
};

function shopShortName(shop: string): string {
  return shop.replace(/（[^）]*）$/u, '').trim();
}

function dayNames(day: SearchPlanDay): string[] {
  return [
    ...day.spots.filter((spot) => /必体验/.test(spot.intro)).map((spot) => spot.name.trim()),
    ...day.spots.map((spot) => spot.name.trim()),
    ...day.foods.map((food) => shopShortName(food.shop)),
    ...day.foods.map((food) => food.dish.trim()),
  ].filter((name, index, all) => name && all.indexOf(name) === index);
}

function pickBestNamed<T extends { name: string; keys?: string[]; photoPath: string }>(
  items: readonly T[],
  needle: string,
  used: Set<string>,
): T | undefined {
  let best: T | undefined;
  let bestScore = 0;
  for (const item of items) {
    if (used.has(item.photoPath)) continue;
    const score = scoreSpotNameHit(item.name, item.keys ?? [], needle);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

function dayCaption(day: SearchPlanDay): string {
  const tip = day.tips
    .replace(/^【行程亮点】/u, '')
    .split(/[；;。]/u)
    .map((part) => part.trim())
    .find((part) => part.length >= 8);
  if (tip) return tip.slice(0, 42);
  const spot = day.spots[0]?.name.trim() || '';
  const shop = shopShortName(day.foods[0]?.shop || '');
  return [spot, shop].filter(Boolean).join(' · ') || `第${day.day}天慢逛`;
}

function pickFromShanghai(names: string[], used: Set<string>): { url: string; label: string } | null {
  for (const name of names) {
    const asset = pickBestNamed(SHANGHAI_PLAN_ASIDE_ASSETS, name, used);
    if (asset) {
      used.add(asset.photoPath);
      return { url: asset.photoPath, label: name };
    }
  }
  return null;
}

function pickDayVisual(
  plan: SearchStructuredPlan,
  day: SearchPlanDay,
  used: Set<string>,
): { url: string; label: string } {
  const city = plan.baseInfo.targetCity;
  const names = dayNames(day);

  if (/上海/.test(city)) {
    const hit = pickFromShanghai(names, used);
    if (hit) return hit;
  }

  const kit = findHoloHomeCityKit(city.trim());
  if (kit) {
    for (const name of names) {
      const spot = pickBestNamed(kit.spots, name, used);
      if (spot) {
        used.add(spot.photoPath);
        return { url: spot.photoPath, label: name };
      }
    }
  }

  const atmosphere = getPlanCityAtmosphere(city, { baseInfo: plan.baseInfo, dayList: [day] });
  const pool = [...(atmosphere?.scenery ?? []), ...(atmosphere?.foods ?? [])];
  for (const name of names) {
    const card = pickBestNamed(
      pool.map((item) => ({ name: item.name, photoPath: item.photoPath, keys: [] })),
      name,
      used,
    );
    if (card) {
      used.add(card.photoPath);
      return { url: card.photoPath, label: name };
    }
  }

  const cover =
    kit?.spots.find((spot) => spot.photoPath?.trim() && !used.has(spot.photoPath))?.photoPath?.trim() ||
    kit?.coverPath?.trim() ||
    resolveCoverFromPlaceText(city, { width: 640 }) ||
    getDefaultCityCoverUrl(640);
  used.add(cover);
  return { url: cover, label: names[0] || city };
}

export function getSearchPlanNoteCoverUrl(plan: SearchStructuredPlan): string {
  const city = plan.baseInfo.targetCity;
  const focus = classifySearchPlanParty(plan.baseInfo.peopleType);
  if (/上海/.test(city)) {
    if (focus === 'couple') return '/city-kit/shanghai/spot-bund-night.jpg';
    if (focus === 'family') return '/plan-scenes/shanghai/spot-natural-museum.jpg';
    return '/city-kit/shanghai/spot-bund.jpg';
  }
  const kit = findHoloHomeCityKit(city.trim());
  return (
    kit?.coverPath?.trim() ||
    kit?.spots.find((spot) => spot.photoPath?.trim())?.photoPath?.trim() ||
    resolveCoverFromPlaceText(city, { width: 640 }) ||
    getDefaultCityCoverUrl(640)
  );
}

export function getSearchPlanNoteSlides(plan: SearchStructuredPlan): SearchPlanNoteSlide[] {
  const used = new Set<string>();
  return plan.dayList.slice(0, 6).map((day) => {
    const visual = pickDayVisual(plan, day, used);
    return {
      imageUrl: visual.url,
      eyebrow: `Day ${day.day}`,
      title: visual.label,
      caption: dayCaption(day),
    };
  });
}
