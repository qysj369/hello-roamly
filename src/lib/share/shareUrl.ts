import { appendShareTrackingToUrl } from '@/lib/share/analytics/shareLink';
import { resolveSiteOrigin } from '@/lib/seo/config';
import type { ShareTrackingContext } from '@/types/domain/shareAnalytics';

/** 构建可分享的绝对 URL（可选附带分享归因参数） */
export function buildShareUrl(path: string, tracking?: ShareTrackingContext): string {
  const origin = resolveSiteOrigin();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = `${origin}${normalized}`;
  if (!tracking) {
    return base;
  }
  return appendShareTrackingToUrl(base, tracking);
}