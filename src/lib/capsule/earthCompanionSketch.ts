import { getEarthFlyDestination, type EarthFlyDestinationId } from '@/lib/capsule/earthFlyTo';

export const COMPANION_SKETCH_LOADING = '正在生成行程…';
export const COMPANION_SKETCH_FAIL_HINT = '这次没写出来，点按钮再试一次。';
export const COMPANION_SKETCH_BUTTON = '生成旅行行程';
export const COMPANION_SKETCH_RETRY = '再试一次';

export function buildCompanionSketchMessages(cityLabel: string): {
  system: string;
  user: string;
} {
  return {
    system:
      '你是蜗牛旅行的灵感规划助手。只写轻松结伴轻旅行灵感，不做票务、预订、下单、抢购或推销。用简短中文，分天写，不要表格、不要链接。',
    user: `为「${cityLabel}」写一份2-3天好友结伴轻旅行灵感。风格轻松治愈，适合结伴出游。不要机票酒店预订、门票抢购、下单或复杂交通衔接。每天2-4句，总长不超过420字。`,
  };
}

export function sanitizeCompanionSketchText(raw: string): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-z]*\n?/gi, '').replace(/```/g, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.slice(0, 1200);
}

export function isCompanionSketchCityId(id: string): id is EarthFlyDestinationId {
  return Boolean(getEarthFlyDestination(id));
}
