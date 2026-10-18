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

const W = WECHAT_POSTER_WIDTH;
const H = WECHAT_POSTER_HEIGHT;

/** 抖音常用 9:16 封面图：品牌浅米绿，不用平台霓虹色 */
export async function renderDouyinPoster(input: SharePosterInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f9f7ef');
  bg.addColorStop(0.55, '#e8efe9');
  bg.addColorStop(1, '#d9c8b4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(40, 89, 72, 0.08)';
  ctx.beginPath();
  ctx.arc(W * 0.86, 72, 110, 0, Math.PI * 2);
  ctx.fill();

  const cardX = 28;
  const cardY = 40;
  const cardW = W - 56;
  const cardH = H - 80;

  ctx.fillStyle = '#fffffb';
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  await drawCoverImage(ctx, input.coverImageUrl, cardX + 20, cardY + 20, cardW - 40, 340, 18);

  let textY = cardY + (input.coverImageUrl ? 380 : 36);

  ctx.fillStyle = '#285948';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.fillText(input.badge || '行程封面', cardX + 28, textY);

  ctx.fillStyle = '#72a893';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(BRAND_LOGO_TEXT, cardX + 28, textY + 22);

  ctx.fillStyle = '#70706a';
  ctx.font = '500 11px system-ui, sans-serif';
  ctx.fillText(APP_NAME, cardX + 28, textY + 40);

  textY += 68;

  ctx.fillStyle = '#222c28';
  ctx.font = '700 28px system-ui, sans-serif';
  wrapTextLines(ctx, input.title, cardW - 56, 2).forEach((line) => {
    ctx.fillText(line, cardX + 28, textY);
    textY += 36;
  });

  ctx.fillStyle = '#444440';
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.fillText(input.subtitle, cardX + 28, textY + 6);

  textY += 36;
  ctx.fillStyle = '#5a6f66';
  ctx.font = '400 14px system-ui, sans-serif';
  wrapTextLines(ctx, input.summary, cardW - 56, 3).forEach((line) => {
    ctx.fillText(line, cardX + 28, textY);
    textY += 22;
  });

  const qrSize = 132;
  const qrX = cardX + (cardW - qrSize) / 2;
  const qrY = cardY + cardH - qrSize - 72;
  const qrDataUrl = await QRCode.toDataURL(input.shareUrl, {
    width: qrSize,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#222c28', light: '#ffffff' },
  });
  const qrImage = await loadPosterImage(qrDataUrl);
  ctx.fillStyle = '#f3f0e4';
  roundRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 14);
  ctx.fill();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#222c28';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(input.qrCaption ?? '扫码看完整行程', W / 2, qrY + qrSize + 32);
  ctx.fillStyle = '#70706a';
  ctx.font = '400 11px system-ui, sans-serif';
  ctx.fillText(input.qrFooter ?? '蜗牛旅行 · 慢行参考', W / 2, qrY + qrSize + 50);
  ctx.textAlign = 'left';

  return canvasToPngBlob(canvas);
}
