import { hashtagsFromTags, mapShareInputToXhs } from '@/lib/share/mapToXhsPoster';
import { renderSharePoster } from '@/lib/share/renderSharePoster';
import { renderXhsPosterSlides } from '@/lib/share/renderXhsPosterSlides';
import { xhsInputToCopyText } from '@/lib/share/xhsNoteCopy';
import type { XhsNoteCopyText, XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { guideDetailPath } from '@/router/paths';
import type { Guide } from '@/types/domain/guide';
import { getGuideCoverUrl } from '@/utils/discoverMedia';
import { getGuideShareSummary } from '@/utils/shareGuide';

function guideSharePosterInput(guide: Guide) {
  return {
    badge: '穷游攻略',
    title: guide.title,
    subtitle: `${guide.city} · ${guide.days} · ${guide.budget}`,
    summary: getGuideShareSummary(guide),
    shareUrl: buildShareUrl(guideDetailPath(guide.id), {
      contentKind: 'guide',
      contentId: guide.id,
    }),
    coverImageUrl: getGuideCoverUrl(guide, 560),
    qrCaption: '长按识别二维码查看攻略',
    qrFooter: '微信扫码 · 穷游攻略与 AI 行程',
  };
}

export function getGuideXhsPosterInput(guide: Guide): XhsPosterInput {
  const base = guideSharePosterInput(guide);
  const cover = getGuideCoverUrl(guide, 720);
  return {
    ...mapShareInputToXhs(base, {
      hashtags: hashtagsFromTags(guide.tags, [guide.city, '穷游攻略', '旅行干货']),
      locationLabel: guide.city,
      titlePrefix: '✨ ',
    }),
    slideImageUrls: cover ? [cover] : [],
    summarySlide: {
      title: `${guide.city}怎么玩？`,
      lines: [
        `🗓 行程：${guide.days}`,
        `💰 预算：${guide.budget}`,
        `🏷 ${guide.tags.slice(0, 4).map((tag) => `#${tag}`).join(' ')}`,
        '更多细节扫码见攻略详情 →',
      ],
    },
  };
}

export function getGuideXhsCopyText(guide: Guide): XhsNoteCopyText {
  return xhsInputToCopyText(getGuideXhsPosterInput(guide));
}

export async function buildGuidePosterBlob(guide: Guide): Promise<Blob> {
  return renderSharePoster(guideSharePosterInput(guide));
}

export async function buildGuideXhsPosterBlob(guide: Guide): Promise<Blob> {
  const slides = await buildGuideXhsPosterSlides(guide);
  return slides[0]!;
}

export async function buildGuideXhsPosterSlides(guide: Guide): Promise<Blob[]> {
  return renderXhsPosterSlides(getGuideXhsPosterInput(guide));
}
