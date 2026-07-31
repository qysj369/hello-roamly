import { CITY_COORDINATES } from '@/data/cityCoordinates';

const KNOWN_PLACE_NAMES = Object.keys(CITY_COORDINATES).sort((a, b) => b.length - a.length);

/** 口语缩写：「苏杭三日」→ 苏州+杭州，不依赖逐城维护坐标 */
const COLLOQUIAL_PLACE_ALIASES: Record<string, string[]> = {
  苏杭: ['苏州', '杭州'],
  京沪: ['北京', '上海'],
  京津: ['北京', '天津'],
  成渝: ['成都', '重庆'],
  广深: ['广州', '深圳'],
  港澳: ['香港', '澳门'],
  鲁豫: ['山东', '河南'],
  陕甘: ['陕西', '甘肃'],
};

const SCENIC_SUFFIX =
  '(?:古城|古镇|古街|古巷|古运河|运河|老街|步行街|小吃街|景区|风景区|国家公园|公园|微山湖|山湖|湖|海|湾|岛|山庄|庄|村|镇|山|岭|峰|谷|峡|沟|林|寺|庙|塔|园|楼|阁|殿|故居|纪念馆|博物馆|湿地|草原|瀑布|温泉|乐园|港|堤|门|坝|圩|城墙|新区|开发区|高新区)';

const NON_PLACE_TOKENS = new Set([
  '想吃',
  '要吃',
  '火锅',
  '小吃',
  '美食',
  '海鲜',
  '露营',
  '打卡',
  '拍照',
  '摄影',
  '穷游',
  '预算',
  '人均',
  '左右',
  '以内',
  '大约',
  '大概',
  '想要',
  '打算',
  '准备',
  '计划',
  '安排',
  '看看',
  '逛逛',
  '转转',
]);

const INTENT_NOISE =
  /(?:人均)?预算\s*\d+\s*元?|\d+\s*元|[一二三四五六七八九十两\d]+\s*天(?:游|行程|自驾游?)?|[一二三四五六七八九十两\d]+\s*日(?:游|行程)?|穷游|联游|日游|攻略|旅行|美食|摄影|打卡|自驾|租车|开车|私家车|体验|当地|人文|省钱|硬核|低预算|自然风光|历史文化|摄影打卡|省钱优先|体验当地|想去|规划|方案|路线|行程|游玩|出发|亲子游|研学游|深度游|跟团游|自由行|蜜月游|毕业游|避暑游|过冬游|露营游|徒步游|骑行游|海岛游|古城游|古镇游|吃火锅|想吃|要吃/g;

/** 去掉天数/预算/偏好等，保留地名串 */
export function stripTravelIntentNoise(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(
    /从\s*[\u4e00-\u9fa5]{2,12}?\s*(?:出发\s*)?(?:去|往|到|飞|前往)\s*/g,
    '',
  );
  cleaned = cleaned.replace(INTENT_NOISE, '');
  cleaned = cleaned.replace(/\d+/g, '');
  cleaned = cleaned.replace(/[，,。；;、\s→—－|+＋/>+-]+/g, '');
  return cleaned.trim();
}

function expandColloquialAliases(text: string): string[] | null {
  for (const [alias, stops] of Object.entries(COLLOQUIAL_PLACE_ALIASES)) {
    if (text.includes(alias)) {
      return stops;
    }
  }
  return null;
}

function isValidPlaceToken(token: string): boolean {
  const trimmed = token.trim();
  if (trimmed.length < 2) {
    return false;
  }
  if (NON_PLACE_TOKENS.has(trimmed)) {
    return false;
  }
  if (/^(?:亲子|研学|蜜月|毕业|避暑|过冬|露营|徒步|骑行|海岛|古城|古镇|深度|跟团|自由)$/.test(trimmed)) {
    return false;
  }
  if (/^[一二三四五六七八九十两\d]+(?:天|日|元)$/.test(trimmed)) {
    return false;
  }
  return /^[\u4e00-\u9fa5]{2,12}(?:古城|古镇|景区|湖|庄|村|镇|山|岛|公园|博物馆|寺|庙|塔|园|楼|阁|殿|故居|纪念馆|湿地|草原|瀑布|温泉|乐园|港|堤|门|坝|圩|城墙|新区|开发区|高新区)?$/.test(
    trimmed,
  );
}

/** 粘连地名串：周村古城青州潍坊 → [周村古城, 青州, 潍坊] */
export function segmentGluedPlaceText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const aliasStops = expandColloquialAliases(trimmed);
  if (aliasStops) {
    return aliasStops;
  }

  const stops: string[] = [];
  let index = 0;

  while (index < trimmed.length) {
    const char = trimmed[index]!;
    if (!/[\u4e00-\u9fa5]/.test(char)) {
      index += 1;
      continue;
    }

    let matched: string | null = null;

    for (const name of KNOWN_PLACE_NAMES) {
      if (trimmed.startsWith(name, index)) {
        matched = name;
        break;
      }
    }

    if (!matched) {
      const rest = trimmed.slice(index);
      const scenicMatch = rest.match(new RegExp(`^([\\u4e00-\\u9fa5]{2,4}${SCENIC_SUFFIX})`));
      if (scenicMatch?.[1]) {
        matched = scenicMatch[1];
      } else {
        const plainMatch = rest.match(/^([\u4e00-\u9fa5]{2})/);
        if (plainMatch?.[1]) {
          matched = plainMatch[1];
        }
      }
    }

    if (!matched) {
      index += 1;
      continue;
    }

    if (isValidPlaceToken(matched) && !stops.includes(matched)) {
      stops.push(matched);
    }
    index += matched.length;
  }

  return stops;
}

