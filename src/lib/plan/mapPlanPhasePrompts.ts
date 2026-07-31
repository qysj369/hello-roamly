import {
  buildCrossCityDay1LocalTransitHint,
  buildCrossCityDoorToDoorHint,
  buildDoorToDoorSegmentRules,
  buildInterStopTransitHint,
  buildItinerarySegmentOutputTemplate,
  buildMultiStopDoorToDoorChain,
  buildStrictDestinationConstraint,
  buildStrictOriginConstraint,
} from '@/lib/plan/doorToDoorTransit';
import { getMultiStopNames } from '@/lib/plan/mapPlanCompleteness';
import { buildMultiStopDayStructure } from '@/lib/map/resolveMapPlanContext';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import {
  buildThemeStandards,
  buildTransportModeStandards,
} from '@/lib/map/travelTransportModes';
import {
  buildStrictDayCountConstraint,
  resolveEffectivePlanDays,
} from '@/lib/plan/planDayConstraint';
import { PLAN_SECTION_MARKERS } from '@/lib/plan/parsePlanSections';

/** 自驾模式输出标准 */
export function buildSelfDriveStandards(): string {
  return [
    '【自驾模式】全程以自驾为主，禁止默认高铁/火车/飞机。',
    '须写：高速/国道路线、里程、过路费、油费估算、停车点与限行提示。',
    '第1天从出发地开车出发；站间写自驾路线与预计耗时；末站可安排深度游与自驾返程。',
  ].join('\n');
}

function resolveMultiStopDayCount(locationName: string, query: string): number | undefined {
  const stops = locationName.includes('→')
    ? locationName.split('→').map((stop) => stop.trim()).filter(Boolean)
    : [];
  if (stops.length < 2) {
    return undefined;
  }
  const intent = parseTravelSearchIntent(query);
  return Math.max(intent.days ?? 0, stops.length);
}

function buildSelfDriveLegHint(params: {
  dayNumber: number;
  stopName: string;
  fromLabel: string;
  isFirstDay: boolean;
}): string {
  const { dayNumber, stopName, fromLabel, isFirstDay } = params;
  if (isFirstDay) {
    return `第${dayNumber}天自驾：从${fromLabel}出发→${stopName}，写高速/国道、里程、过路费、油费、停车点，再写${stopName}玩法与住宿。`;
  }
  return `第${dayNumber}天自驾转场：${fromLabel}→${stopName}，写自驾路线、耗时、过路费与停车，再写${stopName}玩法。`;
}

const STYLE = `文风：幽默口语、信息真实可用，偶尔 🐌，禁止坐标与机器开场白。`;

/** 专业旅行顾问输出标准（对标面面俱到） */
export function buildProfessionalAdvisorStandards(): string {
  return [
    '【专业顾问标准】每一程须无缝衔接，像真人顾问一样面面俱到：',
    '1. 交通：家门口→出发站→大交通→抵达站→住宿/景点，每段写地铁/公交/出租车三方案 + 🐌落地最佳，禁止跳段。',
    '2. 住宿：推荐具体区域/商圈（近地铁/近景点），含大致价位与取舍理由。',
    '3. 餐饮：早/午/晚各至少1个具体选择（店名或街区），含人均参考价。',
    '4. 门票：主流景点票价、预约/闭馆提示、学生/联票优惠。',
    '5. 花费：分项可加总，与简介表一致；注明大交通/市内/餐饮/门票/住宿。',
    '6. 备选：雨天/误车/排队时的Plan B（替代交通或室内方案）。',
    '7. 中国复杂行程：跨省市须写清具体车站/车次类型/换乘站，禁止模糊「坐车去」。',
  ].join('\n');
}

/** 第一阶段：只生成简介 + 行程，为蜗牛提示/避坑预留 token */
export function buildMapPlanPhase1SystemPrompt(): string {
  return `你是 hello-roamly 专业穷游规划师。${STYLE}

${buildProfessionalAdvisorStandards()}

本回合**只输出两个区块**（不要写蜗牛提示、不要写避坑指南）：
${PLAN_SECTION_MARKERS.intro}
${PLAN_SECTION_MARKERS.itinerary}

规则：
- 【方案简介】2–3 句 + GFM 花费表（交通/餐饮/门票/住宿/总计，¥整数）。
- 【行程流水账】门到门写法：跨城须写「家门口→出发站」「大交通」「抵达站→住宿/首站」；每段市内衔接：${buildDoorToDoorSegmentRules(true)} 大城市公交须写到具体站名、换车站与第二路车号。
- 若用户需求含多个站点（如「曲阜→微山湖→台儿庄」），须按天分配：第1天在第1站、第2天转第2站……每段转场写全门到门，禁止只规划其中一个地方。
- 目的地名称必须与用户需求一致，不得替换为其他城市。
- ${buildItinerarySegmentOutputTemplate()}`;
}

