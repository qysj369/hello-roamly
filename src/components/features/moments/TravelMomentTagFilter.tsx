import { cn } from '@/utils/cn';

export type TravelMomentTagFilterProps = {
  tags: string[];
  activeTag: string | null;
  onChange: (tag: string | null) => void;
  className?: string;
};

export default function TravelMomentTagFilter({
  tags,
  activeTag,
  onChange,
  className,
}: TravelMomentTagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label="按标签筛选">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full border px-3 py-1 text-xs font-medium transition',
          activeTag === null
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
        )}
        aria-pressed={activeTag === null}
      >
        全部
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(activeTag === tag ? null : tag)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition',
            activeTag === tag
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
          )}
          aria-pressed={activeTag === tag}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
