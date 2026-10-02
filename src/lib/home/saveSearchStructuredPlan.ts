import { getCityCoordinates } from '@/data/cityCoordinates';
import { encodeSearchPlanSessionContent } from '@/lib/home/searchPlanSession';
import { createPlanSessionId, type PlanConversationTurn } from '@/lib/plan/planConversation';
import {
  persistUserAiSessionCreate,
  persistUserAiSessionSave,
} from '@/lib/plan/persistUserAiSession';
import { queryClient } from '@/lib/query/client';
import { searchPlanCatchyTitle } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export function defaultSearchPlanTitle(plan: SearchStructuredPlan): string {
  return searchPlanCatchyTitle(plan).replace(/[《》]/g, '');
}

function toSaveTurns(plan: SearchStructuredPlan): PlanConversationTurn[] {
  const query = `${plan.baseInfo.targetCity} ${plan.baseInfo.days}天 ${plan.baseInfo.peopleType}`;
  return [
    { id: 'search-user', role: 'user', content: query },
    { id: 'search-plan', role: 'assistant', content: encodeSearchPlanSessionContent(plan) },
  ];
}

export async function saveSearchStructuredPlan(params: {
  plan: SearchStructuredPlan;
  title: string;
  isPublic: boolean;
  sessionId?: string;
}): Promise<{ sessionId: string }> {
  const title = params.title.trim();
  if (!title) {
    throw new Error('请填写方案名称');
  }

  const sessionId = params.sessionId?.trim() || createPlanSessionId();
  const coords = getCityCoordinates(params.plan.baseInfo.targetCity);
  const lng = coords?.longitude ?? 0;
  const lat = coords?.latitude ?? 0;
  const turns = toSaveTurns(params.plan);
  const locationName = params.plan.baseInfo.targetCity;
  const initialQuery = turns[0]?.content ?? title;

  if (!params.sessionId?.trim()) {
    await persistUserAiSessionCreate({
      sessionId,
      trigger: 'search',
      locationName,
      lng,
      lat,
      initialQuery,
      conversationTurns: turns,
    });
  }

  await persistUserAiSessionSave(sessionId, {
    title,
    isPublic: params.isPublic,
    conversationTurns: turns,
    locationName,
    lng,
    lat,
    initialQuery,
  });

  void queryClient.invalidateQueries({ queryKey: ['user-plans'] });
  void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
  void queryClient.invalidateQueries({ queryKey: ['discover', 'feed'] });

  return { sessionId };
}

/** 分享图/二维码用：没有方案 id 就先存一份可公开查看的行程 */
export async function ensureSharedSearchPlan(
  plan: SearchStructuredPlan,
  sessionId?: string | null,
): Promise<string> {
  const result = await saveSearchStructuredPlan({
    plan,
    title: defaultSearchPlanTitle(plan),
    isPublic: true,
    sessionId: sessionId?.trim() || undefined,
  });
  return result.sessionId;
}
