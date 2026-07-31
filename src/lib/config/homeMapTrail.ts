import { readEnv } from '@/lib/config/env';
import { BRAND_FUNCTION_DESC, BRAND_MARK, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brandCopy';

/**
 * 首页「地图轨迹墙」配置
 * 地图样式：Mapbox Studio Dark 模板或自定义极简样式（仅陆地/海洋/国界）
 */
/** 搜索框示例 prompt（placeholder 轮换 + AI 页可参考） */
export const HOME_MAP_TRAIL_SEARCH_EXAMPLES = [
  '西安 三天 1500',
  '扬州 三天 600元',
  '济南 美食 四天',
  '大理 摄影 穷游 2000',
  '成都 火锅 三天 1200',
] as const;

export function pickSearchPlaceholder(seed?: number): string {
  const index =
    seed ??
    Math.floor(Date.now() / 86_400_000) % HOME_MAP_TRAIL_SEARCH_EXAMPLES.length;
  return `搜索目的地，如「${HOME_MAP_TRAIL_SEARCH_EXAMPLES[index]}」`;
}

export function pickSearchPlaceholderShort(seed?: number): string {
  const index =
    seed ??
    Math.floor(Date.now() / 86_400_000) % HOME_MAP_TRAIL_SEARCH_EXAMPLES.length;
  return `如「${HOME_MAP_TRAIL_SEARCH_EXAMPLES[index]}」`;
}

/** 顶栏紧凑搜索框 placeholder（仅城市/首词，尽量短） */
export function pickSearchPlaceholderHeader(seed?: number): string {
  const index =
    seed ??
    Math.floor(Date.now() / 86_400_000) % HOME_MAP_TRAIL_SEARCH_EXAMPLES.length;
  const example = HOME_MAP_TRAIL_SEARCH_EXAMPLES[index];
  return example.split(/\s+/)[0] ?? example;
}

export function pickSearchExampleIndex(seed?: number): number {
  return (
    seed ??
    Math.floor(Date.now() / 86_400_000) % HOME_MAP_TRAIL_SEARCH_EXAMPLES.length
  );
}

/** 从 placeholder 文案提取示例 query，供空搜索一键规划使用 */
export function parseSearchPlaceholderExample(placeholder: string): string | null {
  const match = placeholder.match(/「([^」]+)」/);
  return match?.[1]?.trim() ?? null;
}

export const HOME_MAP_TRAIL = {
  brandMark: BRAND_MARK,
  heroTitle: '地图轨迹墙',
  heroSubtitle: BRAND_FUNCTION_DESC,
  spiritLine: BRAND_SPIRIT_SLOGAN,
  searchPlaceholder: pickSearchPlaceholder(0),
  searchExamples: HOME_MAP_TRAIL_SEARCH_EXAMPLES,
  searchCta: '查找攻略',
  planCta: '一键规划',
  feedTitle: '蜗牛轨迹',
  stripEmptyHint: '暂无轨迹记录，仍可用 AI 定制专属路线',
  noTokenTitle: '配置 Mapbox 以开启地图轨迹墙',
  noTokenHint: '在 .env.local 中设置 VITE_MAPBOX_TOKEN',
} as const;

/** 首页地图规划区 DOM id / URL hash（不含 #） */
export const HOME_MAP_TRAIL_SECTION_ID = 'home-map-trail';

/** 首页顶栏语音搜索（需 HTTPS；设 VITE_HOME_VOICE_SEARCH=true 开启） */
export const HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED =
  readEnv('VITE_HOME_VOICE_SEARCH') === 'true';

/** 轨迹墙初始视野（中国概览） */
export const HOME_MAP_TRAIL_VIEW = {
  longitude: 104.5,
  latitude: 35.2,
  zoom: 4.2,
  pitch: 0,
  bearing: 0,
} as const;

/** 高德轨迹墙底图（默认 normal 以保证地名；可设 VITE_AMAP_TRAIL_STYLE） */
export const HOME_AMAP_TRAIL_MAP_STYLE = 'amap://styles/normal';

/** 默认暗黑底图；可在 Studio 创建无标签样式后替换 */
const DEFAULT_TRAIL_MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export function getTrailWallMapStyle(): string {
  const custom = readEnv('VITE_MAPBOX_TRAIL_STYLE');
  return custom ?? DEFAULT_TRAIL_MAP_STYLE;
}
