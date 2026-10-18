/**
 * 城市弹窗图栏三级降级：
 * 1) 本地实拍白名单可加载 → photo
 * 2) 二线 AI 配套目录可加载 → ai
 * 3) 统一国风渐变 SVG 占位 → placeholder（图栏始终保留）
 *
 * 【素材分级 · 内测成本控制】
 * 优先完善首页 8 座热门城实景（见 MEDIA_PRIORITY_HOT_CITIES / rolloutPhases）；
 * 其余城市走 AI / 占位，待商业收益后再分批补齐约 72 城实拍。
 */

import {
  assertCityPreviewMediaBound,
  getCityPreviewGallery,
  hasCityGalleryWhitelistEntry,
  type HoloPreviewGalleryItem,
} from '@/data/holoCityPreviewMedia';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { MEDIA_PRIORITY_HOT_CITIES } from '@/lib/config/rolloutPhases';

export type CityGalleryTier = 'photo' | 'ai' | 'placeholder';

export type ResolvedCityGallery = {
  tier: CityGalleryTier;
  items: HoloPreviewGalleryItem[];
};

/** @see MEDIA_PRIORITY_HOT_CITIES — 内测优先实景素材的 8 城 */
export const GALLERY_MEDIA_PRIORITY_CITIES = MEDIA_PRIORITY_HOT_CITIES;

/** 无本地实拍时，尝试 AI 批量配套图的城市（目录：/city-ai/{slug}/） */
export const AI_COMPANION_GALLERY_CITIES: readonly string[] = [
  '成都',
  '重庆',
  '长沙',
  '昆明',
  '贵阳',
  '南宁',
  '合肥',
  '南昌',
  '太原',
  '石家庄',
];

const CITY_SLUG: Record<string, string> = {
  北京: 'beijing',
  上海: 'shanghai',
  杭州: 'hangzhou',
  苏州: 'suzhou',
  济南: 'jinan',
  南京: 'nanjing',
  广州: 'guangzhou',
  深圳: 'shenzhen',
  成都: 'chengdu',
  西安: 'xian',
  厦门: 'xiamen',
  黄山: 'huangshan',
  泉州: 'quanzhou',
  重庆: 'chongqing',
  长沙: 'changsha',
  昆明: 'kunming',
  贵阳: 'guiyang',
  南宁: 'nanning',
  合肥: 'hefei',
  南昌: 'nanchang',
  太原: 'taiyuan',
  石家庄: 'shijiazhuang',
};

/** 每城 AI 配套约定文件名（补图放同名即可自动生效） */
const AI_COMPANION_FILES: readonly { file: string; label: string; featured?: boolean }[] = [
  { file: '01.svg', label: '城市漫行·一', featured: true },
  { file: '02.svg', label: '城市漫行·二' },
  { file: '03.svg', label: '城市漫行·三' },
  { file: '04.svg', label: '城市漫行·四' },
];

const PLACEHOLDER_COUNT = 4;

export function getCityMediaSlug(city: string): string {
  const kit = findHoloHomeCityKit(city);
  if (kit?.id) return kit.id;
  return CITY_SLUG[city] ?? encodeURIComponent(city);
}

function probeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !src) {
      resolve(false);
      return;
    }
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), 4000);
    img.onload = () => {
      window.clearTimeout(timer);
      finish(img.naturalWidth > 0 && img.naturalHeight > 0);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      finish(false);
    };
    img.src = src;
  });
}

async function filterLoadable(
  candidates: readonly HoloPreviewGalleryItem[],
): Promise<HoloPreviewGalleryItem[]> {
  if (!candidates.length) return [];
  const results = await Promise.all(
    candidates.map(async (item) => ((await probeImage(item.src)) ? item : null)),
  );
  return results.filter((item): item is HoloPreviewGalleryItem => item != null);
}

