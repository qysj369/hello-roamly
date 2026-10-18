import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getHotPickHref, resolveHotPickPreview } from '@/utils/discoverHotPicks';
import DiscoverRecommendBadge from '@/components/features/discover/DiscoverRecommendBadge';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { RecommendedDiscoverItem } from '@/types/domain/discover';
import { paths } from '@/router/paths';
import { getDiscoverCardCoverAlt } from '@/utils/imageAlt';
import { cn } from '@/utils/cn';

export type DiscoverHotSpotlightProps = {
  items: RecommendedDiscoverItem[];
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function DiscoverHotSpotlight({
  items,
  title = '热门推荐',
  subtitle,
  className,
}: DiscoverHotSpotlightProps) {
  const previews = items
    .map((item) => resolveHotPickPreview(item))
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);

  if (previews.length === 0) {
    return null;
  }

  return (
    <section className={cn('space-y-3', className)} aria-labelledby="discover-hot-title">
      <div className="flex items-center justify-between gap-2">
        <h2
          id="discover-hot-title"
          className="flex items-center gap-1.5 text-base font-semibold text-slate-900 sm:text-sm"
        >
          <Flame className="h-4 w-4 text-orange-500" aria-hidden />
          {title}
        </h2>
        <Link to={paths.guides} className="text-xs font-medium text-[#2c6b58] hover:underline">
          更多攻略
        </Link>
      </div>
      {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {previews.map((pick, index) => (
          <Link
            key={pick.item.id}
            to={getHotPickHref(pick.item)}
            className="group relative w-[min(72vw,280px)] shrink-0 overflow-hidden rounded-xl border border-[#b7cdc4] bg-slate-900 shadow-none transition hover:border-[#2c6b58] md:w-auto md:shrink"
          >
            <div className="aspect-[4/5] w-full">
              <OptimizedImage
                src={pick.coverUrl}
                alt={getDiscoverCardCoverAlt(pick.badge, pick.title)}
                fill
                priority={index < 2}
                sizes="280px"
                className="opacity-90 transition group-hover:scale-[1.03] group-hover:opacity-100"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute left-3 right-3 top-3 flex flex-wrap items-start justify-between gap-1">
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                {pick.badge}
              </span>
              <DiscoverRecommendBadge
                score={pick.item.recommendScore}
                reasons={pick.item.recommendReasons}
                interactive
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{pick.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-white/80">{pick.subtitle}</p>
            </div>
          </Link>
        ))}
        <span className="inline-flex shrink-0 items-center self-center text-[10px] text-slate-400 md:hidden">
          ← 左右滑动
        </span>
      </div>
    </section>
  );
}
