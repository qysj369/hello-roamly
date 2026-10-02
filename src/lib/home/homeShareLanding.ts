import { parseShareAttribution } from '@/lib/share/analytics/shareLink';
import type { ShareAttribution } from '@/types/domain/shareAnalytics';

export function searchShareContentId(targetCity?: string | null): string {
  const city = targetCity?.trim();
  return city ? `search-${city}` : 'search-home';
}

export function cityFromSearchShareContentId(contentId: string): string | null {
  if (!contentId.startsWith('search-')) return null;
  const city = contentId.slice('search-'.length).trim();
  if (!city || city === 'home') return null;
  return city;
}

export function readHomeShareLanding(search: string): ShareAttribution | null {
  return parseShareAttribution(search);
}

export type ShareLandingPlanHint = {
  city: string | null;
  days: number | null;
  party: string | null;
  suggestedQuery: string;
};

/** 海报落地：读 city/days/party，或从 sid=search-城市 还原目的地 */
export function readShareLandingPlanHint(search: string): ShareLandingPlanHint {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const attribution = parseShareAttribution(search);
  const city =
    params.get('city')?.trim() ||
    (attribution ? cityFromSearchShareContentId(attribution.contentId) : null);
  const daysRaw = Number.parseInt(params.get('days') ?? '', 10);
  const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : null;
  const party = params.get('party')?.trim() || null;
  const bits = [city, days ? `${days}天` : '', party].filter(Boolean);
  return {
    city: city || null,
    days,
    party,
    suggestedQuery: bits.join(''),
  };
}

const SHARE_LANDING_OPENED_PREFIX = 'holo-share-landing-opened:';

export function hasOpenedShareLanding(search: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(`${SHARE_LANDING_OPENED_PREFIX}${search}`) === '1';
  } catch {
    return false;
  }
}

export function markShareLandingOpened(search: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`${SHARE_LANDING_OPENED_PREFIX}${search}`, '1');
  } catch {
    /* private mode */
  }
}
