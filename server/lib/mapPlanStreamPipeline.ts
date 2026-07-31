import {
  buildInsightsContinuePrompt,
  buildMultiStopItineraryContinuePrompt,
  finalizeMapPlanContent,
  getMultiStopNames,
  isMapPlanContentComplete,
  isMultiStopItineraryComplete,
  mergeInsightsContinuation,
  trimTruncatedInsightsTail,
  type MapPlanCompleterMessage,
} from '@/lib/plan/mapPlanCompleteness';
import { mergePlanPhases } from '@/lib/plan/mergePlanPhases';
import {
  parsePlanSections,
  serializePlanSections,
} from '@/lib/plan/parsePlanSections';
import {
  buildMapPlanDaySystemPrompt,
  buildMapPlanDayUserPrompt,
  buildMapPlanIntroSystemPrompt,
  buildMapPlanIntroUserPrompt,
  buildMapPlanPhase1SystemPrompt,
  buildMapPlanPhase1UserPrompt,
  buildMapPlanPhase2SystemPrompt,
  buildMapPlanPhase2UserPrompt,
} from '@/lib/plan/mapPlanPhasePrompts';
import { buildMultiStopDayAssignments, type MultiStopDayAssignment } from '@/lib/map/multiStopDayAssignments';
import { resolveEffectivePlanDays } from '@/lib/plan/planDayConstraint';
import {
  MAP_PLAN_DAY_BY_DAY_MIN_DAYS,
  MAP_PLAN_DAY_MAX_TOKENS,
  MAP_PLAN_INSIGHTS_CONTINUE_MAX_TOKENS,
  MAP_PLAN_INTRO_MAX_TOKENS,
  MAP_PLAN_MAX_CONTINUE_ATTEMPTS,
  MAP_PLAN_PHASE1_MAX_TOKENS,
  MAP_PLAN_PHASE2_MAX_TOKENS,
  MAP_PLAN_SINGLE_STREAM_MAX_TOKENS,
} from '@/lib/plan/mapPlanGenerationLimits';
import {
  buildMapPlanSystemPrompt,
  buildMapPlanUserPrompt,
} from '@/services/ai/prompts/mapPlanGeneration';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import { createServerDeepSeekCompleter, type ServerEnv } from './deepseekServer';
import { streamDeepSeekChatCompletion } from './deepseekStreamServer';

export type StreamPlanContext = {
  env: ServerEnv;
  locationName: string;
  query: string;
  lng: number;
  lat: number;
  originName?: string | null;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  /** 阶段结束或续写后推送全文，客户端覆盖累积（防截断尾巴） */
  onSync?: (text: string) => void;
  onStatus?: (message: string) => void;
};

function emitStatus(ctx: StreamPlanContext, message: string): void {
  if (!ctx.signal?.aborted) {
    ctx.onStatus?.(message);
  }
}

async function streamToClient(
  ctx: StreamPlanContext,
  messages: MapPlanCompleterMessage[],
  maxTokens: number,
  onAccumulated: (text: string) => void,
): Promise<void> {
  await streamDeepSeekChatCompletion({
    env: ctx.env,
    messages,
    temperature: 0.55,
    maxTokens,
    signal: ctx.signal,
    onDelta: (text) => {
      onAccumulated(text);
      ctx.onDelta(text);
    },
  });
}

async function repairMultiStopItineraryOnce(
  ctx: StreamPlanContext,
  baseMessages: MapPlanCompleterMessage[],
  text: string,
): Promise<string> {
  const completer = createServerDeepSeekCompleter(ctx.env);
  if (!completer || ctx.signal?.aborted) {
    return text;
  }

  emitStatus(ctx, '正在补全遗漏站点…');

  const continuation = await completer({
    messages: [
      ...baseMessages,
      { role: 'assistant', content: text },
      {
        role: 'user',
        content: buildMultiStopItineraryContinuePrompt(text, ctx.locationName, ctx.originName),
      },
    ],
    temperature: 0.45,
    maxTokens: MAP_PLAN_PHASE1_MAX_TOKENS,
    jsonMode: false,
  });

  if (!continuation.trim() || ctx.signal?.aborted) {
    return text;
  }

  const sections = parsePlanSections(text);
  const continuedSections = parsePlanSections(continuation);
  const merged = serializePlanSections({
    intro: sections.intro.trim() ? sections.intro : continuedSections.intro,
    itinerary: continuedSections.itinerary.trim() || sections.itinerary,
    snailTips: sections.snailTips,
    pitfalls: sections.pitfalls,
    isLegacy: false,
  });

  if (!ctx.signal?.aborted) {
    ctx.onDelta(continuation);
    ctx.onSync?.(sanitizePlanContentForDisplay(merged.trim()));
  }
  return merged;
}

