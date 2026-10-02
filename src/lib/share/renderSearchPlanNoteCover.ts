import { BRAND_NAME } from '@/lib/config/brandCopy';
import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
  drawCoverImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import { drawXhsPageBadge } from '@/lib/share/renderXhsSlideChrome';

const TITLE = '#f9f7ef';
const MAIN = '#285948';

export type SearchPlanNoteCoverInput = {
  imageUrl: string;
  title: string;
  hook: string;
  chips: string[];
  pageIndex: number;
  totalPages: number;
};

/** 点点式封面：实拍铺满 + 品牌条 + 大标题，不用对方网站的红。 */
export async function renderSearchPlanNoteCover(input: SearchPlanNoteCoverInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = XHS_POSTER_WIDTH;
  canvas.height = XHS_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  ctx.fillStyle = '#222c28';
  ctx.fillRect(0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT);
  await drawCoverImage(ctx, input.imageUrl, 0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT, 0);

  const fade = ctx.createLinearGradient(0, XHS_POSTER_HEIGHT * 0.42, 0, XHS_POSTER_HEIGHT);
  fade.addColorStop(0, 'rgba(34, 44, 40, 0)');
  fade.addColorStop(1, 'rgba(34, 44, 40, 0.78)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, XHS_POSTER_HEIGHT * 0.42, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT * 0.58);

  drawXhsPageBadge(ctx, input.pageIndex, input.totalPages);

  const padX = 24;
  ctx.fillStyle = MAIN;
  roundRect(ctx, padX, 28, 86, 28, 14);
  ctx.fill();
  ctx.fillStyle = TITLE;
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText(BRAND_NAME, padX + 12, 47);

  let textY = XHS_POSTER_HEIGHT - 196;
  ctx.fillStyle = TITLE;
  ctx.font = '700 28px system-ui, sans-serif';
  wrapTextLines(ctx, input.title, XHS_POSTER_WIDTH - padX * 2, 3).forEach((line) => {
    ctx.fillText(line, padX, textY);
    textY += 36;
  });

  ctx.fillStyle = 'rgba(249, 247, 239, 0.88)';
  ctx.font = '400 14px system-ui, sans-serif';
  wrapTextLines(ctx, input.hook, XHS_POSTER_WIDTH - padX * 2, 2).forEach((line) => {
    ctx.fillText(line, padX, textY);
    textY += 22;
  });

  textY += 10;
  ctx.font = '600 12px system-ui, sans-serif';
  let chipX = padX;
  input.chips.slice(0, 3).forEach((chip) => {
    const label = chip.slice(0, 14);
    const width = ctx.measureText(label).width + 20;
    if (chipX + width > XHS_POSTER_WIDTH - padX) return;
    ctx.fillStyle = 'rgba(249, 247, 239, 0.18)';
    roundRect(ctx, chipX, textY - 15, width, 26, 13);
    ctx.fill();
    ctx.fillStyle = TITLE;
    ctx.fillText(label, chipX + 10, textY + 3);
    chipX += width + 8;
  });

  return canvasToPngBlob(canvas);
}
