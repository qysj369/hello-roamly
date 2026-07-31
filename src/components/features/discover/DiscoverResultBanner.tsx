import { ChevronDown, Sparkles } from 'lucide-react';
import type { DiscoverFilters } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

type DiscoverResultBannerProps = {
  filters: DiscoverFilters;
  total: number;
  onJumpToFeed: () => void;
  onRelax?: () => void;
  className?: string;
};

function summarizeFilters(filters: DiscoverFilters): string {
  const parts: string[] = [];
  if (filters.destination) {
    parts.push(filters.destination);
  }
  if (filters.q.trim()) {
    parts.push(filters.q.trim());
  }
  if (filters.contentType === 'moment') {
    parts.push('旅行瞬间');
  } else if (filters.contentType === 'guide') {
    parts.push('攻略');
  } else if (filters.contentType === 'plan') {
    parts.push('旅行计划');
  }
  return parts.join(' · ') || '当前筛选';
}

export default function DiscoverResultBanner({
  filters,
  total,
  onJumpToFeed,
  onRelax,
  className,
}: DiscoverResultBannerProps) {
  const label = summarizeFilters(filters);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-3 shadow-sm',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-violet-900">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
          {total > 0 ? `找到 ${total} 条相关内容` : '这组筛选暂无内容'}
        </p>
        <p className="mt-0.5 truncate text-xs text-violet-700/80">{label}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {total > 0 ? (
          <button
            type="button"
            onClick={onJumpToFeed}
            className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            查看内容
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        ) : onRelax ? (
          <button
            type="button"
            onClick={onRelax}
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            放宽筛选
          </button>
        ) : null}
      </div>
    </div>
  );
}
