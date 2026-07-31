import { renderXhsImageSlide } from '@/lib/share/renderXhsImageSlide';
import { renderXhsPoster } from '@/lib/share/renderXhsPoster';
import { renderXhsSummarySlide } from '@/lib/share/renderXhsSummarySlide';
import type { XhsPosterInput } from '@/lib/share/xhsPosterTypes';
import { drawXhsPageBadge } from '@/lib/share/renderXhsSlideChrome';
import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
} from '@/lib/share/posterCanvas';

const MAX_XHS_SLIDES = 9;
const MAX_IMAGE_SLIDES_AFTER_CARD = 8;

function planXhsSlideUrls(input: XhsPosterInput): {
  imageUrls: string[];
  hasSummary: boolean;
} {
  const deduped = [...new Set((input.slideImageUrls ?? []).filter(Boolean))];
  let imageUrls = deduped.slice(0, MAX_IMAGE_SLIDES_AFTER_CARD);

  if (imageUrls.length === 0 && input.coverImageUrl) {
    imageUrls = [input.coverImageUrl];
  }

  const hasSummary = Boolean(input.summarySlide?.lines?.some((line) => line.trim()));

  return { imageUrls, hasSummary };
}

/** 生成小红书多图笔记（封面卡 + 配图 + 可选要点页），最多 9 张 */
export async function renderXhsPosterSlides(input: XhsPosterInput): Promise<Blob[]> {
  const { imageUrls, hasSummary } = planXhsSlideUrls(input);
  const totalPages = Math.min(
    1 + imageUrls.length + (hasSummary ? 1 : 0),
    MAX_XHS_SLIDES,
  );

  const slides: Blob[] = [];

  slides.push(await renderXhsPosterWithBadge(input, 1, totalPages));

  let page = 2;
  for (const imageUrl of imageUrls) {
    if (page > totalPages) {
      break;
    }
    slides.push(
      await renderXhsImageSlide({
        imageUrl,
        pageIndex: page,
        totalPages,
        caption: input.locationLabel ? `📍 ${input.locationLabel}` : undefined,
      }),
    );
    page += 1;
  }

  if (hasSummary && input.summarySlide && page <= totalPages) {
    slides.push(
      await renderXhsSummarySlide({
        title: input.summarySlide.title,
        lines: input.summarySlide.lines,
        pageIndex: page,
        totalPages,
        shareUrl: input.shareUrl,
      }),
    );
  }

  return slides;
}

async function renderXhsPosterWithBadge(
  input: XhsPosterInput,
  pageIndex: number,
  totalPages: number,
): Promise<Blob> {
  if (totalPages <= 1) {
    return renderXhsPoster(input);
  }

  const baseBlob = await renderXhsPoster(input);
  const bitmap = await createImageBitmap(baseBlob);
  const canvas = document.createElement('canvas');
  canvas.width = XHS_POSTER_WIDTH;
  canvas.height = XHS_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  drawXhsPageBadge(ctx, pageIndex, totalPages);
  return canvasToPngBlob(canvas);
}
