import { isShareAnalyticsEnabled } from '@/lib/share/analytics/config';
import { appendShareEvent } from '@/lib/share/analytics/store';
import { ingestShareEvents } from '@/services/share/shareAnalyticsApi';
import type {
  ShareAction,
  ShareChannel,
  ShareContentKind,
  ShareTrackEvent,
  ShareTrackingContext,
} from '@/types/domain/shareAnalytics';

export type TrackShareEventInput = ShareTrackingContext & {
  action: ShareAction;
  channel?: ShareChannel;
  shareUrl?: string;
  slideCount?: number;
  meta?: Record<string, string>;
};

function createEventId(): string {
  return `shr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function trackShareEvent(input: TrackShareEventInput): ShareTrackEvent | null {
  if (!isShareAnalyticsEnabled()) {
    return null;
  }

  const event: ShareTrackEvent = {
    id: createEventId(),
    timestamp: new Date().toISOString(),
    contentKind: input.contentKind,
    contentId: input.contentId,
    action: input.action,
    channel: input.channel ?? 'unknown',
    shareUrl: input.shareUrl,
    slideCount: input.slideCount,
    meta: input.meta,
  };

  appendShareEvent(event);
  void ingestShareEvents([event]);

  return event;
}

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export function trackShareOutcome(
  context: ShareTrackingContext,
  outcome: ShareOutcome,
  options?: { channel?: ShareChannel; shareUrl?: string },
): void {
  if (outcome === 'cancelled' || outcome === 'failed') {
    return;
  }

  trackShareEvent({
    ...context,
    action: outcome === 'shared' ? 'share_native' : 'share_copy_link',
    channel: options?.channel ?? (outcome === 'shared' ? 'native' : 'link'),
    shareUrl: options?.shareUrl,
  });
}

export function trackShareLandingView(attribution: {
  contentKind: ShareContentKind;
  contentId: string;
  channel: ShareChannel;
  shareUrl?: string;
}): void {
  const landingKey = `share-landing-${attribution.contentKind}-${attribution.contentId}-${attribution.channel}`;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(landingKey)) {
    return;
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(landingKey, '1');
  }

  trackShareEvent({
    ...attribution,
    action: 'share_landing_view',
    channel: attribution.channel,
    shareUrl: attribution.shareUrl,
  });
}
