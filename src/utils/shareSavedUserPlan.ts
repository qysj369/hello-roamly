import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { savedUserPlanDetailPath } from '@/router/paths';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { formatSavedUserPlanMeta, getSavedUserPlanSummary } from '@/utils/userPlanView';

export type ShareSavedUserPlanResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function buildSavedUserPlanShareText(plan: UserPlanRecord): string {
  return `${plan.title} · ${formatSavedUserPlanMeta(plan)}\n${getSavedUserPlanSummary(plan).slice(0, 80)}`;
}

export async function shareSavedUserPlan(plan: UserPlanRecord): Promise<ShareSavedUserPlanResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const tracking = { contentKind: 'saved_user_plan' as const, contentId: plan.id };
  const url = buildShareUrl(savedUserPlanDetailPath(plan.id), tracking);
  const text = buildSavedUserPlanShareText(plan);

  try {
    if (navigator.share) {
      await navigator.share({ title: plan.title, text, url });
      trackShareOutcome(tracking, 'shared', { channel: 'native', shareUrl: url });
      return 'shared';
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    trackShareOutcome(tracking, 'copied', { channel: 'link', shareUrl: url });
    return 'copied';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      trackShareOutcome(tracking, 'copied', { channel: 'link', shareUrl: url });
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}

export function buildSavedUserPlanChatDraft(plan: UserPlanRecord): string {
  const tracking = { contentKind: 'saved_user_plan' as const, contentId: plan.id };
  const url = buildShareUrl(savedUserPlanDetailPath(plan.id), tracking);
  return `分享穷游方案：${plan.title}\n${plan.content.locationName}\n${url}`;
}
