import { BRAND_NAME } from '@/lib/config/brandCopy';
import { getDefaultCityCoverUrl, resolveCoverFromPlaceText } from '@/data/cityCoverImages';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { CITY_SHARE_PHOTO_FRAMES } from '@/lib/home/citySharePhotoLibrary';
import { getSearchPlanNoteCoverUrl } from '@/lib/home/searchPlanNoteSlides';
import {
  buildSearchPlanDouyinScenes,
  buildSearchPlanXhsScenes,
} from '@/lib/home/searchPlanAssetPack';
import { renderItinerarySummaryPoster } from '@/lib/share/renderItinerarySummaryPoster';
import { renderXhsImageSlide } from '@/lib/share/renderXhsImageSlide';
import { isLikelyMobileShareDevice } from '@/lib/share/openSocialApp';
import {
  buildSearchPlanDouyinPlatformCopy,
  buildSearchPlanWechatPlatformCopy,
  searchPlanCatchyTitle,
  searchPlanLiteHeader,
  searchPlanPublicHashtags,
} from '@/lib/home/searchPlanShareCopy';
import { searchShareContentId } from '@/lib/home/homeShareLanding';
import { encodeCompactSharePlan, SHARE_PLAN_QUERY_KEY } from '@/lib/home/shareLandingPlan';
import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { SharePosterInput } from '@/lib/share/posterTypes';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { paths } from '@/router/paths';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanShareHint = {
  targetCity?: string | null;
  days?: number | null;
  peopleType?: string | null;
};

function normalizeShareHint(hint?: string | SearchPlanShareHint | null): SearchPlanShareHint {
  if (!hint) return {};
  if (typeof hint === 'string') return { targetCity: hint };
  return hint;
}

function shareHintSource(
  hint: string | SearchPlanShareHint | SearchStructuredPlan | null | undefined,
  sourcePlan: SearchStructuredPlan | null,
): string | SearchPlanShareHint | null | undefined {
  if (typeof hint === 'string') return hint;
  if (sourcePlan) return null;
  if (hint && typeof hint === 'object' && 'baseInfo' in hint) {
    return {
      targetCity: hint.baseInfo.targetCity,
      days: hint.baseInfo.days,
      peopleType: hint.baseInfo.peopleType,
    };
  }
  return hint;
}

export function searchPlanPosterShareUrl(
  _savedSessionId: string | null,
  hint?: string | SearchPlanShareHint | SearchStructuredPlan | null,
  plan?: SearchStructuredPlan | null,
): string {
  const embedded = hint && typeof hint === 'object' && 'baseInfo' in hint ? hint : null;
  const sourcePlan = plan ?? embedded;
  const fromHint = normalizeShareHint(shareHintSource(hint, sourcePlan));
  const targetCity = sourcePlan?.baseInfo.targetCity ?? fromHint.targetCity;
  const days = sourcePlan?.baseInfo.days ?? fromHint.days;
  const peopleType = sourcePlan?.baseInfo.peopleType ?? fromHint.peopleType;
  const query = new URLSearchParams();
  const city = targetCity?.trim();
  if (city) query.set('city', city);
  if (days && days > 0) query.set('days', String(Math.round(days)));
  if (peopleType?.trim()) query.set('party', peopleType.trim());
  if (sourcePlan) {
    query.set(SHARE_PLAN_QUERY_KEY, encodeCompactSharePlan(sourcePlan));
  }
  const path = query.toString() ? `${paths.home}?${query.toString()}` : paths.home;
  return buildShareUrl(path, {
    contentKind: 'travel_plan',
    contentId: searchShareContentId(city),
  });
}

export function getSearchPlanCoverUrl(city: string): string {
  const kit = findHoloHomeCityKit(city.trim());
  const local =
    kit?.spots.find((spot) => spot.photoPath?.trim())?.photoPath?.trim() || kit?.coverPath?.trim();
  if (local) return local;
  return resolveCoverFromPlaceText(city, { width: 640 }) ?? getDefaultCityCoverUrl(640);
}

export type SearchPlanFragmentPoster = {
  imageUrl: string;
  kicker: string;
  title: string;
  caption: string;
};

export function getSearchPlanFragmentPoster(plan: SearchStructuredPlan): SearchPlanFragmentPoster {
  const scene = buildSearchPlanXhsScenes(plan)[0] ?? buildSearchPlanDouyinScenes(plan)[0];
  if (scene) {
    return {
      imageUrl: scene.imageUrl,
      kicker: scene.kicker,
      title: scene.title,
      caption: scene.caption,
    };
  }
  const city = plan.baseInfo.targetCity.trim() || '漫游';
  return {
    imageUrl: getSearchPlanCoverUrl(city),
    kicker: `${city}漫游`,
    title: city,
    caption: '按自己的节奏随便走走',
  };
}

export function searchPlanExportPosterSize(
  kind: 'wechat' | 'douyin',
  compact = isLikelyMobileShareDevice(),
): { width: number; height: number } {
  if (kind === 'wechat') {
    const edge = compact ? 720 : CITY_SHARE_PHOTO_FRAMES.wechat.width;
    return { width: edge, height: edge };
  }
  return compact
    ? { width: 720, height: 1280 }
    : {
        width: CITY_SHARE_PHOTO_FRAMES.douyin.width,
        height: CITY_SHARE_PHOTO_FRAMES.douyin.height,
      };
}

