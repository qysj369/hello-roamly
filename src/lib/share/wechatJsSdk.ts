import { resolveSiteOrigin } from '@/lib/seo/config';

type WechatJsBridge = {
  config: (cfg: {
    debug: boolean;
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
    jsApiList: string[];
  }) => void;
  ready: (cb: () => void) => void;
  updateAppMessageShareData: (data: WechatShareCard) => void;
  updateTimelineShareData: (data: WechatShareCard) => void;
};

export type WechatShareCard = {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
};

function getWx(): WechatJsBridge | undefined {
  return (window as Window & { wx?: WechatJsBridge }).wx;
}

function loadJweixin(): Promise<WechatJsBridge | undefined> {
  const existing = getWx();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.async = true;
    script.onload = () => resolve(getWx());
    script.onerror = () => resolve(undefined);
    document.head.appendChild(script);
  });
}

export function wechatShareCardImageUrl(): string {
  return `${resolveSiteOrigin()}/assets/snail-drag-earth.png`;
}

/** 微信内打开时定制右上角「···」分享卡片。未配置公众号密钥则静默跳过。 */
export async function configureWechatJsShare(card: WechatShareCard): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const pageUrl = window.location.href.split('#')[0] ?? window.location.href;
  let payload: {
    enabled?: boolean;
    appId?: string;
    timestamp?: number;
    nonceStr?: string;
    signature?: string;
  };
  try {
    const response = await fetch(`/api/wechat/js-config?url=${encodeURIComponent(pageUrl)}`);
    payload = (await response.json()) as typeof payload;
  } catch {
    return false;
  }
  if (!payload.enabled || !payload.appId || !payload.signature || !payload.nonceStr || !payload.timestamp) {
    return false;
  }

  const wx = await loadJweixin();
  if (!wx) return false;

  return new Promise((resolve) => {
    wx.config({
      debug: false,
      appId: payload.appId!,
      timestamp: payload.timestamp!,
      nonceStr: payload.nonceStr!,
      signature: payload.signature!,
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
    });
    wx.ready(() => {
      const data = {
        title: card.title,
        desc: card.desc,
        link: card.link,
        imgUrl: card.imgUrl || wechatShareCardImageUrl(),
      };
      wx.updateAppMessageShareData(data);
      wx.updateTimelineShareData(data);
      resolve(true);
    });
    window.setTimeout(() => resolve(false), 2500);
  });
}