export function buildMapPlanPhase2SystemPrompt(): string {
  return `你是 hello-roamly 专业穷游规划师。${STYLE}

本回合**只输出两个区块**（不要重复简介与行程）：
${PLAN_SECTION_MARKERS.snailTips}
${PLAN_SECTION_MARKERS.pitfalls}

规则：
- 【蜗牛提示】2–4 句，覆盖交通/美食/省钱，每句具体（店名/街区），以句号结尾。
- 【避坑指南】2–4 句，覆盖常见踩坑+金额+替代，**必须写完整**。`;
}

export function buildMapPlanPhase1UserPrompt(
  locationName: string,
  query: string,
  coords?: { lng: number; lat: number },
  originName?: string | null,
): string {
  const trimmed = query.trim();
  const intent = parseTravelSearchIntent(trimmed);
  const multiStopStructure = buildMultiStopDayStructure(
    locationName,
    resolveMultiStopDayCount(locationName, trimmed),
  );
  const coordinateLine = coords
    ? locationName.includes('→')
      ? `\n【内部定位参考，勿写入正文】地图锚点约 (${coords.lng.toFixed(4)}, ${coords.lat.toFixed(4)})，对应第一站；但须覆盖全部站点：${locationName}。`
      : `\n【内部定位参考，勿写入正文】锚点约 (${coords.lng.toFixed(4)}, ${coords.lat.toFixed(4)})，请围绕「${locationName}」规划。`
    : '';
  const multiStops = getMultiStopNames(locationName);
  const doorToDoorChain =
    multiStops.length >= 2
      ? buildMultiStopDoorToDoorChain(multiStops, originName)
      : originName?.trim()
        ? buildCrossCityDay1LocalTransitHint(originName, locationName.split('→')[0] ?? locationName)
        : '';
  const originLine = originName?.trim()
    ? `\n出发地（用户已校正，必须遵守）：${originName.trim()}。\n${buildStrictOriginConstraint(originName)}${doorToDoorChain ? `\n${doorToDoorChain}` : ''}\n第1天行程必须从「${originName.trim()}」门口写起，再写大交通抵达第一站，禁止省略出发地。`
    : doorToDoorChain
      ? `\n${doorToDoorChain}`
      : '';

  const destLock = buildStrictDestinationConstraint(locationName);
  const transportLine = `\n${buildTransportModeStandards(intent.transportMode)}`;
  const themeLine = buildThemeStandards(intent.preferences);
  const selfDriveLine = intent.selfDrive ? `\n${buildSelfDriveStandards()}` : '';
  const requestedDays = resolveEffectivePlanDays(trimmed, locationName);
  const dayLock = requestedDays ? `\n${buildStrictDayCountConstraint(requestedDays)}` : '';

  return `地点：${locationName}
需求：${trimmed}${originLine}
${multiStopStructure ? `${multiStopStructure}\n` : ''}${destLock}${dayLock}${transportLine}${themeLine ? `\n${themeLine}` : ''}${selfDriveLine}${coordinateLine}

本回合只输出【方案简介】与【行程流水账】，不要写蜗牛提示与避坑指南。`;
}

/** 多地联游：仅生成【方案简介】+ 花费表 */
export function buildMapPlanIntroSystemPrompt(): string {
  return `你是 hello-roamly 专业穷游规划师。${STYLE}

${buildProfessionalAdvisorStandards()}

本回合**只输出** ${PLAN_SECTION_MARKERS.intro}（2–3句 + GFM 花费表：交通/餐饮/门票/住宿/总计，¥整数）。
不要写行程流水账、蜗牛提示、避坑指南。`;
}

