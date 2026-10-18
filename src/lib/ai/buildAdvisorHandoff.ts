import { buildPlanExcerpt } from '@/lib/ai/advisorSessionSync';
import type { AiChatContext } from '@/types/domain/aiChat';
import type { AiChatPageState } from '@/types/router-state';

type BuildAdvisorHandoffParams = {
  initialPrompt?: string;
  source: AiChatPageState['source'];
  locationName?: string | null;
  lng?: number;
  lat?: number;
  planSessionId?: string | null;
  planContent?: string | null;
  destination?: string;
  days?: number;
  budget?: string;
  searchNonce?: number;
};

/** 首页 / 方案页 → /ai 的统一跳转上下文 */
export function buildAdvisorHandoffState(
  params: BuildAdvisorHandoffParams,
): AiChatPageState {
  const prompt = params.initialPrompt?.trim();
  const locationName = params.locationName?.trim();

  return {
    initialPrompt: prompt,
    aiDream: prompt,
    source: params.source,
    searchNonce: params.searchNonce,
    linkedPlanSessionId: params.planSessionId ?? undefined,
    planExcerpt: params.planContent ? buildPlanExcerpt(params.planContent) : undefined,
    location:
      locationName && params.lng != null && params.lat != null
        ? { name: locationName, lng: params.lng, lat: params.lat }
        : undefined,
    aiPlan:
      params.destination || params.days != null || params.budget
        ? {
            destination: params.destination ?? locationName ?? '',
            days: params.days ?? 3,
            budget: params.budget ?? '',
          }
        : undefined,
  };
}

export function handoffStateToChatContext(state: AiChatPageState): AiChatContext {
  const dream = state.aiDream?.trim() || state.initialPrompt?.trim();
  return {
    dream,
    destination: state.aiPlan?.destination,
    days: state.aiPlan?.days,
    budget: state.aiPlan?.budget,
    sessionId: state.searchNonce ? undefined : state.sessionId,
    searchNonce: state.searchNonce,
    source: state.source,
    linkedPlanSessionId: state.linkedPlanSessionId,
    planExcerpt: state.planExcerpt,
    location: state.location,
  };
}
