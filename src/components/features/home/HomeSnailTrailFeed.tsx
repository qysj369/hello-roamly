import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HomeGuideCard from '@/components/features/home/HomeGuideCard';
import { useFilteredGuides } from '@/hooks';
import { HOME_CONSTITUTION } from '@/lib/config/homeConstitution';
import { extractSearchDestination } from '@/lib/map/parseTrailSearchQuery';
import { useHomeMapPlanningBarStore } from '@/stores/homeMapPlanningBar/store';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';
import { filterGuidesByDestination } from '@/utils/filterGuidesByDestination';
import { resolveGuideCardDisplay } from '@/utils/guideCardDisplay';

const HOME_TRAIL_PREVIEW_LIMIT = 6;

/** 最新蜗牛轨迹 — 与顶栏搜索联动，首页只展示精选预览 */
export default function HomeSnailTrailFeed() {
  const { guides, isLoading, total } = useFilteredGuides();
  const searchQuery = useHomeMapPlanningBarStore((state) => state.bar?.searchQuery ?? '');
  const guideCount = total || guides.length;

  const filteredGuides = useMemo(
    () => filterGuidesByDestination(guides, searchQuery),
    [guides, searchQuery],
  );

  const cards = useMemo(
    () => filteredGuides.map((guide) => resolveGuideCardDisplay(guide)),
    [filteredGuides],
  );
  const previewCards = cards.slice(0, HOME_TRAIL_PREVIEW_LIMIT);
  const hasMore = cards.length > HOME_TRAIL_PREVIEW_LIMIT;

  const destination = extractSearchDestination(searchQuery.trim());
  const subtitle = destination
    ? `与「${destination}」相关的真实穷游路线 · 首页展示 ${previewCards.length} 条`
    : `真实花费清单与行程流水账 · 全站已有 ${guideCount}+ 条黏液轨迹`;

  return (
    <section aria-labelledby="home-snail-trail-title" className="w-full">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-700">
            {HOME_CONSTITUTION.role}
          </p>
          <h2 id="home-snail-trail-title" className="mt-0.5 text-base font-bold text-slate-900 sm:text-lg">
            {destination ? `${destination} · 同类轨迹` : HOME_CONSTITUTION.feedTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Link
            to={paths.guides}
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            全部攻略
          </Link>
          {!destination ? (
            <Link
              to={paths.discover}
              className="text-xs font-medium text-violet-700 hover:underline"
            >
              去发现逛逛
            </Link>
          ) : null}
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-slate-500" aria-live="polite">
          加载攻略中…
        </p>
      )}

      {!isLoading && previewCards.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
          <p className="text-sm text-slate-500">{SNAIL_GLOBAL_COPY.emptyState}</p>
          <Link
            to={paths.discover}
            className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline"
          >
            去发现页看看热门灵感 →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {previewCards.map((card) => (
          <HomeGuideCard key={card.id} card={card} />
        ))}
      </div>

      {!isLoading && hasMore ? (
        <div className="mt-4 flex justify-center">
          <Link
            to={destination ? paths.guides : paths.discover}
            className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
          >
            {destination ? `查看全部 ${cards.length} 条轨迹` : '查看更多灵感'}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
