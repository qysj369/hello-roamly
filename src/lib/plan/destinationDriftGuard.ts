/**
 * 方案正文目的地漂移校正：搜索莆田时 AI 偶发写成昆明/弥勒等。
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

/** 锁定目的地：弱化正文中与用户需求冲突的城市名 */
export function scrubDestinationDriftInPlan(content: string, destinationName: string): string {
  const dest = destinationName.trim();
  if (!dest || !content.trim() || dest.includes('→')) {
    return content;
  }

  return content
    .split('\n')
    .map((line) => scrubLineForDestination(line, dest))
    .join('\n');
}
