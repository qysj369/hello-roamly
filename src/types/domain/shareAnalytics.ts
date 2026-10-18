export type ShareContentKind =
  | 'travel_plan'
  | 'saved_user_plan'
  | 'guide'
  | 'travel_moment'
  | 'user_profile';

/** 分享渠道 / 样式 */
export type ShareChannel = 'wechat' | 'xhs' | 'douyin' | 'link' | 'native' | 'unknown';

/** 分享行为 */
export type ShareAction =
  | 'share_dialog_open'
  | 'share_native'
  | 'share_copy_link'
  | 'share_copy_xhs_text'
  | 'poster_download'
  | 'poster_download_all'
  | 'poster_variant_view'
  | 'share_landing_view';

export type ShareTrackEvent = {
  id: string;
  timestamp: string;
  contentKind: ShareContentKind;
  contentId: string;
  action: ShareAction;
  channel: ShareChannel;
  shareUrl?: string;
  slideCount?: number;
  meta?: Record<string, string>;
};

export type ShareTrackingContext = {
  contentKind: ShareContentKind;
  contentId: string;
  channel?: ShareChannel;
};

export type ShareAttribution = ShareTrackingContext & {
  channel: ShareChannel;
};

export type ShareStatsSummary = {
  totalEvents: number;
  shareAttempts: number;
  posterDownloads: number;
  landingViews: number;
  byAction: Partial<Record<ShareAction, number>>;
  byChannel: Partial<Record<ShareChannel, number>>;
  byContentKind: Partial<Record<ShareContentKind, number>>;
  recent: ShareTrackEvent[];
};
