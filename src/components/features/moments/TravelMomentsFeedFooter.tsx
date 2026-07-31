import { Loader2 } from 'lucide-react';
import type { Ref, RefObject } from 'react';
import { cn } from '@/utils/cn';

export type TravelMomentsFeedFooterProps = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
  isReady: boolean;
  itemCount: number;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
};

export default function TravelMomentsFeedFooter({
  sentinelRef,
  isLoading,
  hasMore,
  isReady,
  itemCount,
  error,
  onRetry,
  className,
}: TravelMomentsFeedFooterProps) {
  return (
    <div className={cn('py-4', className)}>
      <div ref={sentinelRef as Ref<HTMLDivElement>} className="h-px w-full" aria-hidden />

      {error && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              重试
            </button>
          )}
        </div>
      )}

      {!error && isLoading && (
        <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-violet-600" aria-hidden />
          加载中…
        </p>
      )}

      {!error && !isLoading && isReady && !hasMore && itemCount > 0 && (
        <p className="text-center text-xs text-slate-400">已加载全部瞬间</p>
      )}
    </div>
  );
}
