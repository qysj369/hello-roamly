import { http } from '@/lib/api/http';
import { hasShareAnalyticsBackend, isShareAnalyticsEnabled } from '@/lib/share/analytics/config';
import { SHARE_ANALYTICS_API } from '@/services/share/paths';
import type { IngestShareEventsRequest } from '@/types/api/shareAnalytics';
import type { ShareTrackEvent } from '@/types/domain/shareAnalytics';

/** 上报分享事件；无后端时仅本地存储（已在 trackShareEvent 写入） */
export async function ingestShareEvents(events: ShareTrackEvent[]): Promise<void> {
  if (!isShareAnalyticsEnabled() || events.length === 0) {
    return;
  }
  if (!hasShareAnalyticsBackend()) {
    return;
  }

  try {
    const body: IngestShareEventsRequest = { events };
    await http.post(SHARE_ANALYTICS_API.events, body);
  } catch {
    // TODO: 正式环境应重试或写入离线队列，避免静默丢事件
  }
}
