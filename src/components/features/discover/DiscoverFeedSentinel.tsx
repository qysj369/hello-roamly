import { Loader2 } from 'lucide-react';
import type { Ref, RefObject } from 'react';

type DiscoverFeedSentinelProps = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
  hasMore: boolean;
  showSentinel: boolean;
  feedHasItems: boolean;
};

export default function DiscoverFeedSentinel({
  sentinelRef,
  isLoadingMore,
  hasMore,
  showSentinel,
  feedHasItems,
}: DiscoverFeedSentinelProps) {
  if (!showSentinel) {
    return null;
  }

  return (
    <div className="py-2">
      <div ref={sentinelRef as Ref<HTMLDivElement>} className="h-px w-full" aria-hidden />
      {isLoadingMore && (
        <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#2c6b58]" aria-hidden />
          加载更多内容…
        </p>
      )}
      {!isLoadingMore && !hasMore && feedHasItems && (
        <p className="text-center text-xs text-slate-400">计划与瞬间已加载完毕</p>
      )}
    </div>
  );
}
