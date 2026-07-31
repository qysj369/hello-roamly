/** 新版方案四段标题（生成与解析用） */
export const PLAN_SECTION_MARKERS = {
  intro: '【方案简介】',
  itinerary: '【行程流水账】',
  snailTips: '【蜗牛提示】',
  pitfalls: '【避坑指南】',
} as const;

const LEGACY_COST = '【花费清单】';
const LEGACY_INSIGHTS = '【蜗牛启示】';

export type ParsedPlanSections = {
  intro: string;
  itinerary: string;
  snailTips: string;
  pitfalls: string;
  /** 是否为旧版三卡（花费清单 + 蜗牛启示） */
  isLegacy: boolean;
};

function sliceBetween(
  content: string,
  startMarker: string,
  endMarkers: string[],
): string {
  const start = content.indexOf(startMarker);
  if (start < 0) {
    return '';
  }
  const bodyStart = start + startMarker.length;
  let end = content.length;
  for (const marker of endMarkers) {
    const index = content.indexOf(marker, bodyStart);
    if (index >= 0) {
      end = Math.min(end, index);
    }
  }
  return content.slice(bodyStart, end).trim();
}

function parseLegacyInsights(insights: string): { snailTips: string; pitfalls: string } {
  const pitfallsMatch = insights.match(
    /(?:\*\*)?(?:最后悔的事\s*\/\s*避坑指南|避坑指南)[**：:]*\s*([\s\S]*?)(?=(?:\*\*)?(?:最推荐|宝藏发现)|$)/,
  );
  const tipsMatch = insights.match(
    /(?:\*\*)?(?:最推荐的事\s*\/\s*宝藏发现|宝藏发现|最推荐)[**：:]*\s*([\s\S]*)/,
  );

  return {
    pitfalls: pitfallsMatch?.[1]?.trim() ?? '',
    snailTips: tipsMatch?.[1]?.trim() ?? '',
  };
}

function hasNewFormat(content: string): boolean {
  return (
    content.includes(PLAN_SECTION_MARKERS.intro) ||
    content.includes(PLAN_SECTION_MARKERS.snailTips) ||
    content.includes(PLAN_SECTION_MARKERS.pitfalls)
  );
}

/** 将 AI Markdown 方案解析为：简介 + 行程 + 蜗牛提示 + 避坑（兼容旧版） */
export function parsePlanSections(content: string): ParsedPlanSections {
  const trimmed = content.trim();
  if (!trimmed) {
    return { intro: '', itinerary: '', snailTips: '', pitfalls: '', isLegacy: false };
  }

  if (hasNewFormat(trimmed)) {
    const afterIntro = [
      PLAN_SECTION_MARKERS.itinerary,
      PLAN_SECTION_MARKERS.snailTips,
      PLAN_SECTION_MARKERS.pitfalls,
    ];
    const afterItinerary = [PLAN_SECTION_MARKERS.snailTips, PLAN_SECTION_MARKERS.pitfalls];
    const afterTips = [PLAN_SECTION_MARKERS.pitfalls];

    const intro = sliceBetween(trimmed, PLAN_SECTION_MARKERS.intro, afterIntro);
    const itinerary = sliceBetween(trimmed, PLAN_SECTION_MARKERS.itinerary, afterItinerary);
    const snailTips = sliceBetween(trimmed, PLAN_SECTION_MARKERS.snailTips, afterTips);
    const pitfalls = sliceBetween(trimmed, PLAN_SECTION_MARKERS.pitfalls, []);

    return { intro, itinerary, snailTips, pitfalls, isLegacy: false };
  }

  const introFromCost = sliceBetween(trimmed, LEGACY_COST, [
    PLAN_SECTION_MARKERS.itinerary,
    LEGACY_INSIGHTS,
  ]);
  const itinerary = sliceBetween(trimmed, PLAN_SECTION_MARKERS.itinerary, [
    LEGACY_INSIGHTS,
    PLAN_SECTION_MARKERS.snailTips,
    PLAN_SECTION_MARKERS.pitfalls,
  ]);
  const insightsBody = sliceBetween(trimmed, LEGACY_INSIGHTS, []);
  const { snailTips, pitfalls } = parseLegacyInsights(insightsBody);

  return {
    intro: introFromCost,
    itinerary,
    snailTips,
    pitfalls,
    isLegacy: true,
  };
}

/** 拼回存储用 Markdown（新版标题） */
export function serializePlanSections(sections: ParsedPlanSections): string {
  const parts: string[] = [];
  if (sections.intro.trim()) {
    parts.push(`${PLAN_SECTION_MARKERS.intro}\n\n${sections.intro.trim()}`);
  }
  if (sections.itinerary.trim()) {
    parts.push(`${PLAN_SECTION_MARKERS.itinerary}\n\n${sections.itinerary.trim()}`);
  }
  if (sections.snailTips.trim()) {
    parts.push(`${PLAN_SECTION_MARKERS.snailTips}\n\n${sections.snailTips.trim()}`);
  }
  if (sections.pitfalls.trim()) {
    parts.push(`${PLAN_SECTION_MARKERS.pitfalls}\n\n${sections.pitfalls.trim()}`);
  }
  return parts.join('\n\n');
}