/** 国风漫行渐变占位（data URL），圆角由 CSS figure 统一裁切 */
export function buildCityMoodPlaceholderSrc(city: string, variant: number): string {
  const hues = [
    ['#e8f0e4', '#c5d4b8', '#7a8f6e'],
    ['#f3ebe0', '#d9c4a8', '#a67c52'],
    ['#e6eef5', '#b7c9d9', '#6b87a0'],
    ['#f0e8ef', '#d4b8c9', '#8f6e7a'],
  ];
  const [c0, c1, c2] = hues[variant % hues.length] ?? hues[0];
  const safe = city.replace(/[<>&'"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" role="img" aria-label="${safe}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="55%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="640" cy="120" r="70" fill="rgba(255,254,248,0.22)"/>
  <circle cx="120" cy="480" r="110" fill="rgba(61,70,56,0.08)"/>
  <path d="M80 420 C220 360, 360 470, 520 400 S740 360, 760 420" fill="none" stroke="rgba(255,254,248,0.35)" stroke-width="3"/>
  <text x="40" y="556" fill="rgba(61,70,56,0.55)" font-family="system-ui,sans-serif" font-size="22" font-weight="500" letter-spacing="0.18em">${safe}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildPlaceholderGallery(city: string): HoloPreviewGalleryItem[] {
  /** 占位图底部小字统一展示城市名，与实拍卡片尺寸一致、氛围感统一 */
  const cityLabel = city.trim() || '漫行';
  return Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => ({
    src: buildCityMoodPlaceholderSrc(cityLabel, index),
    label: cityLabel,
    featured: index === 0,
  }));
}

function getAiCompanionCandidates(city: string): HoloPreviewGalleryItem[] {
  if (!AI_COMPANION_GALLERY_CITIES.includes(city)) return [];
  const slug = getCityMediaSlug(city);
  const labelsBySlug: Record<string, readonly string[]> = {
    chengdu: ['宽窄巷子', '锦里灯影', '熊猫慢行', '川味市井'],
  };
  const labels = labelsBySlug[slug];
  return AI_COMPANION_FILES.map((item, index) => ({
    src: `/city-ai/${slug}/${item.file}`,
    label: labels?.[index] ?? `${city}·漫行${index + 1}`,
    featured: item.featured,
  }));
}

/**
 * 本地实拍候选：仅内测优先 8 城走实拍；其余城市直接 AI / 占位（控制前期素材成本）。
 * - 白名单有图 → 用白名单
 * - 白名单显式空表 → 不吞 kit（走 AI / 占位）；补图后写入白名单即可自动切回实拍
 * - 未进白名单表的城市 → 回退 kit.photoPath / coverPath（有文件即可渲染）
 * AI 配套名单内城市同样不吞 kit，避免实拍/AI 混用。
 */
export function getLocalPhotoCandidates(city: string): HoloPreviewGalleryItem[] {
  const isPriorityPhotoCity = (MEDIA_PRIORITY_HOT_CITIES as readonly string[]).includes(city);
  if (!isPriorityPhotoCity) return [];

  const whitelisted = getCityPreviewGallery(city);
  if (whitelisted.length) return whitelisted;

  if (AI_COMPANION_GALLERY_CITIES.includes(city)) return [];
  if (hasCityGalleryWhitelistEntry(city)) return [];

  const kit = findHoloHomeCityKit(city);
  if (!kit) return [];

  const fromKit: HoloPreviewGalleryItem[] = [];
  if (kit.coverPath && assertCityPreviewMediaBound(city, kit.coverPath)) {
    fromKit.push({ src: kit.coverPath, label: `${kit.name}·封面`, featured: true });
  }
  for (const spot of kit.spots) {
    if (!spot.photoPath || !assertCityPreviewMediaBound(city, spot.photoPath)) continue;
    if (fromKit.some((item) => item.src === spot.photoPath)) continue;
    fromKit.push({ src: spot.photoPath, label: spot.name });
  }
  return fromKit.slice(0, 6);
}

/** 三级解析：photo → ai → placeholder */
export async function resolveCityPreviewGallery(city: string): Promise<ResolvedCityGallery> {
  const local = await filterLoadable(getLocalPhotoCandidates(city));
  if (local.length > 0) {
    return { tier: 'photo', items: local };
  }

  const ai = await filterLoadable(getAiCompanionCandidates(city));
  if (ai.length > 0) {
    return { tier: 'ai', items: ai };
  }

  return { tier: 'placeholder', items: buildPlaceholderGallery(city) };
}
