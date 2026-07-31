import { useMemo } from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import DiscoverRecommendBadge from '@/components/features/discover/DiscoverRecommendBadge';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { paths } from '@/router/paths';
import { getDiscoverHotPicks, getHotPickHref, resolveHotPickPreview } from '@/utils/discoverHotPicks';
import { getDiscoverCardCoverAlt } from '@/utils/imageAlt';

/** 首页精选条 — 从发现页策展，引导用户浏览灵感 */
export default function HomeFeaturedStrip() {
  const previews = useMemo(
    () =>
      getDiscoverHotPicks(6)
        .map((item) => resolveHotPickPreview(item))
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    [],
  );

  if (previews.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-featured-title" className="w-full">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-violet-700">编辑策展</p>
          <h2 id="home-featured-title" className="mt-0.5 text-base font-bold text-slate-900 sm:text-lg">
            今日值得看
          </h2>
          <p className="mt-1 text-xs text-slate-500">蜗友真实路线与计划 · 点卡片直接阅读</p>
        </div>
        <Link
          to={paths.discover}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-violet-700 hover:underline"
        >
          <Compass className="h-4 w-4" aria-hidden />
          去发现
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
        {previews.map((pick, index) => (
          <Link
            key={pick.item.id}
            to={getHotPickHref(pick.item)}
            className="group relative w-[min(44vw,200px)] shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:shrink"
          >
            <div className="aspect-[3/4] w-full">
              <OptimizedImage
                src={pick.coverUrl}
                alt={getDiscoverCardCoverAlt(pick.badge, pick.title)}
                fill
                priority={index < 2}
                sizes="200px"
                className="opacity-90 transition group-hover:scale-[1.03] group-hover:opacity-100"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute left-2 right-2 top-2 flex items-start justify-between gap-1">
              <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-slate-900">
                {pick.badge}
              </span>
              <DiscoverRecommendBadge
                score={pick.item.recommendScore}
                reasons={pick.item.recommendReasons}
                interactive
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-2.5 text-white">
              <p className="line-clamp-2 text-xs font-semibold leading-snug">{pick.title}</p>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-white/75">{pick.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
