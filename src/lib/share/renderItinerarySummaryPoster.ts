import QRCode from 'qrcode';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';
import { BRAND_NAME } from '@/lib/config/brandCopy';
import { resolveItineraryDayPhoto } from '@/lib/home/resolveItineraryDayPhoto';
import { listSearchPlanSharePhotos } from '@/lib/home/searchPlanShareVisuals';
import { sanitizePosterOverlayText } from '@/lib/home/searchPlanShareChannels';
import { searchPlanLiteHeader, searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import {
  canvasToPngBlob,
  drawCoverImage,
  loadPosterImage,
  roundRect,
  wrapTextLines,
} from '@/lib/share/posterCanvas';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SummaryPosterKind = 'wechat' | 'xhs' | 'douyin';

const SIZES: Record<SummaryPosterKind, { width: number; height: number }> = {
  wechat: { width: 1080, height: 1080 },
  xhs: { width: 1080, height: 1440 },
  douyin: { width: 1080, height: 1920 },
};

function dayLine(day: SearchStructuredPlan['dayList'][number]): string {
  const spots = day.spots.map((spot) => spot.name.trim()).filter(Boolean).slice(0, 2).join(' · ');
  const food = day.foods[0];
  const foodBit = food ? `｜${food.shop}` : '';
  return sanitizePosterOverlayText(`D${day.day} ${spots || day.title}${foodBit}`).slice(0, 28);
}

function highlightLine(plan: SearchStructuredPlan): string {
  const spot = plan.dayList.flatMap((day) => day.spots).find((item) => item.intro.trim());
  const intro = spot?.intro.replace(/必体验[:：]?\s*/u, '').split(/[。；;]/u)[0]?.trim() ?? '';
  return sanitizePosterOverlayText(intro || '按自己的节奏慢慢逛').slice(0, 22);
}

/** 行程汇总海报：封面 + 三日预览 + 缩略图 + 亮点 + 二维码 */
export async function renderItinerarySummaryPoster(
  plan: SearchStructuredPlan,
  kind: SummaryPosterKind,
  shareUrl?: string,
): Promise<Blob> {
  const { width: w, height: h } = SIZES[kind];
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  const city = searchPlanShareCityName(plan);
  const used = new Set<string>();
  const kit = findHoloHomeCityKit(city);
  const sharePhotos = listSearchPlanSharePhotos(plan);
  const cover =
    sharePhotos[0]?.photoPath ||
    kit?.spots.find((spot) => spot.photoPath)?.photoPath ||
    kit?.coverPath ||
    '';
  const days = plan.dayList.slice(0, 3);
  const thumbs = sharePhotos.slice(1, 4).length
    ? sharePhotos.slice(1, 4).map((item) => ({ src: item.photoPath, alt: item.name }))
    : days.map((day) => resolveItineraryDayPhoto(plan, day, used));
  const qrTarget = shareUrl || 'https://helloroamly.com/';

  ctx.fillStyle = '#f4f0e6';
  ctx.fillRect(0, 0, w, h);

  const pad = Math.round(w * 0.05);
  const heroH = kind === 'wechat' ? Math.round(h * 0.38) : Math.round(h * 0.34);
  await drawCoverImage(ctx, cover, pad, pad, w - pad * 2, heroH, 28);

  ctx.fillStyle = 'rgba(34, 44, 40, 0.42)';
  ctx.fillRect(pad, pad + heroH - Math.round(heroH * 0.34), w - pad * 2, Math.round(heroH * 0.34));

  ctx.fillStyle = '#d9c8b4';
  ctx.font = `600 ${Math.round(w * 0.028)}px system-ui, sans-serif`;
  ctx.fillText(BRAND_NAME, pad + 28, pad + heroH - Math.round(heroH * 0.2));

  ctx.fillStyle = '#f9f7ef';
  ctx.font = `700 ${Math.round(w * 0.048)}px system-ui, sans-serif`;
  wrapTextLines(ctx, `${city}${plan.baseInfo.days}天慢游`, w - pad * 2 - 56, 1).forEach((line) => {
    ctx.fillText(line, pad + 28, pad + heroH - Math.round(heroH * 0.08));
  });

  let y = pad + heroH + Math.round(h * 0.035);
  ctx.fillStyle = '#285948';
  ctx.font = `600 ${Math.round(w * 0.026)}px system-ui, sans-serif`;
  ctx.fillText(searchPlanLiteHeader(plan), pad, y);

  y += Math.round(h * 0.028);
  ctx.fillStyle = '#444440';
  ctx.font = `500 ${Math.round(w * 0.028)}px system-ui, sans-serif`;
  ctx.fillText(highlightLine(plan), pad, y);

  y += Math.round(h * 0.03);
  const thumbW = Math.round((w - pad * 2 - 24) / 3);
  const thumbH = Math.round(thumbW * 0.72);
  for (let index = 0; index < 3; index += 1) {
    const x = pad + index * (thumbW + 12);
    roundRect(ctx, x, y, thumbW, thumbH, 16);
    ctx.fillStyle = '#e8e6e0';
    ctx.fill();
    const thumb = thumbs[index];
    if (thumb) await drawCoverImage(ctx, thumb.src, x, y, thumbW, thumbH, 16);
    ctx.fillStyle = '#222c28';
    ctx.font = `700 ${Math.round(w * 0.022)}px system-ui, sans-serif`;
    ctx.fillText(`D${index + 1}`, x + 10, y + thumbH - 12);
  }

  y += thumbH + Math.round(h * 0.028);
  ctx.fillStyle = '#222c28';
  ctx.font = `600 ${Math.round(w * 0.03)}px system-ui, sans-serif`;
  days.forEach((day) => {
    wrapTextLines(ctx, dayLine(day), w - pad * 2 - (kind === 'wechat' ? 200 : 0), 1).forEach((line) => {
      ctx.fillText(line, pad, y);
      y += Math.round(h * 0.038);
    });
  });

  const qrSize = kind === 'wechat' ? 168 : 188;
  const qrX = w - pad - qrSize;
  const qrY = h - pad - qrSize - Math.round(h * 0.05);
  const qrData = await QRCode.toDataURL(qrTarget, {
    width: qrSize,
    margin: 1,
    color: { dark: '#222c28', light: '#ffffff' },
  });
  const qrImage = await loadPosterImage(qrData);
  ctx.fillStyle = '#fffffb';
  roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 18);
  ctx.fill();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#5a6f66';
  ctx.font = `500 ${Math.round(w * 0.022)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('扫码看完整路线参考', qrX + qrSize, qrY + qrSize + Math.round(h * 0.028));
  ctx.textAlign = 'left';
  ctx.fillText('蜗牛旅行', pad, qrY + qrSize + Math.round(h * 0.028));

  return canvasToPngBlob(canvas);
}