function isLikelyAdminPlaceText(text: string): boolean {
  if (/省/.test(text)) {
    return true;
  }
  if (/^[\u4e00-\u9fa5]{2,6}市[\u4e00-\u9fa5]{2,10}(?:市|县|区)/.test(text)) {
    return true;
  }
  return false;
}

function splitOnSeparators(text: string): string[] {
  return text
    .split(/[→—－|+＋、，,;；\s/>+-]+/)
    .map((part) => part.trim())
    .filter((part) => isValidPlaceToken(part) && !/省$/.test(part));
}

function extractOriginHint(text: string): string | null {
  const fromGoMatch = text.match(
    /从\s*([\u4e00-\u9fa5]{2,12}?)\s*(?:出发\s*)?(?:去|往|到|飞|前往)/,
  );
  if (fromGoMatch?.[1]) {
    return fromGoMatch[1];
  }
  const routeMatch = text.match(
    /(?:从\s*)?([\u4e00-\u9fa5]{2,12}?)\s*(?:到|至|→|->|—|－|-)\s*([\u4e00-\u9fa5]{2,12})/,
  );
  if (routeMatch?.[1]) {
    return routeMatch[1];
  }
  return null;
}

function filterOriginFromStops(stops: string[], origin: string | null): string[] {
  if (!origin?.trim()) {
    return stops;
  }
  const originTrimmed = origin.trim();
  return stops.filter((stop) => {
    if (stop === originTrimmed) {
      return false;
    }
    if (originTrimmed.includes(stop) || stop.includes(originTrimmed)) {
      return false;
    }
    return true;
  });
}

function getRouteDestinationSuffix(text: string): string | null {
  const patterns = [
    /从\s*[\u4e00-\u9fa5]{2,12}?\s*(?:出发\s*)?(?:去|往|到|飞|前往)\s*([\s\S]+)$/,
    /(?:从\s*)?[\u4e00-\u9fa5]{2,12}?\s*(?:到|至|→|->|—|－|-)\s*([\s\S]+)$/,
    /[\u4e00-\u9fa5]{2,10}?\s*(?:出发|飞|飞往|坐高铁|坐动车|高铁|火车)\s*(?:去|到|往)?\s*([\s\S]+)$/,
    /[\u4e00-\u9fa5]{2,10}?\s*去\s*([\s\S]+)$/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }
  return null;
}

/** 仅「A 去 B」双城路线时跳过联游分段；「A 去 B C D」仍按多地处理 */
function hasSimpleCrossCityRoute(text: string): boolean {
  const destSuffix = getRouteDestinationSuffix(text);
  if (!destSuffix) {
    return false;
  }
  const stops = segmentGluedPlaceText(stripTravelIntentNoise(destSuffix));
  return stops.length <= 1;
}

/** 通用多地解析：不依赖维护城市表，靠分段 + 可选地理编码校验 */
export function segmentTravelPlaces(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed || isLikelyAdminPlaceText(trimmed) || hasSimpleCrossCityRoute(trimmed)) {
    return [];
  }

  const routeOrigin = extractOriginHint(trimmed);
  const stripped = stripTravelIntentNoise(trimmed);
  const fromSeparators = splitOnSeparators(trimmed);
  const fromStrippedSeparators = stripped.includes('→') ? splitOnSeparators(stripped) : [];

  let stops: string[] =
    fromSeparators.length >= 2
      ? fromSeparators
      : fromStrippedSeparators.length >= 2
        ? fromStrippedSeparators
        : segmentGluedPlaceText(stripped || trimmed);

  stops = filterOriginFromStops(stops, routeOrigin);

  return stops.length >= 2 ? stops : [];
}

export function segmentPrimaryPlace(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const multi = segmentTravelPlaces(trimmed);
  if (multi.length >= 1) {
    return multi[0]!;
  }

  const stripped = stripTravelIntentNoise(trimmed);
  const glued = segmentGluedPlaceText(stripped || trimmed);
  if (glued.length >= 1) {
    return glued[0]!;
  }

  const routeOrigin = extractOriginHint(trimmed);
  if (routeOrigin) {
    const destStops = segmentGluedPlaceText(stripTravelIntentNoise(trimmed.replace(/从\s*[\u4e00-\u9fa5]{2,12}?\s*(?:出发\s*)?(?:去|往|到|飞|前往)\s*/, '')));
    if (destStops.length >= 1) {
      return destStops[0]!;
    }
  }

  for (const name of KNOWN_PLACE_NAMES) {
    const index = trimmed.indexOf(name);
    if (index >= 0) {
      return name;
    }
  }

  const token = stripped.match(/[\u4e00-\u9fa5]{2,8}/)?.[0];
  return token && isValidPlaceToken(token) ? token : null;
}
