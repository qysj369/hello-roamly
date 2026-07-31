import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { parseShareAttribution } from '@/lib/share/analytics/shareLink';
import { trackShareLandingView } from '@/lib/share/analytics/trackShareEvent';
import { isShareAnalyticsEnabled } from '@/lib/share/analytics/config';
import type { ShareContentKind } from '@/types/domain/shareAnalytics';

export type UseShareLandingTrackingOptions = {
  contentKind: ShareContentKind;
  contentId: string | undefined;
};

/** 详情页：识别分享链接参数并记录「打开分享链接」 */
export function useShareLandingTracking({
  contentKind,
  contentId,
}: UseShareLandingTrackingOptions): void {
  const location = useLocation();

  useEffect(() => {
    if (!isShareAnalyticsEnabled() || !contentId) {
      return;
    }

    const attribution = parseShareAttribution(location.search);
    if (!attribution) {
      return;
    }

    if (attribution.contentKind !== contentKind || attribution.contentId !== contentId) {
      return;
    }

    trackShareLandingView({
      contentKind: attribution.contentKind,
      contentId: attribution.contentId,
      channel: attribution.channel,
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [contentKind, contentId, location.search]);
}
