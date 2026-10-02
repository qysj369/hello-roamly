import { renderXhsImageSlide } from '@/lib/share/renderXhsImageSlide';
import { collectSearchPlanShareFragments } from '@/lib/home/searchPlanShareFragments';
import {
  SEARCH_PLAN_SHARE_REF,
  sanitizePosterOverlayText,
  sanitizeShareExportText,
} from '@/lib/home/searchPlanShareChannels';
import { searchPlanPublicHashtags, searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import { matchShanghaiSharePhoto, pickShanghaiAtmospherePhoto } from '@/lib/home/shanghaiSharePhotoMatch';
import { matchSearchPlanSpotPhoto } from '@/lib/home/citySharePhotoLibrary';
import { getSearchPlanNoteCoverUrl } from '@/lib/home/searchPlanNoteSlides';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanXhsNoteSlide = {
  role: 'cover' | 'fragments' | 'food';
  imageUrl: string;
  eyebrow: string;
  title: string;
  caption: string;
};

function softLine(text: string, fallback: string): string {
  const clean = sanitizePosterOverlayText(text.replace(/^【行程亮点】/u, ''))
    .replace(/必体验[:：]?\s*/gu, '')
    .replace(/时间充裕可选[:：]?\s*/gu, '')
    .split(/[；;。]/u)
    .map((part) => part.trim())
    .find((part) => part.length >= 4);
  return (clean || fallback).slice(0, 36);
}

function pickPhoto(plan: SearchStructuredPlan, name: string, used: Set<string>): string {
  const city = searchPlanShareCityName(plan);
  if (/上海/.test(city)) return matchShanghaiSharePhoto(plan, name, used);
  return matchSearchPlanSpotPhoto(plan, name, used);
}

/** 封面 / 行程碎片 / 美食贴士各一张，不写多日清单和预算。 */
export function buildSearchPlanXhsNoteSlides(plan: SearchStructuredPlan): SearchPlanXhsNoteSlide[] {
  const city = searchPlanShareCityName(plan) || '漫游';
  const used = new Set<string>();
  const fragments = collectSearchPlanShareFragments(plan);
  const spots = fragments.filter((item) => item.kind === 'spot').slice(0, 3);
  const foods = fragments.filter((item) => item.kind === 'food');
  const coverName = spots[0]?.name || city;
  const foodName = foods[0]?.name || '本地小吃';

  const coverImage = /上海/.test(city)
    ? pickShanghaiAtmospherePhoto(plan, used)
    : getSearchPlanNoteCoverUrl(plan);

  const fragmentNames = spots.map((item) => item.name);
  const fragmentImage = spots[0]
    ? pickPhoto(plan, spots[0].name, used)
    : pickPhoto(plan, coverName, used);
  const fragmentCaption = spots
    .slice(0, 3)
    .map((item) => softLine(item.caption, `${item.name}停一停`))
    .join(' · ');

  const foodImage = pickPhoto(plan, foodName, used);
  const foodCaption = softLine(
    foods[0]?.caption || plan.dayList[0]?.tips || '',
    '按自己的胃口点就好，别去网红店排队。',
  );

  return [
    {
      role: 'cover',
      imageUrl: coverImage,
      eyebrow: `${city}漫游`,
      title: `${city}周末不用赶`,
      caption: '按自己的节奏随便走走，把空档留给发呆。',
    },
    {
      role: 'fragments',
      imageUrl: fragmentImage,
      eyebrow: '先停两三个点',
      title: fragmentNames.slice(0, 3).join(' · ') || `${city}街巷`,
      caption: fragmentCaption || `${city}找一段人少的路慢慢走。`,
    },
    {
      role: 'food',
      imageUrl: foodImage,
      eyebrow: '随便吃一口',
      title: foodName,
      caption: foodCaption,
    },
  ].map((slide) => ({
    ...slide,
    eyebrow: sanitizePosterOverlayText(slide.eyebrow).slice(0, 18),
    title: sanitizePosterOverlayText(slide.title).slice(0, 22),
    caption: sanitizePosterOverlayText(slide.caption).slice(0, 36),
  }));
}

export function buildSearchPlanXhsSeedCopy(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan) || '漫游';
  const slides = buildSearchPlanXhsNoteSlides(plan);
  const spots = slides[1];
  const food = slides[2];
  const tags = [`#${city}慢游`, '#城市漫游', '#周末去哪', ...searchPlanPublicHashtags(plan).map((tag) => `#${tag}`)]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 5)
    .join(' ');
  const body = [
    `${city}周末不用赶，先把脚步放慢。`,
    spots ? `${spots.title}随便走走，${spots.caption}` : '',
    food ? `${food.title}点一份就够，${food.caption}` : '',
    '旅行不用排满点位，吃一口、看一层，就已经很松弛。',
    SEARCH_PLAN_SHARE_REF,
    tags,
  ]
    .filter(Boolean)
    .join('\n\n');
  return sanitizeShareExportText(body);
}

export async function renderSearchPlanXhsNotePosters(plan: SearchStructuredPlan): Promise<Blob[]> {
  const slides = buildSearchPlanXhsNoteSlides(plan);
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