export function getSearchPlanPosterSummary(plan: SearchStructuredPlan): string {
  const scene = getSearchPlanFragmentPoster(plan);
  return `${scene.title}，${scene.caption}`.slice(0, 160);
}

export function getSearchPlanSharePosterInput(
  plan: SearchStructuredPlan,
  shareUrl: string,
): SharePosterInput {
  const { targetCity } = plan.baseInfo;
  return {
    badge: '漫行灵感',
    title: searchPlanCatchyTitle(plan).replace(/[《》]/g, ''),
    subtitle: searchPlanLiteHeader(plan),
    summary: getSearchPlanPosterSummary(plan),
    shareUrl,
    coverImageUrl: getSearchPlanCoverUrl(targetCity),
    qrCaption: '长按识别看路线参考',
    qrFooter: '蜗牛旅行',
    tone: 'brand',
  };
}

function seedNoteSlides(plan: SearchStructuredPlan) {
  return buildSearchPlanXhsScenes(plan).map((scene) => ({
    imageUrl: scene.imageUrl,
    eyebrow: scene.kicker,
    title: scene.title,
    caption: scene.caption,
  }));
}

export function getSearchPlanXhsPosterInput(
  plan: SearchStructuredPlan,
  shareUrl: string,
): XhsPosterInput {
  const input = getSearchPlanSharePosterInput(plan, shareUrl);
  const noteSlides = seedNoteSlides(plan);
  const cover = getSearchPlanNoteCoverUrl(plan) || noteSlides[0]?.imageUrl || input.coverImageUrl;
  const { targetCity } = plan.baseInfo;
  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags([], searchPlanPublicHashtags(plan)),
      locationLabel: targetCity,
      titlePrefix: '🐌 ',
    }),
    badgeLabel: BRAND_NAME,
    coverImageUrl: cover,
    noteSlides,
    slideImageUrls: noteSlides.map((slide) => slide.imageUrl),
  };
}

export function getSearchPlanXhsCopyText(
  plan: SearchStructuredPlan,
  shareUrl: string,
): XhsNoteCopyText {
  return xhsInputToCopyText(getSearchPlanXhsPosterInput(plan, shareUrl));
}

export function getSearchPlanWechatCopyText(plan: SearchStructuredPlan): XhsNoteCopyText {
  const copy = buildSearchPlanWechatPlatformCopy(plan);
  return { title: copy.title, body: copy.hook, hashtags: copy.hashtags };
}

export function getSearchPlanDouyinCopyText(
  plan: SearchStructuredPlan,
  shareUrl = '',
): XhsNoteCopyText {
  const copy = buildSearchPlanDouyinPlatformCopy(plan);
  return {
    title: copy.title,
    body: copy.hook,
    hashtags: copy.hashtags,
    shareUrl: shareUrl.trim() ? undefined : undefined,
  };
}

export async function buildSearchPlanPosterBlob(
  plan: SearchStructuredPlan,
  shareUrl: string,
): Promise<Blob> {
  return renderSharePoster(getSearchPlanSharePosterInput(plan, shareUrl));
}

export async function buildSearchPlanWechatSquarePosterBlob(
  plan: SearchStructuredPlan,
  compact = isLikelyMobileShareDevice(),
): Promise<Blob> {
  const kind = compact ? 'wechat' : 'wechat';
  return renderItinerarySummaryPoster(
    plan,
    kind,
    searchPlanPosterShareUrl(null, plan.baseInfo, plan),
  );
}

export async function buildSearchPlanDouyinStaticPosterBlob(
  plan: SearchStructuredPlan,
  compact = isLikelyMobileShareDevice(),
): Promise<Blob> {
  const kind = compact ? 'douyin' : 'douyin';
  return renderItinerarySummaryPoster(
    plan,
    kind,
    searchPlanPosterShareUrl(null, plan.baseInfo, plan),
  );
}

export async function buildSearchPlanDouyinPosterBlob(
  plan: SearchStructuredPlan,
  shareUrl = '',
): Promise<Blob> {
  try {
    return await buildSearchPlanDouyinStaticPosterBlob(plan, Boolean(shareUrl));
  } catch (reason) {
    const raw = reason instanceof Error ? reason.message : '';
    if (/scenery|Cannot read properties|null|undefined/i.test(raw)) {
      throw new Error('配图暂时没生成，点重试再看一眼');
    }
    throw reason instanceof Error ? reason : new Error('配图暂时没生成，点重试再看一眼');
  }
}

export async function buildSearchPlanXhsPosterSlides(
  plan: SearchStructuredPlan,
  shareUrl: string,
): Promise<Blob[]> {
  const slides = seedNoteSlides(shareUrl ? plan : plan);
  return Promise.all(
    slides.map((slide, index) =>
      renderXhsImageSlide({
        imageUrl: slide.imageUrl,
        eyebrow: slide.eyebrow,
        title: slide.title,
        caption: slide.caption,
        pageIndex: index + 1,
        totalPages: slides.length,
      }),
    ),
  );
}

export async function buildSearchPlanXhsPosterBlob(
  plan: SearchStructuredPlan,
  shareUrl: string,
): Promise<Blob> {
  const slides = await buildSearchPlanXhsPosterSlides(plan, shareUrl);
  return slides[0]!;
}
