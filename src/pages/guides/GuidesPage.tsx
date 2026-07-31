import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GuideCardList, TravelBuddyMatch } from '@/components/features';
import GuidesAiBanner from '@/components/features/guides/GuidesAiBanner';
import CapsuleContextBanner from '@/components/layout/CapsuleContextBanner';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useFilteredGuides } from '@/hooks';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { guidesPageSeo } from '@/lib/seo';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';
import type { GuidesPageState } from '@/types/router-state';
import { travelBuddyQueryFromRoute } from '@/utils/travelBuddyMatch';
import { useUiStore } from '@/stores';

export default function GuidesPage() {
  usePageSeo(guidesPageSeo());
  const location = useLocation();
  const routeState = (location.state as GuidesPageState | null) ?? null;
  const buddyQuery = travelBuddyQueryFromRoute(routeState?.travelBuddy, routeState?.aiPlan);
  const { searchQuery, guides, isDebouncing } = useFilteredGuides();
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);

  useEffect(() => {
    const dream = routeState?.aiDream?.trim();
    const destination =
      routeState?.aiPlan?.destination?.trim() || routeState?.travelBuddy?.destination?.trim();
    if (dream) {
      setSearchQuery(dream);
    } else if (destination) {
      setSearchQuery(destination);
    }
  }, [
    routeState?.aiDream,
    routeState?.aiPlan?.destination,
    routeState?.travelBuddy?.destination,
    setSearchQuery,
  ]);

  return (
    <MotionPage className="flex flex-col gap-4">
      {routeState?.source !== 'capsule_one' ? (
        <MotionBlock>
          <GuidesAiBanner state={routeState} />
        </MotionBlock>
      ) : null}

      {routeState?.source === 'capsule_one' && (routeState.aiPlan?.destination || routeState.aiDream) ? (
        <MotionBlock>
          <CapsuleContextBanner
            destination={routeState.aiPlan?.destination ?? routeState.aiDream}
            dream={routeState.aiDream}
            source="capsule_one"
            variant="guides"
          />
        </MotionBlock>
      ) : null}

      <MotionBlock>
        <TravelBuddyMatch context={buddyQuery} />
      </MotionBlock>

      <MotionBlock>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900">{SNAIL_UI_COPY.guidesLibraryTitle}</h1>
              <p className="mt-1 text-sm text-slate-600">{SNAIL_UI_COPY.guidesLibrarySubtitle}</p>            </div>
            <Link
              to={paths.guidesPublish}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105"
            >
              {SLIME_TRAIL_PUBLISHER.title}
            </Link>
          </div>
          <p id="guides-search-label" className="mt-4 text-sm font-medium text-slate-700">
            关键词
            {isDebouncing && (
              <span className="ml-2 text-xs font-normal text-slate-400">筛选中…</span>
            )}
          </p>
          <input
            type="search"
            aria-labelledby="guides-search-label"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={SNAIL_UI_COPY.guidesSearchPlaceholder}            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
          />
        </section>
      </MotionBlock>

      <MotionBlock>
        <GuideCardList
          guides={guides}
          title={SNAIL_UI_COPY.guidesListTitle}
          subtitle="点击卡片查看黏液轨迹详情，或在卡片内打开地图"        />
      </MotionBlock>
    </MotionPage>
  );
}
