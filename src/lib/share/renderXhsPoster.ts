import QRCode from 'qrcode';
import { APP_NAME } from '@/lib/config/brand';
import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
  drawCoverImage,
  loadPosterImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import type { XhsPosterInput } from '@/lib/share/xhsPosterTypes';

const XHS_RED = '#FF2442';
const XHS_RED_SOFT = '#FFF0F3';

export async function renderXhsPoster(input: XhsPosterInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = XHS_POSTER_WIDTH;
  canvas.height = XHS_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  const coverHeight = Math.round(XHS_POSTER_HEIGHT * 0.58);
  const panelY = coverHeight - 28;

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT);

  await drawCoverImage(ctx, input.coverImageUrl, 0, 0, XHS_POSTER_WIDTH, coverHeight + 20, 0);

  if (!input.coverImageUrl) {
    const placeholder = ctx.createLinearGradient(0, 0, 0, coverHeight);
    placeholder.addColorStop(0, '#fecdd3');
    placeholder.addColorStop(1, '#fda4af');
    ctx.fillStyle = placeholder;
    ctx.fillRect(0, 0, XHS_POSTER_WIDTH, coverHeight + 20);
  }

  const fade = ctx.createLinearGradient(0, panelY - 80, 0, panelY + 40);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, panelY - 80, XHS_POSTER_WIDTH, 120);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, panelY, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT - panelY, 24);
  ctx.fill();

  const padX = 24;
  let textY = panelY + 36;

  ctx.fillStyle = XHS_RED;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.fillText('小红书笔记', padX, textY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(input.authorLabel ?? APP_NAME, XHS_POSTER_WIDTH - padX, textY);
  ctx.textAlign = 'left';

  textY += 22;

  if (input.locationLabel) {
    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText(`📍 ${input.locationLabel}`, padX, textY);
    textY += 22;
  }

  ctx.fillStyle = '#111827';
  ctx.font = '700 22px system-ui, sans-serif';
  wrapTextLines(ctx, input.title, XHS_POSTER_WIDTH - padX * 2, 2).forEach((line) => {
    ctx.fillText(line, padX, textY);
    textY += 30;
  });

  textY += 6;
  ctx.fillStyle = '#475569';
  ctx.font = '400 14px system-ui, sans-serif';
  const bodyLines = wrapTextLines(ctx, input.body.replace(/\n/g, ' '), XHS_POSTER_WIDTH - padX * 2, 4);
  bodyLines.forEach((line) => {
    ctx.fillText(line, padX, textY);
    textY += 22;
  });

  textY += 10;
  let tagX = padX;
  const tagY = textY;
  const tagMaxY = XHS_POSTER_HEIGHT - 56;

  ctx.font = '600 12px system-ui, sans-serif';
  input.hashtags.forEach((tag) => {
    const label = `#${tag.replace(/^#/, '')}`;
    const tagW = ctx.measureText(label).width + 20;
    if (tagX + tagW > XHS_POSTER_WIDTH - padX) {
      return;
    }
    if (tagY > tagMaxY) {
      return;
    }
    roundRect(ctx, tagX, tagY - 14, tagW, 26, 13);
    ctx.fillStyle = XHS_RED_SOFT;
    ctx.fill();
    ctx.fillStyle = XHS_RED;
    ctx.fillText(label, tagX + 10, tagY + 2);
    tagX += tagW + 8;
  });

  if (input.shareUrl) {
    const qrSize = 64;
    const qrX = XHS_POSTER_WIDTH - padX - qrSize;
    const qrY = XHS_POSTER_HEIGHT - padX - qrSize - 14;
    const qrDataUrl = await QRCode.toDataURL(input.shareUrl, {
      width: qrSize,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#1e293b', light: '#ffffff' },
    });
    const qrImage = await loadPosterImage(qrDataUrl);
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 10);
    ctx.fill();
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 9px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('扫码查看', qrX + qrSize, qrY + qrSize + 12);
    ctx.textAlign = 'left';
  }

  return canvasToPngBlob(canvas);
}
