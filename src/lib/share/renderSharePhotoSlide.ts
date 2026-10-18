import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';
import {
  canvasToPngBlob,
  drawCoverImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';

export type SharePhotoSlideKind = 'xhs' | 'douyin';

const SIZES: Record<SharePhotoSlideKind, { width: number; height: number }> = {
  xhs: { width: 1080, height: 1440 },
  douyin: { width: 1080, height: 1920 },
};

export type SharePhotoSlideOptions = {
  kind: SharePhotoSlideKind;
  imageUrl: string;
  name: string;
  caption?: string;
  eyebrow?: string;
  pageIndex: number;
  totalPages: number;
};

/** 种草配图页：全屏实拍 + 底部短标题，小红书 3:4 / 抖音 9:16 */
export async function renderSharePhotoSlide(options: SharePhotoSlideOptions): Promise<Blob> {
  const { width, height } = SIZES[options.kind];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  ctx.fillStyle = '#1c2420';
  ctx.fillRect(0, 0, width, height);
  await drawCoverImage(ctx, options.imageUrl, 0, 0, width, height, 0);

  const fadeH = Math.round(height * 0.28);
  const fade = ctx.createLinearGradient(0, height - fadeH, 0, height);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, height - fadeH, width, fadeH);

  const label = `${options.pageIndex}/${options.totalPages}`;
  ctx.font = `600 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
  const badgeW = ctx.measureText(label).width + 36;
  const badgeH = Math.round(height * 0.036);
  const badgeX = width - badgeW - 28;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, badgeX, 28, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(label, badgeX + badgeW / 2, 28 + badgeH * 0.7);
  ctx.textAlign = 'left';

  const pad = 36;
  let textY = height - Math.round(height * 0.12);
  const eyebrow = options.eyebrow ? sanitizePosterOverlayText(options.eyebrow).slice(0, 18) : '';
  const title = sanitizePosterOverlayText(options.name).slice(0, 18);
  const caption = options.caption ? sanitizePosterOverlayText(options.caption).slice(0, 28) : '';

  if (eyebrow) {
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = `600 ${Math.round(width * 0.028)}px system-ui, sans-serif`;
    ctx.fillText(eyebrow, pad, textY);
    textY += Math.round(height * 0.028);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(width * 0.048)}px system-ui, sans-serif`;
  wrapTextLines(ctx, title, width - pad * 2, 1).forEach((line) => {
    ctx.fillText(line, pad, textY);
    textY += Math.round(height * 0.036);
  });
  if (caption) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `500 ${Math.round(width * 0.03)}px system-ui, sans-serif`;
    wrapTextLines(ctx, caption, width - pad * 2, 2).forEach((line) => {
      ctx.fillText(line, pad, textY);
      textY += Math.round(height * 0.028);
    });
  }

  return canvasToPngBlob(canvas);
}