/** 多地联游 / 指定天数单城：简介 + 逐天行程，避免 AI 一次写出过多天数 */
async function generateDayByDayPhase1(
  ctx: StreamPlanContext,
  dayAssignments: MultiStopDayAssignment[],
): Promise<string> {
  emitStatus(ctx, '正在撰写方案简介…');
  let introBody = '';
  const introMessages: MapPlanCompleterMessage[] = [
    { role: 'system', content: buildMapPlanIntroSystemPrompt() },
    {
      role: 'user',
      content: buildMapPlanIntroUserPrompt(ctx.locationName, ctx.query, ctx.originName),
    },
  ];
  await streamToClient(ctx, introMessages, MAP_PLAN_INTRO_MAX_TOKENS, (chunk) => {
    introBody += chunk;
  });

  if (ctx.signal?.aborted) {
    return introBody;
  }

  const introParsed = parsePlanSections(introBody);
  const daySections: string[] = [];

  for (const assignment of dayAssignments) {
    if (ctx.signal?.aborted) {
      break;
    }
    const { dayNumber, stopName, previousStop, isDepthDay } = assignment;
    emitStatus(ctx, `正在规划第${dayNumber}天 · ${stopName}…`);

    let dayBody = '';
    const dayMessages: MapPlanCompleterMessage[] = [
      { role: 'system', content: buildMapPlanDaySystemPrompt() },
      {
        role: 'user',
        content: buildMapPlanDayUserPrompt({
          locationName: ctx.locationName,
          query: ctx.query,
          dayNumber,
          stopName,
          totalDays: dayAssignments.length,
          originName: ctx.originName,
          previousStop,
          isDepthDay,
        }),
      },
    ];
    await streamToClient(ctx, dayMessages, MAP_PLAN_DAY_MAX_TOKENS, (chunk) => {
      dayBody += chunk;
    });

    const dayParsed = parsePlanSections(dayBody);
    const dayContent = dayParsed.itinerary.trim() || dayBody.trim();
    if (dayContent) {
      daySections.push(dayContent);
    }

    const partial = serializePlanSections({
      intro: introParsed.intro,
      itinerary: daySections.join('\n\n'),
      snailTips: '',
      pitfalls: '',
      isLegacy: false,
    });
    ctx.onSync?.(sanitizePlanContentForDisplay(partial.trim()));
  }

  return serializePlanSections({
    intro: introParsed.intro,
    itinerary: daySections.join('\n\n'),
    snailTips: '',
    pitfalls: '',
    isLegacy: false,
  });
}

/** 多地联游：简介 + 逐天行程，避免长行程被 token 截断 */
async function generateMultiStopPhase1(ctx: StreamPlanContext): Promise<string> {
  const stops = getMultiStopNames(ctx.locationName);
  if (stops.length < 2) {
    return '';
  }

  const totalDays = resolveEffectivePlanDays(ctx.query, ctx.locationName) ?? stops.length;
  const dayAssignments = buildMultiStopDayAssignments(stops, totalDays);
  return generateDayByDayPhase1(ctx, dayAssignments);
}

/** 单城指定天数：逐天生成，防止一次输出 12 天 */
async function generateFixedDayCountPhase1(
  ctx: StreamPlanContext,
  totalDays: number,
): Promise<string> {
  const stopName = ctx.locationName.trim() || '目的地';
  const dayAssignments: MultiStopDayAssignment[] = Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    return {
      dayNumber,
      stopName,
      previousStop: dayNumber > 1 ? stopName : null,
      isDepthDay: dayNumber > 1,
    };
  });
  return generateDayByDayPhase1(ctx, dayAssignments);
}

async function repairOnce(
  ctx: StreamPlanContext,
  baseMessages: MapPlanCompleterMessage[],
  text: string,
): Promise<string> {
  const completer = createServerDeepSeekCompleter(ctx.env);
  if (!completer || ctx.signal?.aborted) {
    return text;
  }

  emitStatus(ctx, '正在补全蜗牛提示与避坑…');

  const continuation = await completer({
    messages: [
      ...baseMessages,
      { role: 'assistant', content: text },
      { role: 'user', content: buildInsightsContinuePrompt(text) },
    ],
    temperature: 0.5,
    maxTokens: MAP_PLAN_INSIGHTS_CONTINUE_MAX_TOKENS,
    jsonMode: false,
  });

  const merged = mergeInsightsContinuation(text, continuation);
  if (continuation.trim() && !ctx.signal?.aborted) {
    ctx.onDelta(continuation);
  }
  return merged;
}

/**
 * 短途单城：一次四段流式（更快结束）。
 * 多站/超长天：两阶段（行程 → 蜗牛提示）防截断。
 */
