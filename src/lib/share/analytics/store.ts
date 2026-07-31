import type {
  ShareAction,
  ShareChannel,
  ShareContentKind,
  ShareStatsSummary,
  ShareTrackEvent,
} from '@/types/domain/shareAnalytics';

const STORAGE_KEY = 'hello-roamly-share-analytics-v1';
const MAX_EVENTS = 400;

type ShareAnalyticsStore = {
  events: ShareTrackEvent[];
};

function readStore(): ShareAnalyticsStore {
  if (typeof window === 'undefined') {
    return { events: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { events: [] };
    }
    const parsed = JSON.parse(raw) as ShareAnalyticsStore;
    if (!Array.isArray(parsed.events)) {
      return { events: [] };
    }
    return parsed;
  } catch {
    return { events: [] };
  }
}

function writeStore(store: ShareAnalyticsStore): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // 存储满或隐私模式
  }
}

export function appendShareEvent(event: ShareTrackEvent): void {
  const store = readStore();
  store.events.unshift(event);
  if (store.events.length > MAX_EVENTS) {
    store.events.length = MAX_EVENTS;
  }
  writeStore(store);
}

export function listShareEvents(): ShareTrackEvent[] {
  return readStore().events;
}

export function clearShareEvents(): void {
  writeStore({ events: [] });
}

const SHARE_ATTEMPT_ACTIONS: ShareAction[] = [
  'share_native',
  'share_copy_link',
  'share_copy_xhs_text',
  'poster_download',
  'poster_download_all',
];

export function getShareStatsSummary(): ShareStatsSummary {
  const events = listShareEvents();
  const byAction: ShareStatsSummary['byAction'] = {};
  const byChannel: ShareStatsSummary['byChannel'] = {};
  const byContentKind: ShareStatsSummary['byContentKind'] = {};

  let shareAttempts = 0;
  let posterDownloads = 0;
  let landingViews = 0;

  for (const event of events) {
    byAction[event.action] = (byAction[event.action] ?? 0) + 1;
    byChannel[event.channel] = (byChannel[event.channel] ?? 0) + 1;
    byContentKind[event.contentKind] = (byContentKind[event.contentKind] ?? 0) + 1;

    if (SHARE_ATTEMPT_ACTIONS.includes(event.action)) {
      shareAttempts += 1;
    }
    if (event.action === 'poster_download' || event.action === 'poster_download_all') {
      posterDownloads += 1;
    }
    if (event.action === 'share_landing_view') {
      landingViews += 1;
    }
  }

  return {
    totalEvents: events.length,
    shareAttempts,
    posterDownloads,
    landingViews,
    byAction,
    byChannel,
    byContentKind,
    recent: events.slice(0, 12),
  };
}

export function formatShareContentKind(kind: ShareContentKind): string {
  const labels: Record<ShareContentKind, string> = {
    travel_plan: 'AI 行程',
    saved_user_plan: '我的方案',
    guide: '攻略',
    travel_moment: '动态',
    user_profile: '主页',
  };
  return labels[kind];
}

export function formatShareAction(action: ShareAction): string {
  const labels: Record<ShareAction, string> = {
    share_dialog_open: '打开分享图',
    share_native: '系统分享',
    share_copy_link: '复制链接',
    share_copy_xhs_text: '复制小红书文案',
    poster_download: '保存海报',
    poster_download_all: '保存全部配图',
    poster_variant_view: '切换海报样式',
    share_landing_view: '打开分享链接',
  };
  return labels[action];
}

export function formatShareChannel(channel: ShareChannel): string {
  const labels: Record<ShareChannel, string> = {
    wechat: '微信',
    xhs: '小红书',
    link: '链接',
    native: '系统',
    unknown: '未知',
  };
  return labels[channel];
}
