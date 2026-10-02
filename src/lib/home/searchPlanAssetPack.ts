import { pickCityShareDouyinScript, type CityShareDouyinScript } from '@/data/cityShareSeedKit';
import { listSameCityPadSpots, matchSearchPlanSpotPhoto } from '@/lib/home/citySharePhotoLibrary';
import { getSearchPlanNoteCoverUrl } from '@/lib/home/searchPlanNoteSlides';
import {
  SEARCH_PLAN_SHARE_REF,
  buildSearchPlanChannelCopy,
  sanitizePosterOverlayText,
} from '@/lib/home/searchPlanShareChannels';
import { collectSearchPlanShareFragments, shopShortName } from '@/lib/home/searchPlanShareFragments';
import { searchPlanPublicHashtags, searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import { buildSearchPlanShareNote, pickSharePlanFragmentDay } from '@/lib/home/searchPlanShareNote';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanDouyinScene = {
  imageUrl: string;
  kicker: string;
  title: string;
  caption: string;
};

export type SearchPlanAssetPack = {
  xhsNote: string;
  douyinSpoken: string;
  douyinSubtitles: string;
  douyinTags: string;
  douyinScenes: SearchPlanDouyinScene[];
  wechatNote: string;
  plainText: string;
};

function atmosphereCaption(text: string): string {
  const parts = text
    .replace(/^【行程亮点】/u, '')
    .replace(/必体验[:：]?\s*/gu, '')
    .replace(/时间充裕可选[:：]?\s*/gu, '')
    .split(/[；;。]/u)
    .map((part) => sanitizePosterOverlayText(part))
    .filter((part) => part.length >= 4 && !/游玩灵感|漫游碎片/.test(part));
  return (parts[0] || '按自己的节奏随便走走').slice(0, 36);
}

function overlayScene(scene: SearchPlanDouyinScene): SearchPlanDouyinScene {
  return {
    imageUrl: scene.imageUrl,
    kicker: sanitizePosterOverlayText(scene.kicker).slice(0, 18),
    title: sanitizePosterOverlayText(scene.title).slice(0, 22),
    caption: sanitizePosterOverlayText(scene.caption).slice(0, 36),
  };
}

function pickNamedPhoto(plan: SearchStructuredPlan, name: string, used: Set<string>): string {
  return matchSearchPlanSpotPhoto(plan, name, used);
}

export function buildSearchPlanDouyinTags(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  return [`#${city}慢游`, '#城市漫游', '#周末去哪', ...searchPlanPublicHashtags(plan).map((tag) => `#${tag}`)]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .join(' ');
}

function scenesFromScript(script: CityShareDouyinScript): SearchPlanDouyinScene[] {
  return script.shots.slice(0, 3).map((shot) => ({
    imageUrl: shot.imageUrl,
    kicker: script.title,
    title: shot.title,
    caption: shot.caption,
  }));
}

/** 单天 / 单景点氛围碎片，图文对得上，不罗列 Day1-Day3，不叠网址。 */
export function buildSearchPlanDouyinScenes(
  plan: SearchStructuredPlan,
  script?: CityShareDouyinScript | null,
): SearchPlanDouyinScene[] {
  const picked = script ?? pickCityShareDouyinScript(plan);
  if (picked) return scenesFromScript(picked);

  const city = searchPlanShareCityName(plan);
  const day = pickSharePlanFragmentDay(plan);
  const used = new Set<string>();
  const must = day?.spots.find((spot) => /必体验/.test(spot.intro)) ?? day?.spots[0];
  const extra = day?.spots.find((spot) => spot !== must);
  const food = day?.foods[0];

  const scenes: SearchPlanDouyinScene[] = [];
  if (must?.name.trim()) {
    scenes.push({
      imageUrl: pickNamedPhoto(plan, must.name.trim(), used),
      kicker: `${city}漫游`,
      title: must.name.trim(),
      caption: atmosphereCaption(must.intro || `${city}随便走走`),
    });
  }
  if (extra?.name.trim()) {
    scenes.push({
      imageUrl: pickNamedPhoto(plan, extra.name.trim(), used),
      kicker: '停一停',
      title: extra.name.trim(),
      caption: atmosphereCaption(extra.intro || day?.tips || '找个角落坐一会儿'),
    });
  }
  if (food?.shop) {
    scenes.push({
      imageUrl: pickNamedPhoto(plan, shopShortName(food.shop), used),
      kicker: '随便吃一口',
      title: shopShortName(food.shop),
      caption: atmosphereCaption(food.dish || '按自己的胃口点就好'),
    });
  }
  if (!scenes.length) {
    scenes.push({
      imageUrl: getSearchPlanNoteCoverUrl(plan),
      kicker: `${city}漫游`,
      title: city,
      caption: '按自己的节奏随便走走',
    });
  }
  return scenes.slice(0, 3).map(overlayScene);
}

/** 小红书固定 3 张 3:4：按当前行程单景点配图，不足则补同城碎片。 */
export function buildSearchPlanXhsScenes(plan: SearchStructuredPlan): SearchPlanDouyinScene[] {
  const city = searchPlanShareCityName(plan);
  const used = new Set<string>();
  const usedTitles = new Set<string>();
  const scenes: SearchPlanDouyinScene[] = [];

  const pushScene = (title: string, kicker: string, caption: string, imageUrl: string) => {
    const name = sanitizePosterOverlayText(title).slice(0, 22);
    if (!name || usedTitles.has(name) || scenes.length >= 3) return;
    usedTitles.add(name);
    scenes.push(
      overlayScene({
        imageUrl,
        kicker,
        title: name,
        caption: atmosphereCaption(caption || `${city}随便走走`),
      }),
    );
  };

  for (const fragment of collectSearchPlanShareFragments(plan)) {
    if (scenes.length >= 3) break;
    pushScene(
      fragment.name,
      fragment.kind === 'food' ? '随便吃一口' : `${city}漫游`,
      fragment.caption,
      pickNamedPhoto(plan, fragment.name, used),
    );
  }

  for (const pad of listSameCityPadSpots(plan, used, usedTitles)) {
    if (scenes.length >= 3) break;
    used.add(pad.photoPath);
    pushScene(pad.name, `${city}漫游`, pad.blurb, pad.photoPath);
  }

  if (scenes.length < 3) {
    const cover = getSearchPlanNoteCoverUrl(plan);
    pushScene(city, `${city}漫游`, '按自己的节奏随便走走', cover);
  }

  return scenes.slice(0, 3);
}

export function buildSearchPlanDouyinSubtitles(plan: SearchStructuredPlan): string {
  return buildSearchPlanDouyinScenes(plan)
    .map((scene, index) => `${index + 1}. ${scene.kicker} ${scene.title}｜${scene.caption}`)
    .join('\n');
}

export function buildSearchPlanAssetPack(
  plan: SearchStructuredPlan,
  shareUrl: string,
): SearchPlanAssetPack {
  const douyinSpoken = buildSearchPlanChannelCopy('douyin', plan, shareUrl);
  return {
    xhsNote: buildSearchPlanChannelCopy('xhs', plan, shareUrl),
    douyinSpoken,
    douyinSubtitles: `${buildSearchPlanDouyinSubtitles(plan)}\n\n${buildSearchPlanDouyinTags(plan)}`,
    douyinTags: buildSearchPlanDouyinTags(plan),
    douyinScenes: buildSearchPlanDouyinScenes(plan),
    wechatNote: buildSearchPlanChannelCopy('wechat', plan, shareUrl),
    plainText: `${buildSearchPlanShareNote(plan, { density: 'seed', publicSafe: true, tags: false })}\n\n${SEARCH_PLAN_SHARE_REF}`,
  };
}
