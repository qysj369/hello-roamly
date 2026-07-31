import { getWechatShareHint } from '@/lib/share/wechat';
import { getXhsShareHint } from '@/lib/share/xhs';
import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';

export function getSharePosterHint(
  activeVariant: SharePosterVariant | undefined,
  slideCount: number,
): string {
  if (!activeVariant) {
    return getWechatShareHint();
  }
  if (activeVariant.id === 'xhs') {
    return getXhsShareHint(slideCount || 1);
  }
  return activeVariant.hint;
}
