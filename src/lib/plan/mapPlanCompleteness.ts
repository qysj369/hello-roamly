import {
  MAP_PLAN_FINALIZE_MAX_ATTEMPTS,
  MAP_PLAN_INSIGHTS_CONTINUE_MAX_TOKENS,
  MAP_PLAN_MAX_CONTINUE_ATTEMPTS,
} from '@/lib/plan/mapPlanGenerationLimits';
import { enforcePlanDayCountOnContent } from '@/lib/plan/planDayConstraint';
import { scrubDestinationDriftInPlan } from '@/lib/plan/destinationDriftGuard';
import { scrubOriginDriftInPlan } from '@/lib/plan/originDriftGuard';
import {
  PLAN_SECTION_MARKERS,
  parsePlanSections,
  serializePlanSections,
} from '@/lib/plan/parsePlanSections';

/** 末尾是否像被 max_tokens 截断 */
export function isTextTailTruncated(text: string): boolean {
  const tail = text.trimEnd();
  if (!tail) {
    return false;
  }

  if (/[。！？🐌]$/.test(tail)) {
    return false;
  }

  if (/\|.+\|\s*$/.test(tail)) {
    return false;
  }

  if (/\*\*[^*\n]{0,40}$/.test(tail)) {
    return true;
  }

  if (/[，、：；的了吗着呢啊]$/.test(tail)) {
    return true;
  }

  if (/\*\*$/.test(tail)) {
    return true;
  }

  const lastLine = tail.split('\n').pop()?.trim() ?? '';
  if (lastLine && !/[。！？]$/.test(lastLine) && lastLine.length < 18) {
    return true;
  }

  return false;
}

function isSectionBodyComplete(body: string, minLength: number): boolean {
  const trimmed = body.trim();
  if (trimmed.length < minLength) {
    return false;
  }
  const hasSentence = /[。！？]/.test(trimmed);
  const hasTable = /\|.+\|/.test(trimmed);
  if (!hasSentence && !hasTable) {
    return false;
  }
  return !isTextTailTruncated(trimmed);
}

/** 统一为四段标题格式，便于展示与校验 */
function ensureSectionReadable(body: string, fallback: string): string {
  let text = body.trim();
  if (!text) {
    return fallback;
  }
  if (isTextTailTruncated(text)) {
    const lastEnd = Math.max(
      text.lastIndexOf('。'),
      text.lastIndexOf('！'),
      text.lastIndexOf('？'),
    );
    text = lastEnd >= 0 ? text.slice(0, lastEnd + 1) : '';
  }
  if (!text || text.length < 10 || !/[。！？]/.test(text)) {
    return fallback;
  }
  return text;
}

/** 缺段时用可读兜底句补齐，避免弹「未完成」 */
export function padMissingMapPlanSections(content: string, locationName: string): string {
  const place = locationName.trim() || '目的地';
  const sections = parsePlanSections(trimTruncatedInsightsTail(content.trim()));
  const snailFallback = `到${place}先钻菜市场和小巷找早饭，比景区门口便宜一半。晚饭去本地人多的小馆，人均三十左右。🐌`;
  const pitfallsFallback = `别在车站买礼盒特产，性价比低。景区门口拉客项目先问清价格。旺季车票和住宿越早订越省。`;

  return serializePlanSections({
    intro:
      sections.intro.trim() ||
      (sections.itinerary.trim()
        ? `${place}穷游方案如下，花费见简介表与行程分项。`
        : ''),
    itinerary: sections.itinerary,
    snailTips: ensureSectionReadable(sections.snailTips, snailFallback),
    pitfalls: ensureSectionReadable(sections.pitfalls, pitfallsFallback),
    isLegacy: false,
  });
}

/** 规范化 + 补齐，供 done 下发 */
export function finalizeMapPlanContent(
  content: string,
  locationName: string,
  originName?: string | null,
  query?: string | null,
): string {
  let sanitized = scrubDestinationDriftInPlan(content.trim(), locationName);
  if (originName?.trim()) {
    sanitized = scrubOriginDriftInPlan(sanitized, originName.trim());
  }
  if (!sanitized) {
    return '';
  }
  if (query?.trim()) {
    sanitized = enforcePlanDayCountOnContent(sanitized, query.trim(), locationName);
  }
  return padMissingMapPlanSections(canonicalizeMapPlanContent(sanitized), locationName);
}

/** 是否具备可展示的最小方案（有行程即可交付） */
export function isMapPlanDeliverable(content: string): boolean {
  return parsePlanSections(content).itinerary.trim().length >= 20;
}

export function getMultiStopNames(locationName: string): string[] {
  if (!locationName.includes('→')) {
    return [];
  }
  return locationName
    .split('→')
    .map((stop) => stop.trim())
    .filter(Boolean);
}