export function buildMapPlanIntroUserPrompt(
  locationName: string,
  query: string,
  originName?: string | null,
): string {
  const trimmed = query.trim();
  const intent = parseTravelSearchIntent(trimmed);
  const multiStopStructure = buildMultiStopDayStructure(
    locationName,
    resolveMultiStopDayCount(locationName, trimmed),
  );
  const originLine = originName?.trim() ? `\n出发地：${originName.trim()}（全程门到门从该地址写起）` : '';
  const transportLine = `\n${buildTransportModeStandards(intent.transportMode)}`;
  const themeLine = buildThemeStandards(intent.preferences);
  const selfDriveLine = intent.selfDrive ? `\n${buildSelfDriveStandards()}` : '';
  const requestedDays = resolveEffectivePlanDays(trimmed, locationName);
  const dayLock = requestedDays ? `\n${buildStrictDayCountConstraint(requestedDays)}` : '';
  return `联游路线：${locationName}
需求：${trimmed}${originLine}
${multiStopStructure ? `${multiStopStructure}\n` : ''}${buildStrictDestinationConstraint(locationName)}${dayLock}${transportLine}${themeLine ? `\n${themeLine}` : ''}${selfDriveLine}

只输出【方案简介】与花费表，行程由后续逐天生成。`;
}

/** 多地联游：单日行程（追加到【行程流水账】） */
export function buildMapPlanDaySystemPrompt(): string {
  return `你是 hello-roamly 专业穷游规划师。${STYLE}

${buildProfessionalAdvisorStandards()}

本回合**只输出** ${PLAN_SECTION_MARKERS.itinerary} 中「第N天」对应的一日内容（Markdown 小标题须含站名）。
不要重复【方案简介】，不要写蜗牛提示/避坑指南。
${buildItinerarySegmentOutputTemplate()}`;
}

export function buildMapPlanDayUserPrompt(params: {
  locationName: string;
  query: string;
  dayNumber: number;
  stopName: string;
  totalDays: number;
  originName?: string | null;
  previousStop?: string | null;
  isDepthDay?: boolean;
}): string {
  const { dayNumber, stopName, totalDays, originName, previousStop, locationName, query, isDepthDay } = params;
  const intent = parseTravelSearchIntent(query);
  const isFirstDay = dayNumber === 1;
  const fromLabel = isFirstDay ? (originName?.trim() ?? '用户出发地') : (previousStop ?? '上一站');

  let legHint = '';
  if (intent.selfDrive) {
    legHint = buildSelfDriveLegHint({ dayNumber, stopName, fromLabel, isFirstDay });
  } else if (isFirstDay && originName?.trim()) {
    legHint = buildCrossCityDoorToDoorHint(originName.trim(), stopName);
  } else if (!isFirstDay && previousStop && previousStop !== stopName) {
    legHint = buildInterStopTransitHint(previousStop, stopName, dayNumber);
  } else if (isFirstDay) {
    legHint = `第1天在「${stopName}」：写抵达后的车站→住宿→玩法，仍须门到门三方案。`;
  } else if (isDepthDay) {
    legHint = `第${dayNumber}天在「${stopName}」深度游/整理返程：写当地玩法、美食、备选交通，可与前一日衔接。`;
  }

  const transportLine = buildTransportModeStandards(intent.transportMode);
  const themeLine = buildThemeStandards(intent.preferences);

  return `联游路线：${locationName}（第${dayNumber}/${totalDays}天 · ${stopName}）
需求：${query.trim()}
${transportLine ? `\n${transportLine}` : ''}${themeLine ? `\n${themeLine}` : ''}
${legHint ? `\n${legHint}\n` : ''}
只写第${dayNumber}天「${stopName}」的完整一日（含转场/抵达/玩法/餐饮/住宿建议/分项花费），与前后天无缝衔接。`;
}

export function buildMapPlanPhase2UserPrompt(
  locationName: string,
  query: string,
  phase1Content: string,
): string {
  const trimmed = query.trim();
  const destLock = buildStrictDestinationConstraint(locationName);
  const multiStopStructure = buildMultiStopDayStructure(
    locationName,
    resolveMultiStopDayCount(locationName, trimmed),
  );
  const selfDriveLine = parseTravelSearchIntent(trimmed).selfDrive
    ? `\n${buildSelfDriveStandards()}`
    : '';
  const intent = parseTravelSearchIntent(trimmed);
  const transportLine = `\n${buildTransportModeStandards(intent.transportMode)}`;
  const themeLine = buildThemeStandards(intent.preferences);

  return `目的地：${locationName}
需求：${trimmed}
${multiStopStructure ? `${multiStopStructure}\n` : ''}${destLock}${transportLine}${themeLine ? `\n${themeLine}` : ''}${selfDriveLine}

以下是已生成的方案简介与行程流水账，请在此基础上**只补写**【蜗牛提示】与【避坑指南】两个区块，标题逐字使用，每段 2–4 句写完整：
${locationName.includes('→') ? '蜗牛提示与避坑指南须覆盖每个站点，不可只写第一站。' : ''}

---
${phase1Content.trim().slice(0, 2800)}
---`;
}
