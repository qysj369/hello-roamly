/** 浏览器 GPS 偶发偏到经十路6777 等，与用户校正地址冲突 */
const KNOWN_WRONG_ORIGIN_PATTERNS: RegExp[] = [
  /济南市历下区舜华路街道经十路6777路?/g,
  /舜华路街道经十路6777路?/g,
  /历下区舜华路.*?经十路6777/g,
  /从「经十路6777/g,
  /从「济南市历下区舜华路街道经十路6777/g,
];

/** 锁定出发地：正文不得写成 GPS 漂移地址 */
export function scrubOriginDriftInPlan(content: string, lockedOrigin: string): string {
  const origin = lockedOrigin.trim();
  if (!origin || !content.trim()) {
    return content;
  }

  if (/经十路6777|6777路/.test(origin) && !/绿城|中林|百合/.test(origin)) {
    return content;
  }

  let result = content;
  for (const pattern of KNOWN_WRONG_ORIGIN_PATTERNS) {
    result = result.replace(pattern, origin);
  }

  return result;
}
