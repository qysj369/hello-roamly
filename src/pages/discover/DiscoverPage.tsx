import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DiscoverHotSpotlight,
  DiscoverTrendsSection,
} from '@/components/features/discover';
import DiscoverFilterStatus from '@/components/features/discover/DiscoverFilterStatus';
import DiscoverMasonryFeedSection from '@/components/features/discover/DiscoverMasonryFeedSection';
import DiscoverSearchFiltersSection from '@/components/features/discover/DiscoverSearchFiltersSection';
import CapsuleContextBanner from '@/components/layout/CapsuleContextBanner';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useDiscoverFilters } from '@/hooks/discover/useDiscoverFilters';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { discoverPageSeo } from '@/lib/seo';
import {
  countDiscoverFeedResults,
  suggestRelaxedDiscoverFilters,
} from '@/utils/discoverContent';
import { getDiscoverHotPicks } from '@/utils/discoverHotPicks';
import { getViewerInterestSummary } from '@/utils/discoverRecommend';
import { resolveDiscoverSearchInput } from '@/utils/discoverSearchInput';
import { getDiscoverTrends } from '@/utils/discoverTrends';
import type { DiscoverPageState } from '@/types/router-state';

export default function DiscoverPage() {
  usePageSeo(discoverPageSeo());
  const location = useLocation();
  const routeState = (location.state as DiscoverPageState | null) ?? null;

  const feedSectionRef = useRef<HTMLDivElement>(null);

  const {
    filters,
    sortMode,
    advancedFilterCount,
    hasActiveFilters,
    setQuery,
    setDestination,
    setTravelType,
    setTimeRange,
    setContentType,
    setSortMode,
    resetFilters,
    patchFilters,
  } = useDiscoverFilters();

  const hotPicks = useMemo(() => getDiscoverHotPicks(6), []);
  const trends = useMemo(() => getDiscoverTrends(), []);
  const interestSummary = useMemo(() => getViewerInterestSummary(), []);
  const coveredDestinations = useMemo(
    () => trends.destinations.map((item) => item.label),
    [trends.destinations],
  );
  const resultTotal = useMemo(
    () => countDiscoverFeedResults(filters, sortMode),
    [filters, sortMode],
  );
  const relaxedFilters = useMemo(
    () => (resultTotal === 0 ? suggestRelaxedDiscoverFilters(filters) : null),
    [filters, resultTotal],
  );

  const scrollToFeed = useCallback(() => {
    feedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSearchChange = useCallback(
    (input: string) => {
      const resolved = resolveDiscoverSearchInput(input, filters);
      patchFilters(resolved);
    },
    [filters, patchFilters],
  );

  const handleDestinationSelect = useCallback(
    (destination: string) => {
      const nextDestination = filters.destination === destination ? '' : destination;
      patchFilters({
        destination: nextDestination,
        q: nextDestination ? '' : filters.q,
      });
    },
    [filters, patchFilters],
  );

  const handleTagSelect = useCallback(
    (query: string) => {
      const nextQuery = filters.q.trim() === query ? '' : query;
      patchFilters({ q: nextQuery });
    },
    [filters.q, patchFilters],
  );

  const handleRelaxFilters = useCallback(() => {
    if (!relaxedFilters) {
      return;
    }
    patchFilters(relaxedFilters);
    scrollToFeed();
  }, [patchFilters, relaxedFilters, scrollToFeed]);

  useEffect(() => {
    const destination = routeState?.destination?.trim();
    if (!destination || filters.destination === destination) {
      return;
    }
    patchFilters({ destination, q: '' });
  }, [filters.destination, patchFilters, routeState?.destination]);

  const contextDestination = routeState?.destination?.trim() || routeState?.aiDream?.trim();

  return (
    <MotionPage className="holo-discover flex flex-col gap-5 pb-8">
      {contextDestination ? (
        <MotionBlock>
          <CapsuleContextBanner
            destination={contextDestination}
            dream={routeState?.aiDream}
            source={routeState?.fromCapsule ? 'capsule_one' : routeState?.source}
            variant="discover"
          />
        </MotionBlock>
      ) : null}

      <DiscoverSearchFiltersSection
        filters={filters}
        advancedFilterCount={advancedFilterCount}
        hasActiveFilters={hasActiveFilters}
        resultTotal={resultTotal}
        onSearchChange={handleSearchChange}
        onTravelTypeChange={setTravelType}
        onTimeRangeChange={setTimeRange}
        onContentTypeChange={setContentType}
        onReset={resetFilters}
        onJumpToFeed={scrollToFeed}
      />

      {hasActiveFilters ? (
        <DiscoverFilterStatus
          filters={filters}
          total={resultTotal}
          onClearDestination={() => setDestination('')}
          onClearQuery={() => setQuery('')}
          onClearTravelType={() => setTravelType('')}
          onClearTimeRange={() => setTimeRange('all')}
          onClearContentType={() => setContentType('all')}
          onReset={resetFilters}
          onJumpToFeed={scrollToFeed}
          onRelax={relaxedFilters ? handleRelaxFilters : undefined}
        />
      ) : (
        <>
          <MotionBlock>
            <DiscoverHotSpotlight
              items={hotPicks}
              title="编辑精选"
              subtitle="蜗友真实攻略、计划与瞬间 · 点卡片直接阅读"
            />
          </MotionBlock>

          <MotionBlock>
            <DiscoverTrendsSection
              destinations={trends.destinations}
              tags={trends.tags}
              activeDestination={filters.destination}
              activeQuery={filters.q}
              onDestinationSelect={handleDestinationSelect}
              onTagSelect={handleTagSelect}
            />
          </MotionBlock>
        </>
      )}

      <MotionBlock className="space-y-4">
        <DiscoverMasonryFeedSection
          filters={filters}
          sortMode={sortMode}
          hasActiveFilters={hasActiveFilters}
          interestSummary={interestSummary}
          onSortModeChange={setSortMode}
          feedSectionRef={feedSectionRef}
          hotDestinations={coveredDestinations}
          onSuggestDestination={handleDestinationSelect}
          onRelaxFilters={(relaxed) => {
            patchFilters(relaxed);
            scrollToFeed();
          }}
        />
      </MotionBlock>
    </MotionPage>
  );
}
