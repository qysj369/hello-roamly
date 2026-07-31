/** 出发地展示标签：去掉省前缀，统一格式 */
export function normalizeOriginDisplayLabel(
  geocodedLabel: string,
  userInput?: string | null,
): string {
  const input = userInput?.trim() ?? '';
  const fromGeocode = geocodedLabel
    .trim()
    .replace(/^中国/, '')
    .replace(/^山东省/, '')
    .trim();

  if (!input) {
    return fromGeocode;
  }

  // 用户输入更具体（含小区/路名），优先保留用户输入
  if (input.length > fromGeocode.length && /路|街|小区|花园|苑|号|村|镇/.test(input)) {
    return input.replace(/^山东省/, '').trim();
  }

  return fromGeocode || input;
}
