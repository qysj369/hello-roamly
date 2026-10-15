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
      '你是蜗牛旅行的结伴出游灵感助手。只写可参考的慢节奏好友结伴轻旅行，严禁酒店、票务、组团、预订、下单、抢购或推销。基调松弛治愈，文字要有氛围、画面和回味：每段写入光影、气味、风声或环境人声里的至少一处，并带一点当下情绪。拒绝华丽堆砌、网红浮夸、短句干巴巴、纯动作罗列和备忘录式流水账。写实，不刻意滤镜美化，不拔高预期。开头先写人文引子交代城市气质，再按天写「怎么走 + 环境与感受」。不要表格、不要链接。',
    user: `${intro}为「${cityLabel}」写一份2-3天好友结伴轻旅行灵感。先用两三句人文引子交代这座城的气质与生活肌理，不要一上来就列行程。随后按天写：每天不只写做什么，还要写出当时的环境氛围、感官细节和情绪，让文字停得住。人流、天气、海拔如实写，不要滤镜腔。不要机票酒店、门票、组团或复杂交通衔接。每天3-5句，总长不超过560字。`,
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
