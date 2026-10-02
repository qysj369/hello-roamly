import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';
import { canvasToPngBlob, drawCoverImage, wrapTextLines } from '@/lib/share/posterCanvas';

export type FragmentPosterInput = {
  imageUrl: string;
  kicker: string;
  title: string;
  caption: string;
  width: number;
  height: number;
};

/** 单景点静态海报：大图 + 底部短句，不印多日路线、预算、网址、二维码 */
export async function renderFragmentPoster(input: FragmentPosterInput): Promise<Blob> {
  const { width: w, height: h } = input;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布');
  }

  ctx.fillStyle = '#f9f7ef';
  ctx.fillRect(0, 0, w, h);
  await drawCoverImage(ctx, input.imageUrl, 0, 0, w, h, 0);

  const bandH = Math.round(h * 0.28);
  const bandY = h - bandH;
  const fade = ctx.createLinearGradient(0, bandY, 0, h);
  fade.addColorStop(0, 'rgba(34, 44, 40, 0)');
  fade.addColorStop(0.35, 'rgba(34, 44, 40, 0.55)');
  fade.addColorStop(1, 'rgba(34, 44, 40, 0.88)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, bandY, w, bandH);

  const kicker = sanitizePosterOverlayText(input.kicker).slice(0, 16);
  const title = sanitizePosterOverlayText(input.title);
  const caption = sanitizePosterOverlayText(input.caption);
  const pad = Math.round(w * 0.07);
  let textY = bandY + Math.round(bandH * 0.32);
  ctx.fillStyle = '#d9c8b4';
  ctx.font = `600 ${Math.max(14, Math.round(w * 0.032))}px system-ui, sans-serif`;
  ctx.fillText(kicker, pad, textY);

  textY += Math.round(h * 0.055);
  ctx.fillStyle = '#f9f7ef';
  ctx.font = `700 ${Math.max(22, Math.round(w * 0.058))}px system-ui, sans-serif`;
  wrapTextLines(ctx, title, w - pad * 2, 2).forEach((line) => {
    ctx.fillText(line, pad, textY);
    textY += Math.round(h * 0.05);
  });

  ctx.fillStyle = '#e8efe9';
  ctx.font = `500 ${Math.max(14, Math.round(w * 0.034))}px system-ui, sans-serif`;
  wrapTextLines(ctx, caption, w - pad * 2, 2).forEach((line) => {
    ctx.fillText(line, pad, textY);
    textY += Math.round(h * 0.038);
  });

  ctx.fillStyle = 'rgba(249, 247, 239, 0.72)';
  ctx.font = `500 ${Math.max(12, Math.round(w * 0.028))}px system-ui, sans-serif`;
  ctx.fillText('蜗牛旅行', pad, h - Math.round(h * 0.035));

  return canvasToPngBlob(canvas);
}
