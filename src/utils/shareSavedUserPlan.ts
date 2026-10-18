import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { savedUserPlanDetailPath } from '@/router/paths';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import { formatSavedUserPlanMeta, getSavedUserPlanSummary } from '@/utils/userPlanView';

export type ShareSavedUserPlanResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function buildSavedUserPlanShareText(plan: UserPlanRecord): string {
  return `${plan.title} · ${formatSavedUserPlanMeta(plan)}\n${getSavedUserPlanSummary(plan).slice(0, 80)}`;
}

export function buildSavedUserPlanShareUrl(plan: UserPlanRecord): string {
  return buildShareUrl(savedUserPlanDetailPath(plan.id), {
    contentKind: 'saved_user_plan',
    contentId: plan.id,
  });
}

export async function copySavedUserPlanLink(plan: UserPlanRecord): Promise<'copied' | 'failed'> {
  if (typeof window === 'undefined') {
    return 'failed';
  }
  const url = buildSavedUserPlanShareUrl(plan);
  const result = await copyTextToClipboard(url);
  if (result === 'copied') {
    trackShareOutcome(
      { contentKind: 'saved_user_plan', contentId: plan.id },
      'copied',
      { channel: 'link', shareUrl: url },
    );
  }
  return result;
}

export async function shareSavedUserPlan(plan: UserPlanRecord): Promise<ShareSavedUserPlanResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const tracking = { contentKind: 'saved_user_plan' as const, contentId: plan.id };
  const url = buildSavedUserPlanShareUrl(plan);
  const text = buildSavedUserPlanShareText(plan);
  const title = withBrandShareTitle(plan.title);

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      trackShareOutcome(tracking, 'shared', { channel: 'native', shareUrl: url });
      return 'shared';
    }
    await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
    trackShareOutcome(tracking, 'copied', { channel: 'link', shareUrl: url });
    return 'copied';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      trackShareOutcome(tracking, 'copied', { channel: 'link', shareUrl: url });
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}

export function buildSavedUserPlanChatDraft(plan: UserPlanRecord): string {
  const url = buildSavedUserPlanShareUrl(plan);
  return `分享漫行方案：${withBrandShareTitle(plan.title)}\n${plan.content.locationName}\n${url}`;
}
