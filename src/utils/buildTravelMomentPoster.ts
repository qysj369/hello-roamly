import { resolveRemoteImageUrl } from '@/lib/cdn';
import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { buildShareUrl } from '@/lib/share/shareUrl';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { getMomentCoverUrl } from '@/utils/discoverMedia';
import {
  getTravelMomentPosterSubtitle,
  getTravelMomentSharePath,
  getTravelMomentShareSummary,
} from '@/utils/shareTravelMoment';
import { getMomentDescription, getMomentTags } from '@/utils/travelMomentDisplay';

function getMomentPosterCoverUrl(moment: TravelMoment): string {
  return resolveRemoteImageUrl(getMomentCoverUrl(moment), { width: 720 });
}

function isPlaceholderImageUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes('picsum.photos');
  } catch {
    return false;
  }
}

function resolveMomentSlideUrls(moment: TravelMoment): string[] {
  const urls = (moment.imageUrls ?? [])
    .filter((url) => url && !isPlaceholderImageUrl(url))
    .map((url) => resolveRemoteImageUrl(url, { width: 720 }))
    .filter(Boolean);
  if (urls.length > 0) {
    return urls.slice(0, 8);
  }
  return [getMomentPosterCoverUrl(moment)];
}

function momentSharePosterInput(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}) {
  const { moment, authorId, authorName, isOwnProfile } = params;
  const title = moment.title?.trim() || getMomentDescription(moment).slice(0, 40) || '旅行瞬间';
  const location = moment.location?.trim();

  return {
    input: {
      badge: '旅行瞬间',
      title,
      subtitle: getTravelMomentPosterSubtitle(moment, authorName),
      summary: getTravelMomentShareSummary(moment, authorName),
      shareUrl: buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }), {
        contentKind: 'travel_moment',
        contentId: moment.id,
      }),
      coverImageUrl: getMomentPosterCoverUrl(moment),
      qrCaption: '长按识别二维码查看瞬间',
      qrFooter: '微信扫码 · 漫行动态与 AI 行程',
    },
    title,
    authorName,
    location,
    tags: getMomentTags(moment),
    slideImageUrls: resolveMomentSlideUrls(moment),
  };
}

export function getTravelMomentXhsPosterInput(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): XhsPosterInput {
  const { input, title, authorName, location, tags, slideImageUrls } =
    momentSharePosterInput(params);

  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags(tags, ['旅行瞬间', '漫行日记', location ?? ''].filter(Boolean)),
      authorLabel: `@${authorName}`,
      locationLabel: location,
      titlePrefix: '📸 ',
    }),
    slideImageUrls,
    summarySlide:
      tags.length > 0
        ? {
            title: title,
            lines: [
              getMomentDescription(params.moment).slice(0, 100),
              tags.slice(0, 5).map((tag) => `#${tag}`).join(' '),
            ],
          }
        : undefined,
  };
}

export function getTravelMomentXhsCopyText(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): XhsNoteCopyText {
  return xhsInputToCopyText(getTravelMomentXhsPosterInput(params));
}

export async function buildTravelMomentPosterBlob(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): Promise<Blob> {
  return renderSharePoster(momentSharePosterInput(params).input);
}

export async function buildTravelMomentXhsPosterBlob(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): Promise<Blob> {
  const slides = await buildTravelMomentXhsPosterSlides(params);
  return slides[0]!;
}

export async function buildTravelMomentXhsPosterSlides(params: {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
}): Promise<Blob[]> {
  return renderXhsPosterSlides(getTravelMomentXhsPosterInput(params));
}
