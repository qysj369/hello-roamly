import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';
import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
  drawCoverImage,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import {
  drawXhsBrandWatermark,
  drawXhsPageBadge,
} from '@/lib/share/renderXhsSlideChrome';

export type XhsImageSlideOptions = {
  imageUrl: string;
  pageIndex: number;
  totalPages: number;
  caption?: string;
  eyebrow?: string;
  title?: string;
  /** 公域笔记默认不打品牌水印，避免被判跨平台引流 */
  brandMark?: boolean;
};

/** 小红书多图笔记：全屏配图页 */
export async function renderXhsImageSlide(options: XhsImageSlideOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = XHS_POSTER_WIDTH;
  canvas.height = XHS_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT);

  await drawCoverImage(ctx, options.imageUrl, 0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT, 0);

  const eyebrow = options.eyebrow ? sanitizePosterOverlayText(options.eyebrow) : '';
  const title = options.title ? sanitizePosterOverlayText(options.title) : '';
  const caption = options.caption ? sanitizePosterOverlayText(options.caption) : '';
  const hasCard = Boolean(eyebrow || title);
  const fadeHeight = hasCard ? 220 : 120;
  const fade = ctx.createLinearGradient(0, XHS_POSTER_HEIGHT - fadeHeight, 0, XHS_POSTER_HEIGHT);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, XHS_POSTER_HEIGHT - fadeHeight, XHS_POSTER_WIDTH, fadeHeight);

  drawXhsPageBadge(ctx, options.pageIndex, options.totalPages);

  let textY = XHS_POSTER_HEIGHT - (hasCard ? 148 : 36);
  if (eyebrow) {
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillText(eyebrow, 20, textY);
    textY += 26;
  }
  if (title) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px system-ui, sans-serif';
    wrapTextLines(ctx, title, XHS_POSTER_WIDTH - 40, 2).forEach((line) => {
      ctx.fillText(line, 20, textY);
      textY += 28;
    });
  }
  if (caption) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = hasCard ? '400 14px system-ui, sans-serif' : '500 13px system-ui, sans-serif';
    wrapTextLines(ctx, caption, XHS_POSTER_WIDTH - 40, hasCard ? 2 : 1).forEach((line) => {
      ctx.fillText(line, 20, textY);
      textY += 22;
    });
  }

  if (options.brandMark) {
    drawXhsBrandWatermark(ctx);
  }

  return canvasToPngBlob(canvas);
}
