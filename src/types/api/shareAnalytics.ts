import type { ShareTrackEvent } from '@/types/domain/shareAnalytics';

/** POST /analytics/share/events */
export type IngestShareEventsRequest = {
  events: ShareTrackEvent[];
};

export type IngestShareEventsResponse = {
  accepted?: number;
};
