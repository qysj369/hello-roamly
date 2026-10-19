import {
  getPlanCityAtmosphere,
  listPlanAsidePreviewCards,
  type PlanAsidePreviewCard,
} from '@/lib/home/planCityAtmosphere';
import { resolveItineraryDayPhoto } from '@/lib/home/resolveItineraryDayPhoto';
import { renderSharePhotoSlide } from '@/lib/share/renderSharePhotoSlide';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const SEARCH_PLAN_SHARE_PHOTO_COUNT = 6;

export type SearchPlanSharePhoto = {
  name: string;
  photoPath: string;
  variant: 'scenery' | 'food';
  caption: string;
};

function compactCaption(text: string, max = 18): string {
  const line =
    text
      .replace(/【行程亮点】/g, '')
      .replace(/^(必体验|时间充裕可选)[:：]\s*/u, '')
      .split(/[。；;]/u)[0]
      ?.trim() || text.trim();
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

function captionForCard(plan: SearchStructuredPlan, card: PlanAsidePreviewCard): string {
  const matched = plan.dayList
    .map((day) => {
      const spot = day.spots.find(
        (item) => item.name && (card.name.includes(item.name) || item.name.includes(card.name)),
      );
      if (spot?.intro.trim()) return compactCaption(spot.intro);
      const food = day.foods.find((item) => {
        const hay = `${item.shop}${item.dish}${card.name}`;
        return Boolean(
          (item.shop && card.name.includes(item.shop.replace(/（[^）]*）$/u, '').trim())) ||
          (item.dish && hay.includes(item.dish.split(/[、,，]/u)[0] ?? '')),
        );
      });
      if (food) return compactCaption(food.dish || food.shop);
      return '';
    })
    .find((line) => line);
  if (matched) return matched;
  if (card.variant === 'food') return '本地人爱吃的一口';
  return '适合慢慢逛的一角';
}

function fallbackDayPhotos(plan: SearchStructuredPlan): SearchPlanSharePhoto[] {
  const used = new Set<string>();
  return plan.dayList.slice(0, SEARCH_PLAN_SHARE_PHOTO_COUNT).map((day) => {
    const image = resolveItineraryDayPhoto(plan, day, used);
    const spot = day.spots[0];
    const food = day.foods[0];
    return {
      name: spot?.name || day.title || `D${day.day}`,
      photoPath: image.src,
      variant: 'scenery' as const,
      caption: compactCaption(spot?.intro || food?.dish || day.tips || '按自己的节奏慢慢逛'),
    };
  });
}

/** 从行程右侧「美景与美食」侧栏取材，景点/美食穿插，默认 6 张实拍 */
export function listSearchPlanSharePhotos(plan: SearchStructuredPlan): SearchPlanSharePhoto[] {
  let atmosphere: ReturnType<typeof getPlanCityAtmosphere> = null;
  try {
    atmosphere = getPlanCityAtmosphere(plan.baseInfo.targetCity, plan);
  } catch {
    atmosphere = null;
  }
  const cards = listPlanAsidePreviewCards(atmosphere).filter(
    (item) => item.photoPath && !item.photoPath.startsWith('data:'),
  );
  const picked: SearchPlanSharePhoto[] = [];
  const used = new Set<string>();
  cards.some((card) => {
    if (picked.length >= SEARCH_PLAN_SHARE_PHOTO_COUNT) return true;
    if (!used.has(card.photoPath)) {
      used.add(card.photoPath);
      picked.push({
        name: card.name,
        photoPath: card.photoPath,
        variant: card.variant,
        caption: captionForCard(plan, card),
      });
    }
    return false;
  });
  if (picked.length < SEARCH_PLAN_SHARE_PHOTO_COUNT) {
    fallbackDayPhotos(plan).some((extra) => {
      if (picked.length >= SEARCH_PLAN_SHARE_PHOTO_COUNT) return true;
      if (!used.has(extra.photoPath)) {
        used.add(extra.photoPath);
        picked.push(extra);
      }
      return false;
    });
  }
  return picked;
}

export async function renderSearchPlanShareImages(
  plan: SearchStructuredPlan,
  kind: 'xhs' | 'douyin',
): Promise<Blob[]> {
  const photos = listSearchPlanSharePhotos(plan);
  const slides = photos.length > 0 ? photos : fallbackDayPhotos(plan);
  return Promise.all(
    slides.map((photo, index) =>
      renderSharePhotoSlide({
        kind,
        imageUrl: photo.photoPath,
        name: photo.name,
        caption: photo.caption,
        eyebrow: photo.variant === 'food' ? '一口当地味道' : '慢下来的风景',
        pageIndex: index + 1,
        totalPages: slides.length,
      }),
    ),
  );
}
