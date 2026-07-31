import { APP_NAME, BRAND_TAGLINE } from '@/lib/config/brand';

/** 可在 .env 设置 VITE_SITE_URL=https://your-domain.com */
export function resolveSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://helloroamly.com';
}

export const SITE_NAME = APP_NAME;
export const SITE_TAGLINE = BRAND_TAGLINE;

export const DEFAULT_SITE_DESCRIPTION =
  'HelloRoamly（蜗牛旅行 · helloroamly.com）— 攻略、旅行计划与旅人瞬间，一站发现灵感。支持 AI 行程顾问、地图足迹与兴趣推荐。';

/** Open Graph 默认封面（1200×630） */
export const DEFAULT_OG_IMAGE_URL =
  'https://images.unsplash.com/photo-1469854523086-cc02afe44c9f?w=1200&h=630&fit=crop&q=80';

export const TWITTER_SITE = '@helloroamly';
