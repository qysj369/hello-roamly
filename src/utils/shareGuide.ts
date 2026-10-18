import { trackShareOutcome } from '@/lib/share/analytics/trackShareEvent';
import { withBrandShareTitle } from '@/lib/config/brandMindshare';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { guideDetailPath } from '@/router/paths';
import type { Guide } from '@/types/domain/guide';

export type ShareGuideResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export function getGuideShareSummary(guide: Guide): string {
  const tags = guide.tags.slice(0, 3).join(' · ');
  return `${guide.title} · ${guide.city} · ${guide.budget} · ${guide.days}${tags ? ` · ${tags}` : ''}`;
}

export async function shareGuide(guide: Guide): Promise<ShareGuideResult> {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const tracking = { contentKind: 'guide' as const, contentId: guide.id };
  const url = buildShareUrl(guideDetailPath(guide.id), tracking);
  const text = getGuideShareSummary(guide);
  const title = withBrandShareTitle(guide.title);

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      const result = 'shared' as const;
      trackShareOutcome(tracking, result, { channel: 'native', shareUrl: url });
      return result;
    }
    await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
    const result = 'copied' as const;
    trackShareOutcome(tracking, result, { channel: 'link', shareUrl: url });
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      const result = 'copied' as const;
      trackShareOutcome(tracking, result, { channel: 'link', shareUrl: url });
      return result;
    } catch {
      return 'failed';
    }
  }
}
