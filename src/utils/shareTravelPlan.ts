import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { travelPlanDetailPath } from '@/router/paths';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { getPlanShareSummary } from '@/utils/travelPlanView';

export type ShareTravelPlanResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareTravelPlan(plan: TravelPlan): Promise<ShareTravelPlanResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const tracking = { contentKind: 'travel_plan' as const, contentId: plan.id };
  const url = buildShareUrl(travelPlanDetailPath(plan.id), tracking);
  const text = getPlanShareSummary(plan);
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
