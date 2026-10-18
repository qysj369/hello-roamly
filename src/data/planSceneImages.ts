import { findHoloHomeCityKit, HOLO_HOME_CITY_KIT } from '@/data/holoHotCityKit';
import { resolvePublicAssetUrl } from '@/lib/cdn';

export type PlanSceneImageRef = {
  src: string;
  alt: string;
};

type SceneSource = {
  id: string;
  keys: string[];
  localPath: string;
  alt: string;
};

/**
 * 深圳攻略精准配图：仅绑定本地 plan-scenes/shenzhen 实拍。
 * AI 无权生成/替换图片。
 */
const SHENZHEN_SCENES: SceneSource[] = [
  {
    id: 'nanshan-tech',
    keys: ['南山科技园', '高新南', '科技生态园', '高新园', '科技园', '深大'],
    localPath: '/plan-scenes/shenzhen/nanshan-tech.jpg',
    alt: '深圳南山科技园高新南周边办公街区外景',
  },
  {
    id: 'coast-city',
    keys: ['海岸城商圈', '海岸城', '保利文化广场', '后海商圈'],
    localPath: '/plan-scenes/shenzhen/coast-city.jpg',
    alt: '深圳南山海岸城购物中心外景',
  },
  {
    id: 'huaqiangbei',
    keys: ['华强北数码', '华强北', '赛格广场', '赛格', '华强电子世界', '电子市场', '数码市井'],
    localPath: '/plan-scenes/shenzhen/huaqiangbei.jpg',
    alt: '深圳华强北街景与赛格电子市场入口',
  },
  {
    id: 'bay-park',
    keys: ['深圳湾滨海栈道', '深圳湾公园', '滨海栈道', '海湾日落', '落日海岸', '深圳湾'],
    localPath: '/plan-scenes/shenzhen/bay-park.jpg',
    alt: '深圳湾公园滨海栈道与海岸线',
  },
  {
    id: 'bay-mangrove',
    keys: ['红树林', '候鸟湿地', '观海栈道', '湿地'],
    localPath: '/plan-scenes/shenzhen/bay-mangrove.jpg',
    alt: '深圳湾公园红树林方向海岸与步道',
  },
];

const SHENZHEN_COVER_PATH = '/plan-scenes/shenzhen/cover-sz.jpg';
const SHENZHEN_COVER_ALT = '深圳湾公园滨海栈道日落与远处城市天际线';
const BAY_DAY2_PATH = '/plan-scenes/shenzhen/bay-mangrove.jpg';
const BAY_DAY2_ALT = '深圳湾公园海岸线与红树林方向步道';

const CACHE_BUST = 'v=kit1';

function buildLocalUrl(path: string): string {
  const base = resolvePublicAssetUrl(path);
  return base.includes('?') ? `${base}&${CACHE_BUST}` : `${base}?${CACHE_BUST}`;
}

function isShenzhenPlanText(text: string): boolean {
  return /深圳|华强北|深圳湾|海岸城|南山科技园|滨海栈道|高新南|高新园/.test(text);
}

function normalize(text: string): string {
  return text.replace(/\s+/g, '');
}

function isDay2(dayLabel?: string): boolean {
  return /Day\s*2|第\s*2\s*天|第二天/i.test(dayLabel ?? '');
}

function matchShenzhenByTitle(title: string): SceneSource | null {
  const hay = normalize(title);
  if (!hay) return null;
  let best: { scene: SceneSource; keyLen: number } | null = null;
  for (const scene of SHENZHEN_SCENES) {
    for (const key of scene.keys) {
      if (!hay.includes(key)) continue;
      if (!best || key.length > best.keyLen) best = { scene, keyLen: key.length };
    }
  }
  return best?.scene ?? null;
}

function resolveBayVariant(
  scene: SceneSource,
  options?: { dayLabel?: string; usedIds?: Set<string> },
): PlanSceneImageRef {
  const used = options?.usedIds;
  const wantDay2 =
    scene.id === 'bay-mangrove' ||
    isDay2(options?.dayLabel) ||
    Boolean(used?.has('bay-park'));

  if (wantDay2) {
    used?.add('bay-mangrove');
    return { src: buildLocalUrl(BAY_DAY2_PATH), alt: BAY_DAY2_ALT };
  }
  used?.add('bay-park');
  return { src: buildLocalUrl(scene.localPath), alt: scene.alt };
}

/** 一期 8 城图库：标题关键词 → 本地实拍，禁止跨城共用 */
function matchKitSpot(
  title: string,
  context?: string,
): { id: string; path: string; alt: string } | null {
  const hay = normalize(`${title}\n${context ?? ''}`);
  const city =
    HOLO_HOME_CITY_KIT.find((c) => hay.includes(c.name)) ??
    findHoloHomeCityKit(title) ??
    null;
  if (!city) return null;

  const titleHay = normalize(title);
  let best: { id: string; path: string; alt: string; keyLen: number } | null = null;
  for (const spot of city.spots) {
    for (const key of spot.keys) {
      if (!titleHay.includes(key) && !hay.includes(key)) continue;
      if (!best || key.length > best.keyLen) {
        best = {
          id: `${city.id}-${spot.name}`,
          path: spot.photoPath,
          alt: `${city.name}${spot.name}实拍`,
          keyLen: key.length,
        };
      }
    }
  }
  return best ? { id: best.id, path: best.path, alt: best.alt } : null;
}

/** 景点小标题 → 本地实拍图库；无法对应则不配图（禁止错图/生成图） */
export function resolvePlanSpotImage(
  title: string,
  options?: {
    dayLabel?: string;
    context?: string;
    width?: number;
    spotIndex?: number;
    usedIds?: Set<string>;
  },
): PlanSceneImageRef | null {
  void options?.width;
  void options?.spotIndex;

  const blob = `${title}\n${options?.dayLabel ?? ''}\n${options?.context ?? ''}`;
  if (isShenzhenPlanText(blob) || isShenzhenPlanText(title)) {
    const matched = matchShenzhenByTitle(title) ?? matchShenzhenByTitle(blob);
    if (!matched) return null;
    if (matched.id === 'bay-park' || matched.id === 'bay-mangrove') {
      return resolveBayVariant(matched, options);
    }
    options?.usedIds?.add(matched.id);
    return { src: buildLocalUrl(matched.localPath), alt: matched.alt };
  }

  const kitHit = matchKitSpot(title, options?.context);
  if (!kitHit) return null;
  if (options?.usedIds?.has(kitHit.id)) return null;
  options?.usedIds?.add(kitHit.id);
  return { src: buildLocalUrl(kitHit.path), alt: kitHit.alt };
}

/** 封面：深圳优先专用图；否则一期 8 城各自专属封面（禁止共用兜底） */
export function resolvePlanCoverImage(
  input: { intro?: string; itinerary?: string; initialQuery?: string | null },
  options?: { width?: number },
): PlanSceneImageRef | null {
  void options?.width;
  const blob = `${input.initialQuery ?? ''}\n${input.intro ?? ''}\n${input.itinerary ?? ''}`;

  if (isShenzhenPlanText(blob)) {
    return {
      src: buildLocalUrl(SHENZHEN_COVER_PATH),
      alt: SHENZHEN_COVER_ALT,
    };
  }

  const kitCity = findHoloHomeCityKit(blob);
  if (!kitCity) return null;
  return {
    src: buildLocalUrl(kitCity.coverPath),
    alt: `${kitCity.name}专属实拍封面`,
  };
}
