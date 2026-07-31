import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

/** 详情页顶部核心数据标签：{目的地} · {N}天 · 人均¥{总计} */
export function formatStructuredGuideCoreTag(guide: AiSnailGuideResult): string {
  const destination = guide.destination.trim() || '—';
  const days = Math.max(1, guide.days);
  const total = guide.costBreakdown.total;
  return `${destination} · ${days}天 · 人均¥${total}`;
}
