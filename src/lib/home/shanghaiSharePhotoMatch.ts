import { SHANGHAI_SHARE_PHOTO_KIT, type ShanghaiSharePhotoAsset } from '@/data/shanghaiSharePhotoKit';
import { classifySearchPlanParty } from '@/lib/home/searchPlanParty';
import { searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import { scoreSpotNameHit } from '@/lib/home/spotNameHit';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const preloaded = new Set<string>();

export function preloadShanghaiSharePhotos(): void {
  if (typeof Image === 'undefined') return;
  for (const asset of SHANGHAI_SHARE_PHOTO_KIT) {
    if (preloaded.has(asset.photoPath)) continue;
    preloaded.add(asset.photoPath);
    const image = new Image();
    image.decoding = 'async';
    image.src = asset.photoPath;
  }
}

export function shanghaiSharePhotosCached(): boolean {
  return preloaded.size >= new Set(SHANGHAI_SHARE_PHOTO_KIT.map((item) => item.photoPath)).size;
}

function take(path: string, used: Set<string>): string {
  used.add(path);
  return path;
}

function pickBestAsset(
  needle: string,
  used: Set<string>,
  kind?: ShanghaiSharePhotoAsset['kind'],
): ShanghaiSharePhotoAsset | null {
  let best: ShanghaiSharePhotoAsset | null = null;
  let bestScore = 0;
  for (const asset of SHANGHAI_SHARE_PHOTO_KIT) {
    if (used.has(asset.photoPath)) continue;
    if (kind && asset.kind !== kind) continue;
    const score = scoreSpotNameHit(asset.name, asset.keys, needle);
    if (score > bestScore) {
      bestScore = score;
      best = asset;
    }
  }
  return bestScore > 0 ? best : null;
}

function firstUnused(kind: ShanghaiSharePhotoAsset['kind'], used: Set<string>): string | null {
  const hit = SHANGHAI_SHARE_PHOTO_KIT.find((item) => item.kind === kind && !used.has(item.photoPath));
  return hit?.photoPath ?? null;
}

export function pickShanghaiAtmospherePhoto(plan: SearchStructuredPlan, used: Set<string>): string {
  const focus = classifySearchPlanParty(plan.baseInfo.peopleType);
  const theme = plan.baseInfo.theme ?? '';
  const themePreferred = /美食/.test(theme)
    ? ['老弄堂街巷', '黄浦江畔']
    : /自然|风光/.test(theme)
      ? ['江边日落', '世纪公园', '黄浦江畔']
      : /人文|城市/.test(theme)
        ? ['梧桐老街', '老弄堂街巷', '武康路']
        : null;
  const partyPreferred =
    focus === 'couple'
      ? ['江边日落', '北外滩日落', '黄浦江畔']
      : focus === 'family'
        ? ['人民广场', '世纪公园', '老弄堂街巷']
        : ['老弄堂街巷', '黄浦江畔', '外滩滨江'];
  const preferred = themePreferred ?? partyPreferred;
  for (const name of preferred) {
    const hit = pickBestAsset(name, used);
    if (hit) return take(hit.photoPath, used);
  }
  return take(firstUnused('vibe', used) || '/city-kit/shanghai/cover.jpg', used);
}

/** 同名 / 同分类优先，没有精准点位时用城市氛围兜底。 */
export function matchShanghaiSharePhoto(
  plan: SearchStructuredPlan,
  name: string,
  used: Set<string>,
  kind?: ShanghaiSharePhotoAsset['kind'],
): string {
  const city = searchPlanShareCityName(plan);
  if (!/上海/.test(city)) {
    return pickShanghaiAtmospherePhoto(plan, used);
  }
  const hit = pickBestAsset(name, used, kind);
  if (hit) return take(hit.photoPath, used);
  if (kind === 'food') {
    const food = firstUnused('food', used);
    if (food) return take(food, used);
  }
  return pickShanghaiAtmospherePhoto(plan, used);
}
