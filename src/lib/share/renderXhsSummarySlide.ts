import QRCode from 'qrcode';
import {
  XHS_POSTER_HEIGHT,
  XHS_POSTER_WIDTH,
  canvasToPngBlob,
  loadPosterImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import {
  drawXhsPageBadge,
  XHS_RED,
} from '@/lib/share/renderXhsSlideChrome';

export type XhsSummarySlideOptions = {
  title: string;
  lines: string[];
  pageIndex: number;
  totalPages: number;
  shareUrl?: string;
};

/** 小红书多图笔记：末尾文字要点页 */
export async function renderXhsSummarySlide(options: XhsSummarySlideOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = XHS_POSTER_WIDTH;
  canvas.height = XHS_POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  const gradient = ctx.createLinearGradient(0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT);
  gradient.addColorStop(0, '#fff1f2');
  gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, XHS_POSTER_WIDTH, XHS_POSTER_HEIGHT);

  drawXhsPageBadge(ctx, options.pageIndex, options.totalPages);

  const padX = 28;
  let textY = 72;

  ctx.fillStyle = XHS_RED;
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.fillText('旅行干货', padX, textY);

  textY += 28;
  ctx.fillStyle = '#111827';
  ctx.font = '700 24px system-ui, sans-serif';
  wrapTextLines(ctx, options.title, XHS_POSTER_WIDTH - padX * 2, 2).forEach((line) => {
    ctx.fillText(line, padX, textY);
    textY += 32;
  });

  textY += 12;
  ctx.fillStyle = '#334155';
  ctx.font = '500 15px system-ui, sans-serif';
  options.lines.slice(0, 6).forEach((line) => {
    wrapTextLines(ctx, line, XHS_POSTER_WIDTH - padX * 2, 2).forEach((wrapped) => {
      ctx.fillText(wrapped, padX, textY);
      textY += 24;
    });
    textY += 4;
  });

  if (options.shareUrl) {
    const qrSize = 72;
    const qrX = XHS_POSTER_WIDTH - padX - qrSize;
    const qrY = XHS_POSTER_HEIGHT - padX - qrSize;
    const qrDataUrl = await QRCode.toDataURL(options.shareUrl, {
      width: qrSize,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#1e293b', light: '#ffffff' },
    });
    const qrImage = await loadPosterImage(qrDataUrl);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('扫码查看详情', qrX + qrSize, qrY + qrSize + 14);
    ctx.textAlign = 'left';
  }

  return canvasToPngBlob(canvas);
}
