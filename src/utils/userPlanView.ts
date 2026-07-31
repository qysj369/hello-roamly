import { resolveCoverFromPlaceText, getDefaultCityCoverUrl } from '@/data/cityCoverImages';
import type { UserPlanRecord } from '@/types/api/userPlans';
import type { PlanConversationTurn } from '@/lib/plan/planConversation';
import type { DiscoverSavedPlanItem } from '@/types/domain/discover';

export function userPlanToConversationTurns(record: UserPlanRecord): PlanConversationTurn[] {
  return record.content.fullHistory.map((item, index) => ({
    id: `${record.id}-${index}`,
    role: item.role,
    content: item.content,
  }));
}

export function getSavedUserPlanCoverUrl(planId: string, locationName?: string): string {
  if (locationName?.trim()) {
    const fromLocation = resolveCoverFromPlaceText(locationName, { width: 640 });
    if (fromLocation) {
      return fromLocation;
    }
  }
  return getDefaultCityCoverUrl(640);
}

export function userPlanToDiscoverItem(record: UserPlanRecord): DiscoverSavedPlanItem {
  return {
    kind: 'savedPlan',
    id: `saved-plan-${record.id}`,
    userPlanId: record.id,
    title: record.title,
    locationName: record.content.locationName,
    authorId: record.userId,
    updatedAt: record.updatedAt,
  };
}

export function formatSavedUserPlanMeta(record: UserPlanRecord): string {
  const rounds = record.content.fullHistory.filter((item) => item.role === 'assistant').length;
  return `${record.content.locationName} · ${rounds} 版方案`;
}

/** 从首版 AI 回复提取海报/分享摘要 */
export function getSavedUserPlanSummary(record: UserPlanRecord): string {
  const assistant = record.content.fullHistory.find((item) => item.role === 'assistant');
  if (!assistant?.content.trim()) {
    return `${record.content.locationName} 穷游方案，含花费与行程建议。`;
  }
  const plain = assistant.content
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  return plain.slice(0, 160) || `${record.content.locationName} 穷游方案`;
}

export function getSavedUserPlanRoundsLabel(record: UserPlanRecord): string {
  const rounds = record.content.fullHistory.filter((item) => item.role === 'assistant').length;
  return rounds > 1 ? `${rounds} 版对话方案` : 'AI 穷游方案';
}

export { sessionToDiscoverItem, sessionToLegacyPlanRecord } from '@/lib/plan/sessionAdapters';