export async function generateCompleteMapPlanStream(ctx: StreamPlanContext): Promise<string> {
  const isMultiStop = ctx.locationName.includes('→');
  const fixedDayCount = !isMultiStop ? resolveEffectivePlanDays(ctx.query, ctx.locationName) : null;
  const useSingleShot =
    !isMultiStop && (fixedDayCount == null || fixedDayCount < MAP_PLAN_DAY_BY_DAY_MIN_DAYS);

  if (useSingleShot) {
    emitStatus(ctx, '正在生成完整方案…');
    let fullText = '';
    const singleMessages: MapPlanCompleterMessage[] = [
      { role: 'system', content: buildMapPlanSystemPrompt() },
      {
        role: 'user',
        content: buildMapPlanUserPrompt(
          ctx.locationName,
          ctx.query,
          { lng: ctx.lng, lat: ctx.lat },
          ctx.originName,
        ),
      },
    ];
    await streamToClient(ctx, singleMessages, MAP_PLAN_SINGLE_STREAM_MAX_TOKENS, (chunk) => {
      fullText += chunk;
    });

    if (ctx.signal?.aborted) {
      return finalizeMapPlanContent(
        sanitizePlanContentForDisplay(fullText.trim()),
        ctx.locationName,
        ctx.originName,
        ctx.query,
      );
    }

    let working = trimTruncatedInsightsTail(sanitizePlanContentForDisplay(fullText.trim()));
    ctx.onSync?.(working);

    // 整段缺失时最多补一次；否则本地 finalize 兜底
    for (
      let attempt = 0;
      attempt < MAP_PLAN_MAX_CONTINUE_ATTEMPTS && !ctx.signal?.aborted;
      attempt += 1
    ) {
      const sections = parsePlanSections(working);
      const insightsMissing = !sections.snailTips.trim() || !sections.pitfalls.trim();
      if (!insightsMissing || isMapPlanContentComplete(working)) {
        break;
      }
      emitStatus(ctx, '正在补全蜗牛提示与避坑…');
      working = await repairOnce(ctx, singleMessages, working);
      working = trimTruncatedInsightsTail(sanitizePlanContentForDisplay(working.trim()));
      ctx.onSync?.(working);
    }

    return finalizeMapPlanContent(working, ctx.locationName, ctx.originName, ctx.query);
  }

  let fullText = '';
  const phase1Messages: MapPlanCompleterMessage[] = [
    { role: 'system', content: buildMapPlanPhase1SystemPrompt() },
    {
      role: 'user',
      content: buildMapPlanPhase1UserPrompt(
        ctx.locationName,
        ctx.query,
        { lng: ctx.lng, lat: ctx.lat },
        ctx.originName,
      ),
    },
  ];

  if (isMultiStop) {
    fullText = await generateMultiStopPhase1(ctx);
  } else {
    fullText = await generateFixedDayCountPhase1(ctx, fixedDayCount!);
  }

  if (ctx.signal?.aborted) {
    return finalizeMapPlanContent(
      sanitizePlanContentForDisplay(fullText.trim()),
      ctx.locationName,
      ctx.originName,
      ctx.query,
    );
  }

  if (!isMultiStopItineraryComplete(fullText, ctx.locationName)) {
    fullText = await repairMultiStopItineraryOnce(ctx, phase1Messages, fullText);
    fullText = sanitizePlanContentForDisplay(fullText.trim());
  }

  emitStatus(ctx, '行程已就绪，正在补充蜗牛提示…');

  const phase2Messages: MapPlanCompleterMessage[] = [
    { role: 'system', content: buildMapPlanPhase2SystemPrompt() },
    {
      role: 'user',
      content: buildMapPlanPhase2UserPrompt(ctx.locationName, ctx.query, fullText),
    },
  ];

  let phase2 = '';
  await streamToClient(ctx, phase2Messages, MAP_PLAN_PHASE2_MAX_TOKENS, (chunk) => {
    phase2 += chunk;
  });

  fullText = mergePlanPhases(fullText, phase2);
  let working = trimTruncatedInsightsTail(sanitizePlanContentForDisplay(fullText.trim()));
  ctx.onSync?.(working);

  for (
    let attempt = 0;
    attempt < MAP_PLAN_MAX_CONTINUE_ATTEMPTS && !ctx.signal?.aborted;
    attempt += 1
  ) {
    const sections = parsePlanSections(working);
    const insightsMissing = !sections.snailTips.trim() || !sections.pitfalls.trim();
    if (!insightsMissing || isMapPlanContentComplete(working)) {
      break;
    }
    working = await repairOnce(ctx, phase1Messages, working);
    working = trimTruncatedInsightsTail(sanitizePlanContentForDisplay(working.trim()));
    ctx.onSync?.(working);
  }

  return finalizeMapPlanContent(working, ctx.locationName, ctx.originName, ctx.query);
}