/** 多地联游：正文是否覆盖全部站点 */
export function isMultiStopItineraryComplete(content: string, locationName: string): boolean {
  const stops = getMultiStopNames(locationName);
  if (stops.length < 2) {
    return true;
  }
  const itinerary = parsePlanSections(content).itinerary;
  if (!itinerary.trim()) {
    return false;
  }
  return stops.every((stop) => {
    if (!itinerary.includes(stop)) {
      return false;
    }
    const stopIndex = itinerary.indexOf(stop);
    const context = itinerary.slice(Math.max(0, stopIndex - 40), stopIndex + 220);
    const hasStructure =
      /第\s*[\d一二三四五六七八九十]+\s*天/.test(context) || /#{1,3}\s/.test(context);
    const hasTransit = /地铁|公交|高铁|火车|动车|城际|打车|出租|大巴|BRT|站|🐌/.test(context);
    return hasStructure && hasTransit && context.trim().length >= 60;
  });
}

export function getMissingMultiStopNames(content: string, locationName: string): string[] {
  const stops = getMultiStopNames(locationName);
  if (stops.length < 2) {
    return [];
  }
  const itinerary = parsePlanSections(content).itinerary;
  return stops.filter((stop) => !itinerary.includes(stop));
}

export function buildMultiStopItineraryContinuePrompt(
  content: string,
  locationName: string,
  originName?: string | null,
): string {
  const missing = getMissingMultiStopNames(content, locationName);
  const stops = getMultiStopNames(locationName);
  const originLine = originName?.trim()
    ? `出发地必须是「${originName.trim()}」，第1天从家门口写起。`
    : '';

  return [
    '你上一版【行程流水账】漏写了用户要求的站点，需要补全。',
    `用户要求依次游玩：${stops.join(' → ')}，共 ${stops.length} 个目的地，缺一不可。`,
    missing.length > 0 ? `当前缺少这些站点的独立玩法：${missing.join('、')}。` : '',
    originLine,
    '请只重写【行程流水账】，按天写全每个站点，并保留已有【方案简介】不变。',
    '不要写蜗牛提示、避坑指南或开场白。',
  ]
    .filter(Boolean)
    .join('\n');
}

export function canonicalizeMapPlanContent(content: string): string {
  const trimmed = trimTruncatedInsightsTail(content.trim());
  const sections = parsePlanSections(trimmed);
  const intro =
    sections.intro.trim() ||
    (sections.itinerary.trim()
      ? '以下行程按你的预算与天数整理，花费见简介表与流水账分项。'
      : '');

  return serializePlanSections({
    intro,
    itinerary: sections.itinerary,
    snailTips: sections.snailTips,
    pitfalls: sections.pitfalls,
    isLegacy: false,
  });
}

/** 蜗牛提示 / 避坑是否仍需第二阶段或续写 */
export function needsMapPlanInsightsPhase(content: string): boolean {
  const sections = parsePlanSections(content);
  if (!sections.snailTips.trim() || !sections.pitfalls.trim()) {
    return true;
  }
  return (
    !isSectionBodyComplete(sections.snailTips, 12) ||
    !isSectionBodyComplete(sections.pitfalls, 12)
  );
}

export function isMapPlanContentComplete(content: string): boolean {
  const sections = parsePlanSections(content);

  if (!sections.itinerary.trim()) {
    return false;
  }
  if (!sections.snailTips.trim() || !sections.pitfalls.trim()) {
    return false;
  }

  if (sections.intro.trim() && !isSectionBodyComplete(sections.intro, 12)) {
    return false;
  }
  if (!isSectionBodyComplete(sections.itinerary, 24)) {
    return false;
  }
  if (!isSectionBodyComplete(sections.snailTips, 14)) {
    return false;
  }
  if (!isSectionBodyComplete(sections.pitfalls, 14)) {
    return false;
  }

  return true;
}

export function findFirstIncompletePlanSection(
  content: string,
): keyof typeof PLAN_SECTION_MARKERS | null {
  const sections = parsePlanSections(content);
  const checks: { key: keyof typeof PLAN_SECTION_MARKERS; body: string; min: number }[] = [
    { key: 'intro', body: sections.intro, min: 12 },
    { key: 'itinerary', body: sections.itinerary, min: 24 },
    { key: 'snailTips', body: sections.snailTips, min: 14 },
    { key: 'pitfalls', body: sections.pitfalls, min: 14 },
  ];

  for (const { key, body, min } of checks) {
    if (!isSectionBodyComplete(body, min)) {
      return key;
    }
  }
  return null;
}

