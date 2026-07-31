import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { travelPlanDetailPath } from '@/router/paths';
import type { TravelPlan } from '@/types/domain/travelPlan';
import {
  getPlanCoverUrl,
  getPlanDaysLabel,
  getPlanDestination,
  getPlanShareSummary,
  getPlanTotalCostLabel,
} from '@/utils/travelPlanView';

function planSharePosterInput(plan: TravelPlan) {
  const destination = getPlanDestination(plan);
  return {
    input: {
      badge: 'AI 行程',
      title: plan.title,
      subtitle: `${destination} · ${getPlanDaysLabel(plan)} · ${getPlanTotalCostLabel(plan)}`,
      summary: plan.summary || getPlanShareSummary(plan),
      shareUrl: buildShareUrl(travelPlanDetailPath(plan.id), {
        contentKind: 'travel_plan',
        contentId: plan.id,
      }),
      coverImageUrl: getPlanCoverUrl(plan),
      qrCaption: '长按识别二维码查看行程',
      qrFooter: '微信扫码 · 穷游攻略与 AI 行程',
    },
    destination,
  };
}

export function getTravelPlanXhsPosterInput(plan: TravelPlan): XhsPosterInput {
  const { input, destination } = planSharePosterInput(plan);
  const cover = getPlanCoverUrl(plan);
  const summaryText = plan.summary || getPlanShareSummary(plan);

  return {
    ...mapShareInputToXhs(input, {
      hashtags: hashtagsFromTags([], [destination, 'AI行程', '穷游', '旅行计划']),
      locationLabel: destination,
      titlePrefix: '🗺️ ',
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${destination}行程单`,
      lines: [
        `📅 ${getPlanDaysLabel(plan)} · ${getPlanTotalCostLabel(plan)}`,
        summaryText.slice(0, 120),
        '完整路线与预算扫码查看 →',
      ].filter(Boolean),
    },
  };
}

export function getTravelPlanXhsCopyText(plan: TravelPlan): XhsNoteCopyText {
  return xhsInputToCopyText(getTravelPlanXhsPosterInput(plan));
}

export async function buildTravelPlanPosterBlob(plan: TravelPlan): Promise<Blob> {
  return renderSharePoster(planSharePosterInput(plan).input);
}

export async function buildTravelPlanXhsPosterBlob(plan: TravelPlan): Promise<Blob> {
  const slides = await buildTravelPlanXhsPosterSlides(plan);
  return slides[0]!;
}

export async function buildTravelPlanXhsPosterSlides(plan: TravelPlan): Promise<Blob[]> {
  return renderXhsPosterSlides(getTravelPlanXhsPosterInput(plan));
}
