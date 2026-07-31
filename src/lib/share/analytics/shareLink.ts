import type { ShareAttribution, ShareChannel, ShareContentKind } from '@/types/domain/shareAnalytics';
import { isShareAnalyticsEnabled } from '@/lib/share/analytics/config';

/** URL 查询参数（分享归因） */
export const SHARE_LINK_PARAMS = {
  from: 'from',
  fromShare: 'share',
  kind: 'sk',
  id: 'sid',
  channel: 'sch',
} as const;

const KIND_TO_CODE: Record<ShareContentKind, string> = {
  travel_plan: 'p',
  saved_user_plan: 's',
  guide: 'g',
  travel_moment: 'm',
  user_profile: 'u',
};

const CODE_TO_KIND: Record<string, ShareContentKind> = {
  p: 'travel_plan',
  s: 'saved_user_plan',
  g: 'guide',
  m: 'travel_moment',
  u: 'user_profile',
};

const CHANNEL_TO_CODE: Record<ShareChannel, string> = {
  wechat: 'w',
  xhs: 'x',
  link: 'l',
  native: 'n',
  unknown: 'u',
};

const CODE_TO_CHANNEL: Record<string, ShareChannel> = {
  w: 'wechat',
  x: 'xhs',
  l: 'link',
  n: 'native',
  u: 'unknown',
};

export function appendShareTrackingToUrl(
  url: string,
  context: { contentKind: ShareContentKind; contentId: string; channel?: ShareChannel },
): string {
  if (!isShareAnalyticsEnabled()) {
    return url;
  }

  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    parsed.searchParams.set(SHARE_LINK_PARAMS.from, SHARE_LINK_PARAMS.fromShare);
    parsed.searchParams.set(SHARE_LINK_PARAMS.kind, KIND_TO_CODE[context.contentKind]);
    parsed.searchParams.set(SHARE_LINK_PARAMS.id, context.contentId);
    parsed.searchParams.set(
      SHARE_LINK_PARAMS.channel,
      CHANNEL_TO_CODE[context.channel ?? 'link'],
    );
    return parsed.toString();
  } catch {
    return url;
  }
}

export function parseShareAttribution(search: string): ShareAttribution | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  if (params.get(SHARE_LINK_PARAMS.from) !== SHARE_LINK_PARAMS.fromShare) {
    return null;
  }

  const kindCode = params.get(SHARE_LINK_PARAMS.kind);
  const contentId = params.get(SHARE_LINK_PARAMS.id);
  const channelCode = params.get(SHARE_LINK_PARAMS.channel);

  if (!kindCode || !contentId) {
    return null;
  }

  const contentKind = CODE_TO_KIND[kindCode];
  if (!contentKind) {
    return null;
  }

  return {
    contentKind,
    contentId,
    channel: (channelCode && CODE_TO_CHANNEL[channelCode]) || 'unknown',
  };
}
