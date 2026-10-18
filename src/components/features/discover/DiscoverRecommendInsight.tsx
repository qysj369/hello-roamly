import { useState } from 'react';
import { Info, Sparkles } from 'lucide-react';
import DiscoverRecommendExplainDialog from '@/components/features/discover/DiscoverRecommendExplainDialog';
import type { DiscoverSortMode } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

export type DiscoverRecommendInsightProps = {
  interestSummary: string;
  sortMode: DiscoverSortMode;
  className?: string;
};

export default function DiscoverRecommendInsight({
  interestSummary,
  sortMode,
  className,
}: DiscoverRecommendInsightProps) {
  const [explainOpen, setExplainOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-2 rounded-xl border border-[#b7cdc4] bg-gradient-to-r from-emerald-50 to-[#fffef6] px-3 py-2.5',
          className,
        )}
      >
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#2c6b58]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-900">
            {sortMode === 'recommend'
              ? `根据 ${interestSummary} 等兴趣为你排序`
              : '按发布时间展示，推荐角标仅供参考'}
          </p>
          <button
            type="button"
            onClick={() => setExplainOpen(true)}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#2c6b58] hover:underline"
          >
            <Info className="h-3 w-3" aria-hidden />
            了解推荐逻辑
          </button>
        </div>
      </div>

      <DiscoverRecommendExplainDialog open={explainOpen} onClose={() => setExplainOpen(false)} />
    </>
  );
}
