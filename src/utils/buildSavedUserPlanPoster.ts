import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { SharePosterInput } from '@/lib/share/posterTypes';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { searchPlanHeaderLine, searchPlanShareHashtags } from '@/lib/home/searchPlanShareCopy';
import { getSharePlanOutline } from '@/lib/home/sharePlanOutline';
import { searchPlanFromUserPlan, searchPlanGuideText } from '@/lib/home/searchPlanSession';
import { buildSavedUserPlanShareUrl } from '@/utils/shareSavedUserPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';
import {
  getSavedUserPlanCoverUrl,
  getSavedUserPlanRoundsLabel,
  getSavedUserPlanSummary,
} from '@/utils/userPlanView';

export function getSavedUserPlanPosterOutline(plan: UserPlanRecord): {
  subtitle: string;
  summary: string;
} {
  const structured = searchPlanFromUserPlan(plan);
  if (!structured) {
    return {
      subtitle: `${plan.content.locationName} · ${getSavedUserPlanRoundsLabel(plan)}`,
      summary: getSavedUserPlanSummary(plan),
    };
  }

  const outline = getSharePlanOutline(structured);
  const dayBits = outline.days.map((day) => {
    const bit = day.highlight || day.title;
    return `D${day.day} ${bit}`;
  });
  return {
    subtitle: searchPlanHeaderLine(structured),
    summary: [outline.budgetLine, ...dayBits, '扫码看完整行程'].filter(Boolean).join('\n'),
  };
}

function savedPlanSharePosterInput(plan: UserPlanRecord): { input: SharePosterInput; destination: string } {
  const destination = plan.content.locationName;
  const outline = getSavedUserPlanPosterOutline(plan);
  const guide = searchPlanFromUserPlan(plan) ? '' : searchPlanGuideText(plan);
  return {
    input: {
      badge: '漫行方案',
      title: plan.title,
      subtitle: outline.subtitle,
      summary: outline.summary || guide.slice(0, 160),
      summaryMaxLines: 8,
      shareUrl: buildSavedUserPlanShareUrl(plan),
      coverImageUrl: undefined,
      qrCaption: '长按识别二维码查看完整攻略',
      qrFooter: '微信扫码 · 蜗牛旅行漫行方案',
      tone: 'brand',
    },
    destination,
  };
}

export function getSavedUserPlanXhsPosterInput(plan: UserPlanRecord): XhsPosterInput {
  const { input, destination } = savedPlanSharePosterInput(plan);
  const cover = getSavedUserPlanCoverUrl(plan.id, destination);
  const outline = getSavedUserPlanPosterOutline(plan);
  const structured = searchPlanFromUserPlan(plan);

  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags(
        [],
        structured ? searchPlanShareHashtags(structured) : [destination, '漫行', 'AI行程', '蜗牛旅行'],
      ),
      locationLabel: destination,
      titlePrefix: '🐌 ',
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${destination}漫行方案`,
      lines: [outline.subtitle, ...outline.summary.split('\n').slice(0, 6)].filter(Boolean),
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
