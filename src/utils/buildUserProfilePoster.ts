import { resolveRemoteImageUrl } from '@/lib/cdn';
import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { buildShareUrl } from '@/lib/share/shareUrl';
import type { User } from '@/types/domain/user/user';
import { getMomentCoverUrl } from '@/utils/discoverMedia';
import {
  getUserProfileSharePath,
  getUserProfileShareSummary,
} from '@/utils/shareUserProfile';
import { formatProfileStatCount, getInterestLabel } from '@/utils/userProfileView';

function getProfilePosterCoverUrl(user: User): string | undefined {
  if (user.avatar) {
    return resolveRemoteImageUrl(user.avatar, { width: 720 });
  }
  const firstMoment = user.travelMoments[0];
  if (firstMoment) {
    const cover = getMomentCoverUrl(firstMoment);
    if (cover) {
      return resolveRemoteImageUrl(cover, { width: 720 });
    }
  }
  return `https://picsum.photos/seed/profile-${user.id}/720/960`;
}

function getProfileSlideImageUrls(user: User): string[] {
  const slides: string[] = [];
  const avatar = user.avatar ? resolveRemoteImageUrl(user.avatar, { width: 720 }) : undefined;
  if (avatar) {
    slides.push(avatar);
  }
  for (const moment of user.travelMoments) {
    const cover = getMomentCoverUrl(moment);
    if (cover) {
      slides.push(resolveRemoteImageUrl(cover, { width: 720 }));
    }
    if (slides.length >= 8) {
      break;
    }
  }
  return [...new Set(slides)].slice(0, 8);
}

function profileSharePosterInput(user: User, isOwnProfile: boolean) {
  return {
    badge: '旅行主页',
    title: user.username,
    subtitle: `${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.followingCount)} 关注 · ${formatProfileStatCount(user.travelMoments.length)} 动态`,
    summary: getUserProfileShareSummary(user, isOwnProfile),
    shareUrl: buildShareUrl(getUserProfileSharePath(user, isOwnProfile), {
      contentKind: 'user_profile',
      contentId: user.id,
    }),
    coverImageUrl: getProfilePosterCoverUrl(user),
    qrCaption: '长按识别二维码查看主页',
    qrFooter: '微信扫码 · 穷游动态与 AI 行程',
  };
}

export function getUserProfileXhsPosterInput(user: User, isOwnProfile: boolean): XhsPosterInput {
  const input = profileSharePosterInput(user, isOwnProfile);
  const interestLabels = user.interests.slice(0, 3).map((item) => getInterestLabel(item));

  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags(interestLabels, ['旅行博主', '穷游', '个人主页']),
      authorLabel: `@${user.username}`,
      titlePrefix: '✨ ',
    }),
    slideImageUrls: getProfileSlideImageUrls(user),
    summarySlide: {
      title: `${user.username}的旅行主页`,
      lines: [
        `👥 ${formatProfileStatCount(user.followersCount)} 粉丝 · ${formatProfileStatCount(user.travelMoments.length)} 条动态`,
        user.bio?.trim() || '一起来穷游世界',
        '扫码关注 TA 的最新行程与瞬间 →',
      ],
    },
  };
}

export function getUserProfileXhsCopyText(user: User, isOwnProfile: boolean): XhsNoteCopyText {
  return xhsInputToCopyText(getUserProfileXhsPosterInput(user, isOwnProfile));
}

export async function buildUserProfilePosterBlob(
  user: User,
  isOwnProfile: boolean,
): Promise<Blob> {
  return renderSharePoster(profileSharePosterInput(user, isOwnProfile));
}

export async function buildUserProfileXhsPosterBlob(
  user: User,
  isOwnProfile: boolean,
): Promise<Blob> {
  const slides = await buildUserProfileXhsPosterSlides(user, isOwnProfile);
  return slides[0]!;
}

export async function buildUserProfileXhsPosterSlides(
  user: User,
  isOwnProfile: boolean,
): Promise<Blob[]> {
  return renderXhsPosterSlides(getUserProfileXhsPosterInput(user, isOwnProfile));
}
