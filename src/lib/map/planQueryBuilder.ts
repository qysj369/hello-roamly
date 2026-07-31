import {
  extractMultiStopDestinations,
  extractPrimaryLocation,
  extractSearchDestination,
} from '@/lib/map/travelQueryParsing';
import {
  buildThemeStandards,
  buildTransportModeStandards,
  parseTransportMode,
  type TransportMode,
} from '@/lib/map/travelTransportModes';
import type { TrailWallGuide } from '@/types/domain/trailWall';

export type TravelSearchIntent = {
  rawText: string;
  destinationHint: string | null;
  multiStops: string[];
  days: number | null;
  budgetYuan: number | null;
  preferences: string[];
  selfDrive: boolean;
  transportMode: TransportMode;
};

const PREFERENCE_RULES: { pattern: RegExp; label: string }[] = [
  { pattern: /美食|小吃|吃|火锅|湘菜|夜市/, label: '美食' },
  { pattern: /摄影|拍照|打卡|胶片|出片/, label: '摄影打卡' },
  { pattern: /自然|户外|徒步|山|海|湖|公园/, label: '自然风光' },
  { pattern: /历史|文化|博物馆|古迹/, label: '历史文化' },
  { pattern: /穷游|省钱|硬核|低预算/, label: '省钱优先' },
  { pattern: /当地|人文|体验/, label: '体验当地' },
  { pattern: /露营|帐篷|野营|camping/i, label: '露营' },
  { pattern: /垂钓|钓鱼|水库|渔场/, label: '垂钓' },
  { pattern: /亲子|带娃|儿童|小朋友|遛娃/, label: '亲子' },
  { pattern: /研学|红色旅游|科普|教育基地/, label: '研学' },
  { pattern: /采摘|果园|农家|葡萄|樱桃|草莓/, label: '采摘' },
];

const CN_DIGITS: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseChineseNumeral(value: string): number | null {
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  if (value === '十') {
    return 10;
  }
  if (value.startsWith('十') && value.length === 2) {
    const unit = CN_DIGITS[value[1] ?? ''];
    return unit != null ? 10 + unit : null;
  }
  if (value.endsWith('十') && value.length === 2) {
    const tens = CN_DIGITS[value[0] ?? ''];
    return tens != null ? tens * 10 : null;
  }
  return CN_DIGITS[value] ?? null;
}

function parseBudgetYuan(text: string): number | null {
  const budgetMatch = text.match(/预算\s*(\d+)\s*元?/);
  if (budgetMatch?.[1]) {
    return Number.parseInt(budgetMatch[1], 10);
  }

  const yuanMatch = text.match(/(\d+)\s*元/);
  if (yuanMatch?.[1]) {
    return Number.parseInt(yuanMatch[1], 10);
  }

  const dayNumberMatch = text.match(/(\d+)\s*天/);
  const dayDigits = dayNumberMatch?.[1] ?? null;
  const numericTokens = [...text.matchAll(/(\d+)/g)].map((match) => match[1]);
  const budgetCandidates = numericTokens.filter((token) => token !== dayDigits);
  if (budgetCandidates.length > 0) {
    return Number.parseInt(budgetCandidates[budgetCandidates.length - 1]!, 10);
  }

  return null;
}

function parseDays(text: string): number | null {
  const digitMatch = text.match(/(\d+)\s*天/);
  if (digitMatch?.[1]) {
    return Number.parseInt(digitMatch[1], 10);
  }

  const cnDayMatch = text.match(/([一两二三四五六七八九十]{1,2})\s*天/);
  if (cnDayMatch?.[1]) {
    return parseChineseNumeral(cnDayMatch[1]);
  }

  const cnRiMatch = text.match(/([一两二三四五六七八九十]{1,2})\s*日(游|行程)?/);
  if (cnRiMatch?.[1]) {
    return parseChineseNumeral(cnRiMatch[1]);
  }

  return null;
}

function parsePreferences(text: string): string[] {
  const found = new Set<string>();
  for (const rule of PREFERENCE_RULES) {
    if (rule.pattern.test(text)) {
      found.add(rule.label);
    }
  }
  return [...found];
}

function parseSelfDrive(text: string): boolean {
  return parseTransportMode(text) === 'self_drive';
}

export function appendIntentPromptLines(intent: TravelSearchIntent, parts: string[]): void {
  const transportLine = buildTransportModeStandards(intent.transportMode);
  if (transportLine) {
    parts.push(transportLine.replace(/\n/g, ' '));
  }
  const themeLine = buildThemeStandards(intent.preferences);
  if (themeLine) {
    parts.push(themeLine.replace(/\n/g, ' '));
  }
}

function buildMultiStopDayPlan(stops: string[], totalDays: number): string {
  if (totalDays <= stops.length) {
    return stops
      .slice(0, totalDays)
      .map((stop, index) => `第${index + 1}天主玩${stop}`)
      .join('，');
  }

  const lines = stops
    .slice(0, -1)
    .map((stop, index) => `第${index + 1}天主玩${stop}`);
  const lastStop = stops[stops.length - 1]!;
  const lastStopStartDay = stops.length;
  const lastStopDays = totalDays - stops.length + 1;
  if (lastStopDays === 1) {
    lines.push(`第${lastStopStartDay}天主玩${lastStop}`);
  } else {
    lines.push(
      `第${lastStopStartDay}天至第${totalDays}天在${lastStop}深度游（含玩法与整理返程）`,
    );
  }
  return lines.join('，');
}

