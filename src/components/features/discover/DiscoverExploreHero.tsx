import { Compass, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDiscoverHotPicks,
  getHotPickHref,
  resolveHotPickPreview,
} from '@/utils/discoverHotPicks';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/utils/cn';

const TEASERS = [
  '有人刚分享了隐藏玩法',
  '漫行也能很精彩',
  '下一站在哪里？点一下就知道',
  '慢下来，发现不一样的风景',
];

export type DiscoverExploreHeroProps = {
  destinations: string[];
  onSurprise: (destination: string) => void;
  compact?: boolean;
  className?: string;
};

export default function DiscoverExploreHero({
  destinations,
  onSurprise,
  compact = false,
  className,
}: DiscoverExploreHeroProps) {
  const hotPicks = useMemo(() => getDiscoverHotPicks(12), []);
  const previews = useMemo(
    () =>
      hotPicks
        .map((item) => resolveHotPickPreview(item))
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    [hotPicks],
  );

  const [teaserIndex, setTeaserIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentPreview = previews[previewIndex % Math.max(previews.length, 1)];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTeaserIndex((index) => (index + 1) % TEASERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const handleSurprise = useCallback(() => {
    if (destinations.length === 0) {
      return;
    }

    setIsAnimating(true);
    const nextDestIndex = Math.floor(Math.random() * destinations.length);
    const nextPreview = Math.floor(Math.random() * Math.max(previews.length, 1));
    setPreviewIndex(nextPreview);
    onSurprise(destinations[nextDestIndex] ?? destinations[0]!);

    window.setTimeout(() => setIsAnimating(false), 600);
  }, [destinations, onSurprise, previews.length]);

  if (!currentPreview) {
    return null;
  }

  const previewHref = getHotPickHref(currentPreview.item);

  if (compact) {
    return (
      <section
        className={cn(
          'flex items-center gap-3 rounded-xl border border-[#b7cdc4] bg-gradient-to-r from-[#2c6b58] to-[#54786c] px-3 py-2.5 text-white shadow-sm',
          className,
        )}
        aria-label="今日盲盒"
      >
        <Link
          to={previewHref}
          className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/20"
        >
          <OptimizedImage
            src={currentPreview.coverUrl}
            alt={currentPreview.title}
            fill
            sizes="56px"
            className="transition duration-300 group-hover:scale-110"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white/90">今日盲盒</p>
          <p className="truncate text-sm font-bold">{currentPreview.title}</p>
        </div>
        <button
          type="button"
          onClick={handleSurprise}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#2c6b58] hover:bg-emerald-50"
        >
          <Compass className={cn('h-3.5 w-3.5', isAnimating && 'animate-spin')} aria-hidden />
          换一个
        </button>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#b7cdc4] bg-gradient-to-br from-[#2c6b58] via-[#3d7f6a] to-[#54786c] p-4 text-white shadow-sm sm:p-5',
        className,
      )}
      aria-labelledby="discover-explore-title"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-orange-300/20 blur-2xl" aria-hidden />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          to={previewHref}
          className={cn(
            'group relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-white/20 shadow-sm transition sm:aspect-[3/4] sm:w-36',
            isAnimating && 'ring-2 ring-white/60',
          )}
          aria-label={`阅读：${currentPreview.title}`}
        >
          <OptimizedImage
            src={currentPreview.coverUrl}
            alt={currentPreview.title}
            fill
            sizes="144px"
            className="transition duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#2c6b58]">
            {currentPreview.badge}
          </span>
          <span className="absolute inset-x-0 bottom-0 p-2 text-left text-xs font-semibold leading-snug">
            {currentPreview.title}
          </span>
          <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
            点开读 →
          </span>
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 id="discover-explore-title" className="flex items-center gap-1.5 text-lg font-bold sm:text-base">
              <Sparkles className="h-5 w-5 text-yellow-200" aria-hidden />
              今日盲盒
            </h2>
            <p className="mt-1 text-sm text-white/90 transition-opacity duration-300 sm:text-xs">
              {TEASERS[teaserIndex]}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSurprise}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#2c6b58] shadow-sm transition hover:scale-[1.02] hover:bg-emerald-50 active:scale-[0.98] sm:min-h-0 sm:px-4 sm:py-2 sm:text-xs"
            >
              <Compass className={cn('h-4 w-4', isAnimating && 'animate-spin')} aria-hidden />
              随机换一座城
            </button>
            <Link
              to={previewHref}
              className="inline-flex min-h-11 items-center rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:min-h-0 sm:py-2 sm:text-xs"
            >
              先看这篇
            </Link>
          </div>

          <p className="text-xs text-white/75 sm:text-[11px]">
            左图可直接阅读 · 按钮帮你随机探索 {destinations.length} 个目的地
          </p>
        </div>
      </div>
    </section>
  );
}
