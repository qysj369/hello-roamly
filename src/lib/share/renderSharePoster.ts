import QRCode from 'qrcode';
import { APP_NAME, BRAND_LOGO_TEXT } from '@/lib/config/brand';
import {
  WECHAT_POSTER_HEIGHT,
  WECHAT_POSTER_WIDTH,
  canvasToPngBlob,
  drawCoverImage,
  loadPosterImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import type { SharePosterInput } from '@/lib/share/posterTypes';

/** 生成带二维码的分享海报（PNG） */
export async function renderSharePoster(input: SharePosterInput): Promise<Blob> {
  const qrCaption = input.qrCaption ?? '长按识别二维码查看';
  const qrFooter = input.qrFooter ?? '微信扫码 · Hello Roamly';

  const canvas = document.createElement('canvas');
  canvas.width = WECHAT_POSTER_WIDTH;
  canvas.height = WECHAT_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  const brand = input.tone === 'brand';
  const gradient = ctx.createLinearGradient(0, 0, WECHAT_POSTER_WIDTH, WECHAT_POSTER_HEIGHT);
  if (brand) {
    gradient.addColorStop(0, '#f9f7ef');
    gradient.addColorStop(0.5, '#e8efe9');
    gradient.addColorStop(1, '#d9c8b4');
  } else {
    gradient.addColorStop(0, '#6d28d9');
    gradient.addColorStop(0.45, '#8b5cf6');
    gradient.addColorStop(1, '#0891b2');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WECHAT_POSTER_WIDTH, WECHAT_POSTER_HEIGHT);

  ctx.fillStyle = brand ? 'rgba(40, 89, 72, 0.08)' : 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(WECHAT_POSTER_WIDTH * 0.85, 80, 120, 0, Math.PI * 2);
  ctx.fill();

  const cardX = 28;
  const cardY = 56;
  const cardW = WECHAT_POSTER_WIDTH - 56;
  const cardH = WECHAT_POSTER_HEIGHT - 112;

  ctx.fillStyle = brand ? '#fffffb' : '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  await drawCoverImage(ctx, input.coverImageUrl, cardX + 20, cardY + 20, cardW - 40, 200, 16);

  let textY = cardY + (input.coverImageUrl ? 240 : 36);

  ctx.fillStyle = brand ? '#285948' : '#059669';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText(input.badge, cardX + 28, textY);

  ctx.fillStyle = brand ? '#72a893' : '#7c3aed';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(BRAND_LOGO_TEXT, cardX + 28, textY + 20);

  ctx.fillStyle = brand ? '#70706a' : '#94a3b8';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillText(APP_NAME, cardX + 28, textY + 36);

  textY += 62;

  ctx.fillStyle = brand ? '#222c28' : '#0f172a';
  ctx.font = '700 26px system-ui, sans-serif';
  wrapTextLines(ctx, input.title, cardW - 56, 3).forEach((line) => {
    ctx.fillText(line, cardX + 28, textY);
    textY += 34;
  });

  textY += 8;
  ctx.fillStyle = brand ? '#444440' : '#475569';
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.fillText(input.subtitle, cardX + 28, textY);

  textY += 28;
  ctx.fillStyle = brand ? '#5a6f66' : '#64748b';
  ctx.font = '400 13px system-ui, sans-serif';
  wrapTextLines(ctx, input.summary, cardW - 56, input.summaryMaxLines ?? 3).forEach((line) => {
    ctx.fillText(line, cardX + 28, textY);
    textY += 22;
  });

  const qrSize = 168;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = cardY + cardH - qrSize - 72;

  const qrDataUrl = await QRCode.toDataURL(input.shareUrl, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: brand ? '#222c28' : '#1e293b', light: '#ffffff' },
  });
  const qrImage = await loadPosterImage(qrDataUrl);

  ctx.fillStyle = brand ? '#f3f0e4' : '#f8fafc';
  roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
  ctx.fill();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = brand ? '#222c28' : '#334155';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(qrCaption, cardX + cardW / 2, qrY + qrSize + 36);

  ctx.fillStyle = brand ? '#70706a' : '#94a3b8';
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText(qrFooter, cardX + cardW / 2, qrY + qrSize + 56);
  ctx.textAlign = 'left';

  return canvasToPngBlob(canvas);
}

/** @deprecated 使用 renderSharePoster */
export async function renderTravelPlanPoster(input: SharePosterInput): Promise<Blob> {
  return renderSharePoster(input);
}