/** 从搜索框文案解析天数、预算与偏好（目的地仍用 extractPrimaryLocation） */
export function parseTravelSearchIntent(text: string): TravelSearchIntent {
  const trimmed = text.trim();
  const multiStops = extractMultiStopDestinations(trimmed);
  return {
    rawText: trimmed,
    destinationHint: extractSearchDestination(trimmed) ?? extractPrimaryLocation(trimmed),
    multiStops,
    days: parseDays(trimmed),
    budgetYuan: parseBudgetYuan(trimmed),
    preferences: parsePreferences(trimmed),
    selfDrive: parseSelfDrive(trimmed),
    transportMode: parseTransportMode(trimmed),
  };
}

/** 多地联游：按天分配站点，要求写清站间交通 */
export function buildMultiStopSearchPlanQuery(
  stops: string[],
  intent: TravelSearchIntent = parseTravelSearchIntent(''),
  originName?: string | null,
): string {
  const dayCount = Math.max(intent.days ?? 0, stops.length);
  const dayPlan = buildMultiStopDayPlan(stops, dayCount);
  const parts = [
    originName?.trim() ? `从${originName.trim()}出发` : null,
    `用户要去${stops.join('、')}共${stops.length}个目的地多地联游`,
    `共${dayCount}天，须${dayPlan}`,
    `缺一不可：${stops.join('、')}每个站点都要写完整玩法`,
    intent.selfDrive
      ? '第1天须写「从出发地自驾→第一站」，站间写自驾路线（高速/国道）、里程、过路费、油费与停车，禁止写高铁/火车/飞机'
      : '第1天须写「家门口→出发站→大交通→第一站」，每日写清跨站大交通与门到门衔接，禁止只规划其中部分站点',
  ].filter(Boolean) as string[];
  if (intent.budgetYuan) {
    parts.push(`人均预算约${intent.budgetYuan}元`);
  }
  if (intent.preferences.length > 0) {
    parts.push(`偏好：${intent.preferences.join('、')}`);
  }
  appendIntentPromptLines(intent, parts);
  parts.push('请给出穷游方案（含交通、住宿、花费清单与每日行程）');
  return parts.join('，');
}

export function buildEnrichedSearchPlanQuery(
  rawText: string,
  destinationLabel: string,
  intent: TravelSearchIntent = parseTravelSearchIntent(rawText),
): string {
  const parts = [`想去${destinationLabel}`];

  if (intent.days) {
    parts.push(`行程${intent.days}天`);
  }
  if (intent.budgetYuan) {
    parts.push(`人均预算约${intent.budgetYuan}元`);
  }
  if (intent.preferences.length > 0) {
    parts.push(`偏好：${intent.preferences.join('、')}`);
  }
  appendIntentPromptLines(intent, parts);

  if (parts.length === 1) {
    return intent.rawText || rawText;
  }

  parts.push('请给出穷游方案（含交通、住宿、花费清单与每日行程）');
  return parts.join('，');
}

export function buildCrossCityPlanQuery(originLabel: string, destinationLabel: string): string {
  return `从${originLabel}出发，去${destinationLabel}，门到门穷游方案（须含：①家门口→出发站 ②大交通 ③抵达站→住宿；公交须写具体上车站、换车站与第二路车号、下车站及步行距离，大城市必须写换车）`;
}

/** 跨城搜索：合并天数、预算与偏好 */
export function buildCrossCitySearchPlanQuery(
  originLabel: string,
  destinationLabel: string,
  intent: TravelSearchIntent = parseTravelSearchIntent(''),
  rawText?: string,
): string {
  const parts = [buildCrossCityPlanQuery(originLabel, destinationLabel)];
  if (intent.days) {
    parts.push(`行程${intent.days}天`);
  }
  if (intent.budgetYuan) {
    parts.push(`人均预算约${intent.budgetYuan}元`);
  }
  if (intent.preferences.length > 0) {
    parts.push(`偏好：${intent.preferences.join('、')}`);
  }
  appendIntentPromptLines(intent, parts);
  if (parts.length === 1 && rawText?.trim()) {
    return `${parts[0]}。补充需求：${rawText.trim()}`;
  }
  return parts.join('，');
}

/** 出发地与目的地是否视为同一城市（含「济南市历下区」与「济南」） */
export function isSameCityRegion(originLabel: string, destinationLabel: string): boolean {
  const originCity = extractPrimaryLocation(originLabel) ?? originLabel;
  const destCity = extractPrimaryLocation(destinationLabel) ?? destinationLabel;
  if (originCity === destCity) {
    return true;
  }
  return originLabel.includes(destCity) || destinationLabel.includes(originCity);
}

export function buildGuidePlanQuery(originLabel: string, guide: TrailWallGuide): string {
  const parts = [
    `从${originLabel}出发，去${guide.end_city}`,
    `参考轨迹攻略「${guide.title}」`,
    `${guide.days}天行程`,
    `参考预算 ${guide.budget}`,
  ];

  const summary = guide.summary.trim();
  if (summary) {
    parts.push(`概要：${summary.slice(0, 96)}`);
  }

  parts.push('请规划穷游行程（含交通、住宿与目的地玩法，尽量贴近参考预算）');
  return parts.join('，');
}
