/**
 * 方案正文目的地漂移校正：搜索莆田时 AI 偶发写成昆明/弥勒等；
 * 以及把「亲子/近郊慢行」玩法标签误写成站名、城市。
 */

const DRIFT_PAIRS: { destinationPattern: RegExp; forbidden: RegExp; replacement: string }[] = [
  {
    destinationPattern: /莆田/,
    forbidden: /昆明南|昆明站|弥勒站|弥勒市|云南高铁|抵达弥勒|前往弥勒|再转弥勒|转弥勒|终点.*?弥勒/g,
    replacement: '莆田站（福州—莆田方向）',
  },
  {
    destinationPattern: /福州/,
    forbidden: /昆明南|弥勒站|弥勒市/g,
    replacement: '福州站',
  },
];

/** 玩法标签被当成地名/站名的典型串 */
export const STYLE_AS_PLACE_PATTERN =
  /近郊慢行目的地|近郊慢行高铁站|近郊慢行亲子公园|亲子出行目的地|亲子出行近郊慢行|慢游目的地|深度游目的地|转场目的地/;

const MAJOR_CITIES = [
  '杭州',
  '济南',
  '成都',
  '苏州',
  '青岛',
  '上海',
  '北京',
  '南京',
  '西安',
  '厦门',
  '广州',
  '深圳',
  '武汉',
  '重庆',
  '福州',
  '昆明',
  '莆田',
  '泉州',
] as const;

/** 大交通段落中禁止出现的与锁定目的地冲突的地名 */
export function getForbiddenPlaceNames(destinationName: string): string[] {
  const dest = destinationName.trim();
  if (/莆田/.test(dest)) {
    return ['昆明', '弥勒', '云南', '大理', '丽江'];
  }
  if (/济南/.test(dest)) {
    return ['莆田', '福州', '厦门'];
  }
  return [];
}

export function extractMajorCityLabel(label: string): string | null {
  const trimmed = label.trim();
  if (!trimmed) {
    return null;
  }
  for (const city of MAJOR_CITIES) {
    if (trimmed.includes(city)) {
      return city;
    }
  }
  return null;
}

/** 是否把玩法标签当成了站名/城市 */
export function detectStyleAsPlace(content: string): boolean {
  return STYLE_AS_PLACE_PATTERN.test(content);
}

/**
 * 锁定城市 A，正文却主写城市 B（如锁杭州却通篇济南）。
 * 返回被劫持的城市名，否则 null。
 */
export function detectDestinationCityHijack(
  content: string,
  destinationName: string,
): string | null {
  const locked = extractMajorCityLabel(destinationName);
  if (!locked || !content.trim()) {
    return null;
  }

  const lockedCount = content.split(locked).length - 1;
  let hijackCity: string | null = null;
  let hijackCount = 0;
  for (const city of MAJOR_CITIES) {
    if (city === locked) {
      continue;
    }
    const count = content.split(city).length - 1;
    if (count > hijackCount) {
      hijackCount = count;
      hijackCity = city;
    }
  }

  // 正文几乎不提锁定城，却大量写另一城
  if (hijackCity && hijackCount >= 5 && lockedCount <= 1) {
    return hijackCity;
  }
  return null;
}

/** 把「近郊慢行目的地」等伪地名替换成真实目的地城市 */
export function scrubStyleAsPlacePhrases(content: string, destinationName: string): string {
  const dest =
    extractMajorCityLabel(destinationName) ||
    destinationName.replace(/市$/, '').trim() ||
    '目的地城市';
  const destStation = `${dest}站`;

  return content
    .replace(/近郊慢行目的地高铁站/g, destStation)
    .replace(/近郊慢行高铁站/g, destStation)
    .replace(/亲子出行(?:近郊慢行)?目的地/g, dest)
    .replace(/近郊慢行目的地/g, dest)
    .replace(/慢游目的地|深度游目的地|转场目的地/g, dest)
    .replace(/近郊慢行亲子公园/g, `${dest}亲子友好公园`)
    .replace(/第\s*([0-9一二三四五六七八九十两]+)\s*天\s*[·•]\s*亲子出行近郊慢行/g, '第$1天 · 近郊亲子慢行')
    .replace(/第\s*([0-9一二三四五六七八九十两]+)\s*天\s*[·•]\s*亲子出行深度游/g, '第$1天 · 亲子深度游')
    .replace(/（[^）]{0,12}→\s*近郊慢行目的地）/g, `（→${dest}）`)
    .replace(/高铁直达近郊慢行目的地/g, `前往${dest}`)
    .replace(/从“近郊慢行”切换到“亲子出行”/g, '从近郊线切换到亲子玩法')
    .replace(/从「近郊慢行」切换到「亲子出行」/g, '从近郊线切换到亲子玩法');
}

function scrubLineForDestination(line: string, destinationName: string): string {
  let next = line;
  for (const rule of DRIFT_PAIRS) {
    if (!rule.destinationPattern.test(destinationName)) {
      continue;
    }
    next = next.replace(rule.forbidden, rule.replacement);
  }

  const forbidden = getForbiddenPlaceNames(destinationName);
  if (forbidden.length === 0) {
    return next;
  }

  const destCore = destinationName.replace(/市|区|县/g, '').slice(0, 2);
  const mentionsDest = destCore.length >= 2 && next.includes(destCore);

  if (!mentionsDest && /大交通|高铁|火车|抵达|终点/.test(next)) {
    for (const place of forbidden) {
      if (next.includes(place) && !destinationName.includes(place)) {
        next = next.replaceAll(place, destinationName.replace(/市$/, '') || '目的地');
      }
    }
  }

  return next;
}

/** 锁定目的地：弱化正文中与用户需求冲突的城市名；清洗玩法标签伪地名 */
export function scrubDestinationDriftInPlan(content: string, destinationName: string): string {
  const dest = destinationName.trim();
  if (!dest || !content.trim() || dest.includes('→')) {
    return content;
  }

  const withStyleFix = scrubStyleAsPlacePhrases(content, dest);
  return withStyleFix
    .split('\n')
    .map((line) => scrubLineForDestination(line, dest))
    .join('\n');
}
