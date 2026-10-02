import { answerTravelAsk } from '@/lib/agent/answerTravelAsk';
import { AGENT_TOPIC_REFUSAL, buildFreshPlanMessage } from '@/lib/agent/travelAgentCopy';
import { parseTravelAgentIntent } from '@/lib/agent/parseTravelAgentIntent';
import { applyKnowledgeRiskTip } from '@/lib/agent/cityTravelKnowledge';
import { classifyTravelVoiceIntent } from '@/lib/home/travelVoiceIntent';
import {
  addPlanSpotFromKnowledge,
  applyEasyWalkLocal,
  applyHolidayRerouteLocal,
  applyRainRerouteLocal,
  lowerSearchPlanBudget,
  partyFocusLabel,
  recalcSearchPlanLocalBudget,
  removePlanSpot,
  replacePlanFoodsFromKnowledge,
  resizeSearchPlanDays,
  switchSearchPlanPartyLocal,
} from '@/lib/agent/patchSearchPlanLocal';
import { recommendMatchingPlans, type MatchingPlanHint } from '@/lib/agent/recommendMatchingPlans';
import { describePlanFieldChanges, diffSearchPlanFields } from '@/lib/agent/travelAgentDiff';
import {
  applyMemoryToExtract,
  learnPreferenceFromEdit,
  rememberTravelPreference,
  resetTravelPreferenceMemory,
  type SessionPreferenceOverride,
} from '@/lib/agent/travelPreferenceMemory';
import type { TravelAgentToolName } from '@/lib/agent/travelAgentTools';
import { extractSearchParams, type SearchExtractParams } from '@/lib/home/extractSearchParams';
import { requestSearchPlanIncrement } from '@/lib/home/requestSearchPlanIncrement';
import { requestSearchStructuredPlan } from '@/lib/home/requestSearchStructuredPlan';
import {
  applySearchAskAnswer,
  getMissRequiredField,
  type SearchRequiredKey,
} from '@/lib/home/searchAskRequired';
import { toSearchPlanRequest } from '@/lib/home/searchStructuredPlanParse';
import type { SearchPlanIncrementFocus, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type TravelAgentTurnResult =
  | {
      kind: 'plan';
      plan: SearchStructuredPlan;
      message: string;
      patch: boolean;
      recommended: MatchingPlanHint[];
      changedFields: string[];
      skipLongTerm?: boolean;
    }
  | { kind: 'tool'; tool: TravelAgentToolName; message: string }
  | { kind: 'ask'; message: string }
  | { kind: 'rollback'; message: string }
  | { kind: 'reset_preference'; message: string }
  | { kind: 'need_fields'; message: string; params: SearchExtractParams; missing: SearchRequiredKey[] }
  | { kind: 'error'; message: string };

function mergeExtract(base: SearchExtractParams | null, text: string): SearchExtractParams {
  const incoming = extractSearchParams(text);
  const merged: SearchExtractParams = {
    startCity: incoming.startCity ?? base?.startCity,
    targetCity: incoming.targetCity ?? base?.targetCity,
    days: incoming.days ?? base?.days,
    peopleType: incoming.peopleType ?? base?.peopleType,
    budget: incoming.budget ?? base?.budget,
    theme: incoming.theme ?? base?.theme,
  };
  if (!merged.peopleType) {
    const asAnswer = applySearchAskAnswer(merged, 'peopleType', text);
    if (asAnswer?.peopleType) return asAnswer;
  }
  if (!merged.targetCity) {
    const asAnswer = applySearchAskAnswer(merged, 'targetCity', text);
    if (asAnswer?.targetCity) return asAnswer;
  }
  if (merged.days == null) {
    const asAnswer = applySearchAskAnswer(merged, 'days', text);
    if (asAnswer?.days != null) return asAnswer;
  }
  return merged;
}

function needFieldsMessage(missing: SearchRequiredKey[]): string {
  if (missing[0] === 'targetCity') return '还差目的地。你打算去哪座城慢慢逛？';
  if (missing[0] === 'days') return '计划玩几天？说一个 1～14 的数字就行。';
  return '想和谁一起？好友结伴 / 情侣 / 亲子 / 单人。';
}

function finishPlan(
  prev: SearchStructuredPlan | null,
  plan: SearchStructuredPlan,
  message: string,
  patch: boolean,
  skipLongTerm?: boolean,
): TravelAgentTurnResult {
  const next = applyKnowledgeRiskTip(plan);
  rememberTravelPreference(next, { skipLongTerm });
  const changedFields = diffSearchPlanFields(prev, next);
  return {
    kind: 'plan',
    plan: next,
    patch,
    recommended: recommendMatchingPlans(next),
    changedFields,
    skipLongTerm,
    message: patch
      ? `${message.replace(/[。．.]+$/, '')}。${changedFields.length ? describePlanFieldChanges(changedFields) : ''}`.replace(/。$/, '。')
      : message,
  };
}

async function generateFromExtract(
  params: SearchExtractParams,
  override?: SessionPreferenceOverride | null,
  prev: SearchStructuredPlan | null = null,
): Promise<TravelAgentTurnResult> {
  const withMemory = applyMemoryToExtract(params, override);
  const missing = getMissRequiredField(withMemory);
  if (missing.length > 0) {
    return {
      kind: 'need_fields',
      params: withMemory,
      missing,
      message: needFieldsMessage(missing),
    };
  }
  const request = toSearchPlanRequest(withMemory);
  if (!request) {
    return { kind: 'error', message: '还缺城市、天数或同行人群，补一句即可。' };
  }
  const result = await requestSearchStructuredPlan(request);
  if (!result.ok) {
    return { kind: 'error', message: result.error };
  }
  return finishPlan(
    prev,
    result.plan,
    buildFreshPlanMessage(result.plan),
    false,
    Boolean(override?.peopleType || override?.theme),
  );
}

async function incrementPlan(
  plan: SearchStructuredPlan,
  focus: SearchPlanIncrementFocus,
  fallbackMessage: string,
): Promise<TravelAgentTurnResult> {
  if (focus === 'foods') {
    const local = replacePlanFoodsFromKnowledge(plan);
    if (local) {
      learnPreferenceFromEdit('foods');
      return finishPlan(plan, local, '已按本地招牌换了餐饮点位，景点与预算未动。', true);
    }
  }
  const result = await requestSearchPlanIncrement(plan, focus);
  if (!result.ok) {
    return { kind: 'error', message: result.error || fallbackMessage };
  }
  learnPreferenceFromEdit(focus === 'spots' ? 'spots' : focus === 'foods' ? 'foods' : 'traffic');
  return finishPlan(plan, result.plan, fallbackMessage, true);
}

export async function runTravelAgentTurn(input: {
  text: string;
  plan: SearchStructuredPlan | null;
  pendingExtract?: SearchExtractParams | null;
  override?: SessionPreferenceOverride | null;
}): Promise<TravelAgentTurnResult> {
  const text = input.text.trim();
  if (!text) {
    return { kind: 'ask', message: '说一句就行，例如「杭州3天亲子」。' };
  }

  if (input.pendingExtract && getMissRequiredField(input.pendingExtract).length > 0) {
    return generateFromExtract(mergeExtract(input.pendingExtract, text), input.override, input.plan);
  }

  const intent = parseTravelAgentIntent(text, Boolean(input.plan));
  const voiceIntent = classifyTravelVoiceIntent(text);
  if (
    voiceIntent === 'reject' &&
    (intent.type === 'ask' || intent.type === 'generate') &&
    !input.plan
  ) {
    return { kind: 'ask', message: AGENT_TOPIC_REFUSAL };
  }
  if (voiceIntent === 'reject' && intent.type === 'ask' && input.plan) {
    return { kind: 'ask', message: AGENT_TOPIC_REFUSAL };
  }

  if (intent.type === 'rollback') return { kind: 'rollback', message: '正在回退到上一版行程…' };
  if (intent.type === 'reset_preference') {
    resetTravelPreferenceMemory();
    return { kind: 'reset_preference', message: '已清空账号长期偏好，下一份行程不再套用旧习惯。' };
  }
  if (intent.type === 'save') return { kind: 'tool', tool: 'save', message: '正在保存行程…' };
  if (intent.type === 'poster') return { kind: 'tool', tool: 'poster', message: '正在生成分享海报…' };
  if (intent.type === 'copy_link') return { kind: 'tool', tool: 'copy_link', message: '正在复制分享链接…' };
  if (intent.type === 'copy_share') return { kind: 'tool', tool: 'copy_share', message: '正在复制种草文案…' };
  if (intent.type === 'share') return { kind: 'tool', tool: 'share', message: '正在打开分享…' };

  if (intent.type === 'edit_budget') {
    if (!input.plan) {
      return { kind: 'ask', message: '还没有行程。先说「上海3天好友结伴」生成一份。' };
    }
    const next =
      intent.mode === 'down' ? lowerSearchPlanBudget(input.plan) : recalcSearchPlanLocalBudget(input.plan);
    learnPreferenceFromEdit('budget');
    return finishPlan(
      input.plan,
      next,
      intent.mode === 'down'
        ? '已下调餐饮/门票/住宿档位，动线没改。还可以说「重新核算预算」。'
        : '已按本地消费区间重算市内预算，往返大交通仍只提示。',
      true,
    );
  }

  if (intent.type === 'edit_days' && input.plan) {
    const targetDays =
      intent.days ?? Math.max(1, Math.min(14, input.plan.baseInfo.days + (intent.delta ?? 0)));
    const local = resizeSearchPlanDays(input.plan, targetDays);
    if (local) {
      learnPreferenceFromEdit('days');
      return finishPlan(input.plan, local, `已改成${local.baseInfo.days}天，只动天数和受影响的返程日。`, true);
    }
    return generateFromExtract(
      {
        startCity: input.plan.baseInfo.startCity,
        targetCity: input.plan.baseInfo.targetCity,
        days: targetDays,
        peopleType: input.plan.baseInfo.peopleType,
        budget: input.plan.baseInfo.budget ?? undefined,
        theme: input.plan.baseInfo.theme ?? undefined,
      },
      input.override,
      input.plan,
    );
  }

  if (intent.type === 'edit_party') {
    if (!input.plan) return generateFromExtract(mergeExtract(null, text), input.override);
    const local = switchSearchPlanPartyLocal(input.plan, intent.peopleType);
    if (local) {
      if (!intent.temporary) learnPreferenceFromEdit('party');
      return finishPlan(
        input.plan,
        local,
        intent.temporary
          ? `这次先按${intent.peopleType}排，${partyFocusLabel(intent.peopleType)}，不改长期偏好。`
          : `已改成${intent.peopleType}，侧重点换成${partyFocusLabel(intent.peopleType)}，没有整页重绘。`,
        true,
        intent.temporary,
      );
    }
    return generateFromExtract(
      {
        startCity: input.plan.baseInfo.startCity,
        targetCity: input.plan.baseInfo.targetCity,
        days: input.plan.baseInfo.days,
        peopleType: intent.peopleType,
        budget: input.plan.baseInfo.budget ?? undefined,
        theme: input.plan.baseInfo.theme ?? undefined,
      },
      intent.temporary ? { peopleType: intent.peopleType } : input.override,
      input.plan,
    );
  }

  if (intent.type === 'edit_foods' && input.plan) {
    return incrementPlan(input.plan, 'foods', '已按本地招牌调整餐饮。');
  }
  if (intent.type === 'edit_spots' && input.plan) {
    if (intent.action === 'remove' && intent.name) {
      const local = removePlanSpot(input.plan, intent.name, intent.day);
      if (local) {
        learnPreferenceFromEdit('spots');
        return finishPlan(input.plan, local, `已去掉「${intent.name}」，其余日期未动。`, true);
      }
    }
    if (intent.action === 'add') {
      const local = addPlanSpotFromKnowledge(input.plan, intent.name, intent.day);
      if (local) {
        learnPreferenceFromEdit('spots');
        return finishPlan(input.plan, local, '已按知识库补了一个点位，其他天未重写。', true);
      }
    }
    if (intent.action === 'enrich') {
      const local = applyEasyWalkLocal(input.plan);
      if (local) {
        learnPreferenceFromEdit('spots');
        return finishPlan(input.plan, local, '已按少走路换成馆内可坐的点，没有整页重绘。', true);
      }
    }
    return incrementPlan(input.plan, 'spots', '已补充景点介绍，路线顺序未改。');
  }
  if (intent.type === 'edit_traffic' && input.plan) {
    return incrementPlan(input.plan, 'traffic', '已补充市内接驳，点位未改。');
  }
  if (intent.type === 'edit_rain') {
    if (!input.plan) {
      return { kind: 'ask', message: '还没有行程。先说一座城和几天，生成后再帮你改室内。' };
    }
    const local = applyRainRerouteLocal(input.plan);
    if (local) {
      learnPreferenceFromEdit('spots');
      return finishPlan(input.plan, local, '已按雨天改了室内点，贴士也写上了。', true);
    }
    return { kind: 'ask', message: answerTravelAsk(text, input.plan) };
  }
  if (intent.type === 'edit_holiday') {
    if (!input.plan) {
      return { kind: 'ask', message: '还没有行程。先说一座城和几天，生成后再帮你分流。' };
    }
    const local = applyHolidayRerouteLocal(input.plan);
    if (local) {
      learnPreferenceFromEdit('spots');
      return finishPlan(input.plan, local, '已把首日改成更松的分流点，节假日贴士也写上了。', true);
    }
    return { kind: 'ask', message: answerTravelAsk(text, input.plan) };
  }

  if (intent.type === 'remix' && input.plan) {
    return {
      kind: 'ask',
      message: `这份${input.plan.baseInfo.targetCity}还在。说「改成亲子」「下雨怎么走」「人多怎么走」或「发给朋友」，我替你做完。`,
    };
  }

  if (intent.type === 'ask') {
    return { kind: 'ask', message: answerTravelAsk(text, input.plan) };
  }

  return generateFromExtract(mergeExtract(null, text), input.override, input.plan);
}
