import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { profilePathForUser } from '@/router/paths';
import type { User } from '@/types/domain/user/user';
import { formatProfileStatCount, getProfileBio } from '@/utils/userProfileView';

export type ShareUserProfileResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function getUserProfileSharePath(user: User, isOwnProfile: boolean): string {
  return profilePathForUser(user.id, isOwnProfile);
}

export function getUserProfileShareSummary(user: User, isOwnProfile: boolean): string {
  const bio = getProfileBio(user, isOwnProfile).replace(/\s+/g, ' ').trim();
  const stats = `${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.followingCount)} 关注 · ${formatProfileStatCount(user.travelMoments.length)} 动态`;
  const snippet = bio.length > 60 ? `${bio.slice(0, 60)}…` : bio;
  return `${user.username} · ${stats}${snippet ? ` · ${snippet}` : ''}`;
}

export async function shareUserProfile(
  user: User,
  isOwnProfile: boolean,
): Promise<ShareUserProfileResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const tracking = { contentKind: 'user_profile' as const, contentId: user.id };
  const url = buildShareUrl(getUserProfileSharePath(user, isOwnProfile), tracking);
  const text = getUserProfileShareSummary(user, isOwnProfile);
  const title = withBrandShareTitle(`${user.username} · HelloRoamly`);

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
