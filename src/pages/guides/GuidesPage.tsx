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
    <MotionPage className="holo-guides flex flex-col gap-4">
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
        <section className="holo-guides__panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="holo-guides__title">{SNAIL_UI_COPY.guidesLibraryTitle}</h1>
              <p className="holo-guides__subtitle">{SNAIL_UI_COPY.guidesLibrarySubtitle}</p>
            </div>
            <Link to={paths.guidesPublish} className="holo-guides__cta">
              {SLIME_TRAIL_PUBLISHER.title}
            </Link>
          </div>
          <p id="guides-search-label" className="holo-guides__label">
            关键词
            {isDebouncing && (
              <span className="ml-2 text-xs font-normal opacity-70">筛选中…</span>
            )}
          </p>
          <input
            type="search"
            aria-labelledby="guides-search-label"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={SNAIL_UI_COPY.guidesSearchPlaceholder}
            className="holo-guides__input"
          />
        </section>
      </MotionBlock>

      <MotionBlock>
        <GuideCardList
          guides={guides}
          title={SNAIL_UI_COPY.guidesListTitle}
          subtitle="点击卡片查看黏液轨迹详情，或在卡片内打开地图"
        />
      </MotionBlock>
    </MotionPage>
  );
}
