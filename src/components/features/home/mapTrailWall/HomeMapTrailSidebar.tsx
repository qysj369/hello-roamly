import { ChevronLeft, ChevronRight, ListOrdered, Tag } from 'lucide-react';

import { Link } from 'react-router-dom';

import { HOME_MAP_TRAIL } from '@/lib/config/homeMapTrail';

import { useHorizontalDragScroll } from '@/hooks/browser/useHorizontalDragScroll';

import type { TrailWallGuide } from '@/types/domain/trailWall';

import { guideDetailPath } from '@/router/paths';

import { cn } from '@/utils/cn';



type HomeMapTrailSidebarProps = {

  guides: TrailWallGuide[];

  highlightedTrailId: string | null;

  onPlanGuide: (guide: TrailWallGuide) => void;

  planning?: boolean;

};



function TrailGuideCard({

  guide,

  active,

  onPlanGuide,

  planning = false,

  compact = false,

}: {

  guide: TrailWallGuide;

  active: boolean;

  onPlanGuide: (guide: TrailWallGuide) => void;

  planning?: boolean;

  compact?: boolean;

}) {

  return (

    <div className={cn(compact ? 'w-[17rem] shrink-0 snap-start sm:w-[18rem]' : 'w-full')}>

      <button

        type="button"

        disabled={planning}

        onClick={() => onPlanGuide(guide)}

        className={cn(

          'home-map-trail-card w-full rounded-xl text-left transition disabled:cursor-not-allowed disabled:opacity-60',

          compact ? 'p-2.5' : 'p-3',

          active && 'home-map-trail-card--active',

        )}

        title="一键规划此路线"

      >

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <p className="home-map-trail-card__route text-[10px] font-medium">

              {guide.start_city} → {guide.end_city}

            </p>

            <h3
              className={cn(
                'home-map-trail-card__title mt-0.5 font-semibold',
                compact ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-sm',
              )}
            >

              {guide.title}

            </h3>

          </div>

          <span
            className={cn(
              'home-map-trail-card__budget inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px]',
              guide.budgetSource === 'cost_breakdown' &&
                'home-map-trail-card__budget--from-list',
            )}
            title={guide.budgetNote ?? `预算 ${guide.budget}`}
            aria-label={
              guide.budgetNote
                ? `预算 ${guide.budget}，${guide.budgetNote}`
                : `预算 ${guide.budget}`
            }
          >
            {guide.budgetSource === 'cost_breakdown' ? (
              <ListOrdered className="h-2.5 w-2.5 shrink-0 opacity-80" aria-hidden />
            ) : (
              <Tag className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />
            )}
            <span>{guide.budget}</span>
          </span>

        </div>

        {!compact ? (

          <>

            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">

              {guide.summary}

            </p>

            <p className="mt-1.5 text-[10px] text-slate-500">{guide.days} 天</p>

          </>

        ) : (

          <p className="home-map-trail-card__meta mt-1 text-[10px]">{guide.days} 天 · 点击一键规划</p>

        )}

      </button>

      {!compact ? (

        <Link

          to={guideDetailPath(guide.id)}

          className="mt-1 flex items-center gap-0.5 text-[10px] text-emerald-400 hover:underline"

          onClick={(event) => event.stopPropagation()}

        >

          查看详情

          <ChevronRight className="h-3 w-3" aria-hidden />

        </Link>

      ) : null}

    </div>

  );

}



/** 底部横向攻略条（全端统一：滚轮 / 拖动 / 箭头） */

export function HomeMapTrailMobileStrip({

  guides,

  highlightedTrailId,

  onPlanGuide,

  planning = false,

}: HomeMapTrailSidebarProps) {

  const { ref: scrollRef, scrollBy } = useHorizontalDragScroll();



  return (

    <aside

      className="home-map-trail-strip pointer-events-auto relative z-20 w-full min-w-0 shrink-0 overflow-hidden"

      aria-label="攻略列表"

    >

      <header className="flex items-center justify-between gap-2 px-3 py-2">

        <div className="min-w-0">

          <h2 className="home-map-trail-strip__title text-xs font-semibold sm:text-sm">{HOME_MAP_TRAIL.feedTitle}</h2>

          <p className="home-map-trail-strip__subtitle text-[10px] sm:text-[11px]">

            共 {guides.length} 条 · 点击卡片一键规划

          </p>

        </div>

        <div className="flex shrink-0 items-center gap-1">

          <button

            type="button"

            aria-label="向左浏览攻略"

            onClick={() => scrollBy(-320)}

            className="home-map-trail-strip__nav-btn inline-flex h-7 w-7 items-center justify-center rounded-lg transition"

          >

            <ChevronLeft className="h-4 w-4" aria-hidden />

          </button>

          <button

            type="button"

            aria-label="向右浏览攻略"

            onClick={() => scrollBy(320)}

            className="home-map-trail-strip__nav-btn inline-flex h-7 w-7 items-center justify-center rounded-lg transition"

          >

            <ChevronRight className="h-4 w-4" aria-hidden />

          </button>

          {highlightedTrailId ? (

            <Link

              to={guideDetailPath(highlightedTrailId)}

              className="home-map-trail-strip__detail-link ml-1 hidden text-[10px] font-medium hover:underline sm:inline"

            >

              详情 →

            </Link>

          ) : null}

        </div>

      </header>



      <div

        ref={scrollRef}

        className="home-map-trail-strip__scroll min-w-0 max-w-full overflow-x-auto overscroll-x-contain px-3 pb-3"

        role="list"

      >

        <div className="home-map-trail-strip__track flex flex-nowrap gap-2">

          {guides.length === 0 ? (

            <p

              role="listitem"

              className="home-map-trail-strip__empty shrink-0 rounded-xl border border-dashed px-4 py-3 text-xs"

            >

              {HOME_MAP_TRAIL.stripEmptyHint}

            </p>

          ) : (

            guides.map((guide) => (

              <div key={guide.id} data-trail-id={guide.id} role="listitem" className="shrink-0 snap-start">

                <TrailGuideCard

                  guide={guide}

                  active={guide.id === highlightedTrailId}

                  onPlanGuide={onPlanGuide}

                  planning={planning}

                  compact

                />

              </div>

            ))

          )}

        </div>

      </div>

    </aside>

  );

}



export default HomeMapTrailMobileStrip;

