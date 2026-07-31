import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { savedUserPlanDetailPath } from '@/router/paths';
import type { UserPlanRecord } from '@/types/api/userPlans';
import {
  formatSavedUserPlanMeta,
  getSavedUserPlanCoverUrl,
  getSavedUserPlanRoundsLabel,
  getSavedUserPlanSummary,
} from '@/utils/userPlanView';

function savedPlanSharePosterInput(plan: UserPlanRecord) {
  const destination = plan.content.locationName;
  return {
    input: {
      badge: '穷游方案',
      title: plan.title,
      subtitle: `${destination} · ${getSavedUserPlanRoundsLabel(plan)}`,
      summary: getSavedUserPlanSummary(plan),
      shareUrl: buildShareUrl(savedUserPlanDetailPath(plan.id), {
        contentKind: 'saved_user_plan',
        contentId: plan.id,
      }),
      coverImageUrl: getSavedUserPlanCoverUrl(plan.id, destination),
      qrCaption: '长按识别二维码查看方案',
      qrFooter: '微信扫码 · 蜗牛旅行穷游方案',
    },
    destination,
  };
}

export function getSavedUserPlanXhsPosterInput(plan: UserPlanRecord): XhsPosterInput {
  const { input, destination } = savedPlanSharePosterInput(plan);
  const cover = getSavedUserPlanCoverUrl(plan.id, destination);
  const summaryText = getSavedUserPlanSummary(plan);

  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags([], [destination, '穷游', 'AI行程', '蜗牛旅行']),
      locationLabel: destination,
      titlePrefix: '🐌 ',
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${destination}穷游方案`,
      lines: [
        formatSavedUserPlanMeta(plan),
        summaryText.slice(0, 120),
        '完整对话与行程扫码查看 →',
      ].filter(Boolean),
    },
  };
}

export function getSavedUserPlanXhsCopyText(plan: UserPlanRecord): XhsNoteCopyText {
  return xhsInputToCopyText(getSavedUserPlanXhsPosterInput(plan));
}

export async function buildSavedUserPlanPosterBlob(plan: UserPlanRecord): Promise<Blob> {
  return renderSharePoster(savedPlanSharePosterInput(plan).input);
}

export async function buildSavedUserPlanXhsPosterBlob(plan: UserPlanRecord): Promise<Blob> {
  const slides = await buildSavedUserPlanXhsPosterSlides(plan);
  return slides[0]!;
}

export async function buildSavedUserPlanXhsPosterSlides(plan: UserPlanRecord): Promise<Blob[]> {
  return renderXhsPosterSlides(getSavedUserPlanXhsPosterInput(plan));
}
