import { ArrowDownWideNarrow, Sparkles } from 'lucide-react';
import type { DiscoverSortMode } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

export type DiscoverSortToggleProps = {
  value: DiscoverSortMode;
  onChange: (mode: DiscoverSortMode) => void;
  className?: string;
};

const OPTIONS: Array<{
  id: DiscoverSortMode;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { id: 'recommend', label: '智能推荐', Icon: Sparkles },
  { id: 'recent', label: '最新发布', Icon: ArrowDownWideNarrow },
];

export default function DiscoverSortToggle({ value, onChange, className }: DiscoverSortToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5',
        className,
      )}
      role="group"
      aria-label="内容排序"
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'inline-flex min-h-10 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-xs',
              active
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
