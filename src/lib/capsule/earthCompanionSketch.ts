import { getEarthFlyDestination, type EarthFlyDestinationId } from '@/lib/capsule/earthFlyTo';

export const COMPANION_SKETCH_LOADING = '正在生成行程…';
export const COMPANION_SKETCH_FAIL_HINT = '这次没写出来，点按钮再试一次。';
export const COMPANION_SKETCH_BUTTON = '生成旅行行程';
export const COMPANION_SKETCH_RETRY = '再试一次';

export function buildCompanionSketchMessages(
  cityLabel: string,
  cityBlurb?: string,
): {
  system: string;
  user: string;
} {
  const intro = cityBlurb?.trim()
    ? `面板简介（对齐事实，勿改成广告腔）：${cityBlurb.trim()}\n`
    : '';
  return {
    system:
      '你是蜗牛旅行的结伴出游灵感助手。只写可参考的轻旅行想法，严禁酒店、票务、组团、预订、下单、抢购或推销。写实，不刻意美化风景，不拔高预期；不把行程写成景点清单。把每天怎么走放进这座城市完整的人文背景里，文化阐释客观完整，拒绝套话。用简短中文分天写，不要表格、不要链接。',
    user: `${intro}为「${cityLabel}」写一份2-3天好友结伴轻旅行灵感。先用一两句交代这座城的生活与历史肌理，再写每天怎么走；人流、天气、海拔等如实写。不要机票酒店、门票、组团或复杂交通衔接。每天2-4句，总长不超过480字。`,
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
