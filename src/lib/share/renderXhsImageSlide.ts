import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
  drawCoverImage,
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

  const fade = ctx.createLinearGradient(0, XHS_POSTER_HEIGHT - 120, 0, XHS_POSTER_HEIGHT);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, XHS_POSTER_HEIGHT - 120, XHS_POSTER_WIDTH, 120);

  drawXhsPageBadge(ctx, options.pageIndex, options.totalPages);

  if (options.caption) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 13px system-ui, sans-serif';
    ctx.fillText(options.caption, 16, XHS_POSTER_HEIGHT - 36);
  }

  drawXhsBrandWatermark(ctx);

  return canvasToPngBlob(canvas);
}
