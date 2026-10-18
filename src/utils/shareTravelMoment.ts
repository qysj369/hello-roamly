import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { profilePathForUser, travelMomentSharePath } from '@/router/paths';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import {
  getMomentDescription,
  getMomentTags,
} from '@/utils/travelMomentDisplay';

export type ShareTravelMomentResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function getTravelMomentSharePath(
  moment: TravelMoment,
  authorId: string,
  options?: { isOwnProfile?: boolean },
): string {
  const isOwnProfile =
    options?.isOwnProfile ?? authorId === DEMO_CURRENT_USER_ID;
  return travelMomentSharePath(authorId, moment.id, { isOwnProfile });
}

export function getTravelMomentShareSummary(
  moment: TravelMoment,
  authorName: string,
): string {
  const description = getMomentDescription(moment);
  const title = moment.title?.trim();
  const location = moment.location?.trim();
  const tags = getMomentTags(moment).slice(0, 3).join(' · ');
  const head = title || description.slice(0, 48) || '旅行瞬间';
  const parts = [authorName, location, tags].filter(Boolean);
  return parts.length > 0 ? `${head} · ${parts.join(' · ')}` : head;
}

export async function shareTravelMoment(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): Promise<ShareTravelMomentResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const { moment, authorId, authorName, isOwnProfile } = params;
  const tracking = { contentKind: 'travel_moment' as const, contentId: moment.id };
  const url = buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }), tracking);
  const text = getTravelMomentShareSummary(moment, authorName);
  const title = withBrandShareTitle(moment.title?.trim() || `${authorName} 的旅行瞬间`);

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

/** 用于海报副标题等 */
export function getTravelMomentPosterSubtitle(moment: TravelMoment, authorName: string): string {
  const location = moment.location?.trim();
  if (location) {
    return `${authorName} · ${location}`;
  }
  return authorName;
}

export function getTravelMomentProfilePath(authorId: string, isOwnProfile?: boolean): string {
  return profilePathForUser(authorId, isOwnProfile);
}
