import { cn } from '@/utils/cn';

type HomeMapTrailWallSkeletonProps = {
  className?: string;
};

/** 地图轨迹墙懒加载占位 — 保持首屏高度，避免布局跳动 */
export default function HomeMapTrailWallSkeleton({ className }: HomeMapTrailWallSkeletonProps) {
  return (
    <div
      className={cn(
        'relative min-h-[min(72vh,640px)] w-full overflow-hidden rounded-none bg-slate-900 sm:min-h-[min(68vh,720px)]',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
      <p className="absolute inset-x-0 bottom-6 text-center text-xs text-slate-400">地图加载中…</p>
    </div>
  );
}
