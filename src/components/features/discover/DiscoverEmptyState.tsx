import { cn } from '@/utils/cn';

type DiscoverEmptyStateProps = {
  className?: string;
};

export default function DiscoverEmptyState({ className }: DiscoverEmptyStateProps) {
  return (
    <p
      className={cn(
        'rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-500',
        className,
      )}
    >
      没有匹配的内容，试试调整搜索或筛选条件
    </p>
  );
}
