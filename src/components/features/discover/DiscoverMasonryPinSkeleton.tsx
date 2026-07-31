import type { DiscoverPinSize } from '@/utils/discoverMasonry';
import { getDiscoverPinAspectClass } from '@/utils/discoverMasonry';
import { cn } from '@/utils/cn';

const SKELETON_SIZES: DiscoverPinSize[] = ['compact', 'standard', 'tall', 'standard', 'compact'];

export type DiscoverMasonryPinSkeletonProps = {
  count?: number;
  className?: string;
};

export default function DiscoverMasonryPinSkeleton({
  count = 6,
  className,
}: DiscoverMasonryPinSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const size = SKELETON_SIZES[index % SKELETON_SIZES.length]!;
        return (
          <div
            key={index}
            className={cn(
              'overflow-hidden rounded-2xl bg-slate-200/80 ring-1 ring-slate-200/80',
              getDiscoverPinAspectClass(size),
              className,
            )}
            aria-hidden
          >
            <div className="h-full w-full animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
          </div>
        );
      })}
    </>
  );
}
