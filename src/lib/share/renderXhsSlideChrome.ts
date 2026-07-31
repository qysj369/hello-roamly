import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  roundRect,
} from '@/lib/share/posterCanvas';

const XHS_RED = '#FF2442';

/** 页码角标（小红书多图笔记） */
export function drawXhsPageBadge(
  ctx: CanvasRenderingContext2D,
  pageIndex: number,
  totalPages: number,
): void {
  const label = `${pageIndex}/${totalPages}`;
  ctx.font = '600 12px system-ui, sans-serif';
  const padX = 12;
  const badgeW = ctx.measureText(label).width + padX * 2;
  const badgeH = 28;
  const x = XHS_POSTER_WIDTH - badgeW - 16;
  const y = 16;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x, y, badgeW, badgeH, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + badgeW / 2, y + 18);
  ctx.textAlign = 'left';
}

export function drawXhsBrandWatermark(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText('Hello Roamly', 16, XHS_POSTER_HEIGHT - 16);
}

export { XHS_RED, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT };
