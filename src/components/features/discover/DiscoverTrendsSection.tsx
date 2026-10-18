import { Hash, MapPin, TrendingUp } from 'lucide-react';
import type { DiscoverTrendDestination, DiscoverTrendTag } from '@/utils/discoverTrends';
import { cn } from '@/utils/cn';

export type DiscoverTrendsSectionProps = {
  destinations: DiscoverTrendDestination[];
  tags: DiscoverTrendTag[];
  activeDestination?: string;
  activeQuery?: string;
  onDestinationSelect: (destination: string) => void;
  onTagSelect: (query: string) => void;
  className?: string;
};

function formatTrendCount(count: number): string {
  if (count >= 100) {
    return '99+';
  }
  return String(count);
}

type TrendChipProps = {
  label: string;
  count: number;
  rank: number;
  active: boolean;
  icon: typeof MapPin;
  onClick: () => void;
};

function TrendChip({ label, count, rank, active, icon: Icon, onClick }: TrendChipProps) {
  const showHot = rank <= 3;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition sm:px-3 sm:py-1.5 sm:text-xs',
        active
          ? 'border-[#2c6b58] bg-[#2c6b58] text-white shadow-sm scale-[1.02]'
          : 'border-slate-200 bg-white text-slate-700 hover:border-[#b7cdc4] hover:bg-emerald-50/60 active:scale-95',
      )}
      aria-pressed={active}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
        )}
      >
        {formatTrendCount(count)}
      </span>
      {showHot && !active && (
        <span className="text-[10px] text-orange-500" aria-hidden>
          🔥
        </span>
      )}
    </button>
  );
}

export default function DiscoverTrendsSection({
  destinations,
  tags,
  activeDestination = '',
  activeQuery = '',
  onDestinationSelect,
  onTagSelect,
  className,
}: DiscoverTrendsSectionProps) {
  const normalizedQuery = activeQuery.trim();

  return (
    <section className={cn('space-y-4', className)} aria-labelledby="discover-trends-title">
      <div>
        <h2
          id="discover-trends-title"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"
        >
          <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
          快速筛选
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          点城市或标签切换下方瀑布流 · 再点一次取消
        </p>
      </div>

      {destinations.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-orange-500" aria-hidden />
            有内容的目的地
          </p>
          <div className="flex flex-wrap gap-2">
            {destinations.map((item) => (
              <TrendChip
                key={item.value}
                label={item.label}
                count={item.count}
                rank={item.rank}
                icon={MapPin}
                active={activeDestination === item.value}
                onClick={() =>
                  onDestinationSelect(activeDestination === item.value ? '' : item.value)
                }
              />
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-600">
            <Hash className="h-3.5 w-3.5 text-[#54786c]" aria-hidden />
            热门标签
          </p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tags.map((item) => (
              <TrendChip
                key={item.label}
                label={item.label}
                count={item.count}
                rank={item.rank}
                icon={Hash}
                active={normalizedQuery === item.label}
                onClick={() =>
                  onTagSelect(normalizedQuery === item.label ? '' : item.label)
                }
              />
            ))}
            <span className="inline-flex shrink-0 items-center self-center text-[10px] text-slate-400">
              ← 左右滑动
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