export function buildInsightsContinuePrompt(content: string): string {
  const incomplete = findFirstIncompletePlanSection(content);
  const tail = content.trimEnd().slice(-220);
  const sectionLabel = incomplete
    ? PLAN_SECTION_MARKERS[incomplete]
    : PLAN_SECTION_MARKERS.pitfalls;

  return [
    '你上一版穷游方案未写完，用户需要完整方案。',
    `请补全并只输出从「${sectionLabel}」开始到结尾的内容（若该段已有部分内容，从断点接着写）。`,
    tail ? `断点末尾：「${tail}」` : '',
    '必须包含且写完整：【蜗牛提示】至少 2 句；【避坑指南】至少 2 句并以句号收尾。',
    '不要重复【方案简介】【行程流水账】已写内容，不要写开场白。',
  ]
    .filter(Boolean)
    .join('\n');
}

export function trimTruncatedInsightsTail(content: string): string {
  const sections = parsePlanSections(content);
  const trimSection = (body: string): string => {
    if (!body || !isTextTailTruncated(body)) {
      return body;
    }
    const lastEnd = Math.max(
      body.lastIndexOf('。'),
      body.lastIndexOf('！'),
      body.lastIndexOf('？'),
    );
    return lastEnd >= 0 ? body.slice(0, lastEnd + 1) : '';
  };

  return [
    sections.intro ? `${PLAN_SECTION_MARKERS.intro}\n\n${sections.intro}` : '',
    sections.itinerary
      ? `${PLAN_SECTION_MARKERS.itinerary}\n\n${trimSection(sections.itinerary)}`
      : '',
    sections.snailTips
      ? `${PLAN_SECTION_MARKERS.snailTips}\n\n${trimSection(sections.snailTips)}`
      : '',
    sections.pitfalls
      ? `${PLAN_SECTION_MARKERS.pitfalls}\n\n${trimSection(sections.pitfalls)}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function mergeInsightsContinuation(base: string, continuation: string): string {
  const trimmedBase = trimTruncatedInsightsTail(base.trim());
  const trimmedContinue = continuation.trim();
  if (!trimmedContinue) {
    return trimmedBase;
  }

  const baseSections = parsePlanSections(trimmedBase);
  const hasSectionMarkers = Object.values(PLAN_SECTION_MARKERS).some((marker) =>
    trimmedContinue.includes(marker),
  );

  const continueSections = parsePlanSections(trimmedContinue);

  const merged = {
    intro: baseSections.intro || continueSections.intro,
    itinerary: baseSections.itinerary || continueSections.itinerary,
    snailTips: [baseSections.snailTips, continueSections.snailTips].filter(Boolean).join('\n\n'),
    pitfalls: [baseSections.pitfalls, continueSections.pitfalls].filter(Boolean).join('\n\n'),
    isLegacy: false,
  };

  if (!hasSectionMarkers) {
    const target = findFirstIncompletePlanSection(trimmedBase) ?? 'pitfalls';
    const existing = merged[target];
    merged[target] = [existing, trimmedContinue].filter(Boolean).join('\n\n');
  }

  if (continueSections.itinerary && baseSections.itinerary) {
    merged.itinerary = `${baseSections.itinerary}\n\n${continueSections.itinerary}`;
  }
  if (continueSections.intro && !baseSections.intro) {
    merged.intro = continueSections.intro;
  }

  return [
    merged.intro ? `${PLAN_SECTION_MARKERS.intro}\n\n${merged.intro}` : '',
    merged.itinerary ? `${PLAN_SECTION_MARKERS.itinerary}\n\n${merged.itinerary}` : '',
    merged.snailTips ? `${PLAN_SECTION_MARKERS.snailTips}\n\n${merged.snailTips}` : '',
    merged.pitfalls ? `${PLAN_SECTION_MARKERS.pitfalls}\n\n${merged.pitfalls}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export type MapPlanCompleterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type MapPlanCompleter = (input: {
  messages: MapPlanCompleterMessage[];
  temperature?: number;
  maxTokens?: number;
}) => Promise<string>;

export async function ensureCompleteMapPlanContent(
  baseMessages: MapPlanCompleterMessage[],
  completer: MapPlanCompleter,
  initialContent: string,
): Promise<string> {
  let content = initialContent.trim();

  for (let attempt = 0; attempt < MAP_PLAN_FINALIZE_MAX_ATTEMPTS; attempt += 1) {
    if (isMapPlanContentComplete(content)) {
      break;
    }

    const continuation = await completer({
      messages: [
        ...baseMessages,
        { role: 'assistant', content },
        { role: 'user', content: buildInsightsContinuePrompt(content) },
      ],
      temperature: 0.5,
      maxTokens: MAP_PLAN_INSIGHTS_CONTINUE_MAX_TOKENS,
    });

    content = mergeInsightsContinuation(content, continuation);
  }

  return content;
}

/** @deprecated 仅测试兼容 */
export function isMapPlanSnailInsightsComplete(content: string): boolean {
  return isMapPlanContentComplete(content);
}
