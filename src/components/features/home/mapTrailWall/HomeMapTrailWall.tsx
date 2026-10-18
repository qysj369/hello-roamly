import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FeatureCollection, LineString } from 'geojson';
import type { MapRef } from 'react-map-gl/mapbox';
import { useLocation, useNavigate } from 'react-router-dom';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';
import HomeMapTrailLayers from '@/components/features/home/mapTrailWall/HomeMapTrailLayers';
import { HomeMapTrailMobileStrip } from '@/components/features/home/mapTrailWall/HomeMapTrailSidebar';
import { useCrossCityDestinationPlan } from '@/hooks/map/useCrossCityDestinationPlan';
import { useMapPlanningAssistant, type MapFlyTarget } from '@/hooks/map/useMapPlanningAssistant';
import { usePlanFirstTokenWatch } from '@/hooks/map/usePlanFirstTokenWatch';
import { usePlanLoadingMessage } from '@/hooks/map/usePlanLoadingMessage';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useHomeTrailWall } from '@/hooks/home/useHomeTrailWall';
import { findTrailGuideById } from '@/lib/map/trailWall/geoJson';
import { buildDefaultDemoOrigin } from '@/lib/map/defaultMapOrigin';
import {
  extractSearchDestination,
  resolveCityCenterSync,
} from '@/lib/map/parseTrailSearchQuery';
import {
  buildMultiStopRouteLineCollection,
  buildUserRouteLineCollection,
  computeBoundsFlyTarget,
  computeRouteFlyTarget,
} from '@/lib/map/trailWall/userRouteGeoJson';
import type { MapClickEvent } from '@/lib/map/types';
import { HOME_MAP_CARD_SHELL, PAGE_CONTAINER_NEG_MARGIN_X } from '@/lib/layout/pageLayout';
import type { TrailWallGuide } from '@/types/domain/trailWall';
import { buildAdvisorHandoffState } from '@/lib/ai/buildAdvisorHandoff';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import { useHomeMapPlanningBarStore } from '@/stores/homeMapPlanningBar/store';
import { cn } from '@/utils/cn';

export type PlanRetryAction =
  | { kind: 'search'; query: string }
  | { kind: 'guide'; guide: TrailWallGuide }
  | { kind: 'map'; event: MapClickEvent };

type HomeMapTrailWallProps = {
  /** 驾驶舱全屏模式：贴边无圆角 */
  fullBleed?: boolean;
  /** cockpit=全屏；hero=长首页首屏地图区 */
  variant?: 'cockpit' | 'hero' | 'embedded';
};

type HomePlanState = {
  planQuery?: string;
  seedQuery?: string;
};

/** 搜索框输入是否为用户旅行需求（非系统生成的跨城规划文案） */
function isUserTravelSearchInput(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return false;
  }
  if (/^从.+出发/.test(trimmed)) {
    return false;
  }
  if (trimmed.includes('参考轨迹攻略')) {
    return false;
  }
  return true;
}

/** 首页 — 地图轨迹墙（暗黑底图 + 弧线轨迹 + AI 地图规划） */
export default function HomeMapTrailWall({
  fullBleed = false,
  variant,
}: HomeMapTrailWallProps) {
  const layoutVariant = variant ?? (fullBleed ? 'cockpit' : 'embedded');
  const location = useLocation();
  const navigate = useNavigate();
  const consumedHomeQuery = useRef<string | null>(null);
  const mapRef = useRef<MapRef>(null!);
  const [mapFlyTo, setMapFlyTo] = useState<MapFlyTarget | null>(null);
  const [userRouteCollection, setUserRouteCollection] =
    useState<FeatureCollection<LineString> | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const lastPlanRetryRef = useRef<PlanRetryAction | null>(null);
  const planning = useMapPlanningAssistant();
  const {
    origin: userOrigin,
    status: originStatus,
    source: originSource,
    refreshOrigin,
    applyFallbackOrigin,
  } = useUserMapOrigin();
  const {
    viewState,
    guides,
    visibleGuides,
    stripGuides,
    loading: guidesLoading,
    searchQuery,
    highlightedTrailId,
    activeTrailId,
    pulseOpacity,
    pulseBrightness,
    lineCollection,
    crawlerCollection,
    setSearchQuery,
    selectTrail,
    setHighlightedTrailId,
    setHoveredTrailId,
    handleViewStateChange,
  } = useHomeTrailWall();

  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  const { generateFromSearchQuery } = planning;

  const locateOnMap = useCallback((target: MapFlyTarget) => {
    setMapFlyTo({ ...target });
  }, []);

  const flyToGuide = useCallback((guide: TrailWallGuide) => {
    locateOnMap({
      longitude: guide.end_coords[0],
      latitude: guide.end_coords[1],
      zoom: 9,
    });
  }, [locateOnMap]);

  const handleSelectTrail = useCallback(
    (guide: TrailWallGuide) => {
      selectTrail(guide);
      flyToGuide(guide);
    },
    [flyToGuide, selectTrail],
  );

  const showPlanError = useCallback((message: string | null) => {
    setPlanError(message);
  }, []);

  const crossCityPlan = useCrossCityDestinationPlan({
    userOrigin,
    refreshOrigin,
    applyFallbackOrigin,
    planning,
    locateOnMap,
    setUserRouteCollection,
    showPlanError,
  });

  useEffect(() => {
    if (!mapFlyTo) {
      return;
    }
    handleViewStateChange({
      ...viewStateRef.current,
      longitude: mapFlyTo.longitude,
      latitude: mapFlyTo.latitude,
      zoom: mapFlyTo.zoom ?? 9,
    });
  }, [mapFlyTo, handleViewStateChange]);

  const lastFlownOriginKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const destinationHint =
      trimmed && isUserTravelSearchInput(trimmed)
        ? extractSearchDestination(trimmed) ?? trimmed.split(/[，,]/)[0]?.trim() ?? trimmed
        : null;
    if (destinationHint && resolveCityCenterSync(destinationHint)) {
      return;
    }

    const origin = userOrigin ?? buildDefaultDemoOrigin();
    if (!origin?.gcjLng) {
      return;
    }
    const key = `${origin.gcjLng.toFixed(5)},${origin.gcjLat.toFixed(5)}`;
    if (lastFlownOriginKeyRef.current === key) {
      return;
    }
    lastFlownOriginKeyRef.current = key;
    locateOnMap({
      longitude: origin.longitude,
      latitude: origin.latitude,
      zoom: 11,
    });
  }, [userOrigin, searchQuery, locateOnMap]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isUserTravelSearchInput(trimmed)) {
      return;
    }
    const cityHint =
      extractSearchDestination(trimmed) ?? trimmed.split(/[，,]/)[0]?.trim() ?? trimmed;
    const resolved = resolveCityCenterSync(cityHint);
    if (!resolved) {
      return;
    }
    locateOnMap({
      longitude: resolved.longitude,
      latitude: resolved.latitude,
      zoom: 9,
    });
  }, [locateOnMap, searchQuery]);

  const handleSearchSubmit = useCallback(
    async (query: string) => {
      setPlanError(null);
      setUserRouteCollection(null);
      lastPlanRetryRef.current = { kind: 'search', query };

      const originForPlan = userOrigin;
      const originEndpoint = {
        label: originForPlan.label,
        gcjLng: originForPlan.gcjLng,
        gcjLat: originForPlan.gcjLat,
        wgsLng: originForPlan.longitude,
        wgsLat: originForPlan.latitude,
      };

      const errorMessage = await generateFromSearchQuery(query, locateOnMap, {
        origin: originEndpoint,
        originSource,
        onCrossCityRoute: (origin, destination) => {
          setUserRouteCollection(
            buildUserRouteLineCollection(
              [origin.wgsLng, origin.wgsLat],
              [destination.wgsLng, destination.wgsLat],
            ),
          );
          locateOnMap(
            computeRouteFlyTarget(
              [origin.wgsLng, origin.wgsLat],
              [destination.wgsLng, destination.wgsLat],
            ),
          );
        },
        onMultiStopRoute: (origin, stops) => {
          const waypoints: [number, number][] = [];
          if (origin) {
            waypoints.push([origin.wgsLng, origin.wgsLat]);
          }
          for (const stop of stops) {
            waypoints.push([stop.wgsLng, stop.wgsLat]);
          }
          if (waypoints.length >= 2) {
            setUserRouteCollection(buildMultiStopRouteLineCollection(waypoints));
            locateOnMap(computeBoundsFlyTarget(waypoints));
          }
        },
      });
      showPlanError(errorMessage);
      return errorMessage;
    },
    [generateFromSearchQuery, locateOnMap, showPlanError, userOrigin, originSource],
  );

  const handleGuidePlan = useCallback(
    (guide: TrailWallGuide) => {
      if (planning.isGenerating) {
        return;
      }
      setPlanError(null);
      lastPlanRetryRef.current = { kind: 'guide', guide };
      handleSelectTrail(guide);
      void crossCityPlan.planFromCoordinates(
        guide.end_coords[0],
        guide.end_coords[1],
        guide.end_city,
        guide,
      );
    },
    [crossCityPlan, handleSelectTrail, planning.isGenerating],
  );

  const handleMapClick = useCallback(
    (event: MapClickEvent) => {
      lastPlanRetryRef.current = { kind: 'map', event };
      void crossCityPlan.planFromMapClick(event);
    },
    [crossCityPlan],
  );

  const handleRetryPlan = useCallback(() => {
    const action = lastPlanRetryRef.current;
    if (!action) {
      return;
    }
    if (planning.isGenerating) {
      planning.cancelActivePlanRequest();
    }
    setPlanError(null);
    window.setTimeout(() => {
      switch (action.kind) {
        case 'search':
          void handleSearchSubmit(action.query).then(showPlanError);
          break;
        case 'guide':
          handleGuidePlan(action.guide);
          break;
        case 'map':
          void crossCityPlan.planFromMapClick(action.event);
          break;
        default:
          break;
      }
    }, 0);
  }, [crossCityPlan, handleGuidePlan, handleSearchSubmit, planning, showPlanError]);

  useEffect(() => {
    const state = (location.state as HomePlanState | null) ?? {};
    const planQuery = state.planQuery?.trim();
    const seedQuery = state.seedQuery?.trim();
    const stateKey = planQuery ? `plan:${planQuery}` : seedQuery ? `seed:${seedQuery}` : null;
    if (!stateKey || consumedHomeQuery.current === stateKey) {
      return;
    }
    consumedHomeQuery.current = stateKey;
    navigate(location.pathname, { replace: true, state: null });
    if (planQuery) {
      setSearchQuery(planQuery);
      void handleSearchSubmit(planQuery).then(showPlanError);
      return;
    }
    setSearchQuery(seedQuery!);
  }, [handleSearchSubmit, location.pathname, location.state, navigate, setSearchQuery, showPlanError]);

  const userOriginPoint = useMemo<[number, number] | null>(() => {
    if (!userRouteCollection) {
      return null;
    }
    return [userOrigin.longitude, userOrigin.latitude];
  }, [userRouteCollection, userOrigin]);

  const userOriginGcjPoint = useMemo<[number, number] | null>(() => {
    if (!userRouteCollection) {
      return null;
    }
    return [userOrigin.gcjLng, userOrigin.gcjLat];
  }, [userRouteCollection, userOrigin]);

  const searchGenerating = planning.isGenerating;
  const planLoadingMessage = usePlanLoadingMessage(searchGenerating);
  const { waitingTooLong: planFirstTokenSlow } = usePlanFirstTokenWatch({
    active: searchGenerating && !planning.resultOpen,
    hasContent: Boolean(planning.streamPreview?.trim()),
  });

  const planSessionId = useGlobalMapPlanningStore((state) => state.planSessionId);
  const resultLocation = useGlobalMapPlanningStore((state) => state.resultLocation);
  const resultContent = useGlobalMapPlanningStore((state) => state.resultContent);
  const planCoords = useGlobalMapPlanningStore((state) => state.coords);
  const planInitialQuery = useGlobalMapPlanningStore((state) => state.initialQuery);

  const advisorHandoff = useMemo(() => {
    const prompt = searchQuery.trim() || planInitialQuery?.trim();
    if (!prompt && !resultContent) {
      return undefined;
    }
    return buildAdvisorHandoffState({
      initialPrompt: prompt,
      source: 'home_map',
      locationName: resultLocation,
      lng: planCoords.lng,
      lat: planCoords.lat,
      planSessionId,
      planContent: resultContent,
    });
  }, [
    planCoords.lat,
    planCoords.lng,
    planInitialQuery,
    planSessionId,
    resultContent,
    resultLocation,
    searchQuery,
  ]);

  const controlPanelProps = useMemo(
    () => ({
      searchQuery,
      generating: searchGenerating,
      onSearchChange: setSearchQuery,
      onSearchSubmit: handleSearchSubmit,
      advisorHandoff,
      onRetrySearch: () => {
        const action = lastPlanRetryRef.current;
        if (action?.kind === 'search') {
          void handleSearchSubmit(action.query);
        }
      },
    }),
    [
      searchQuery,
      searchGenerating,
      setSearchQuery,
      handleSearchSubmit,
      advisorHandoff,
    ],
  );

  const planErrorBanner =
    planError && !searchGenerating ? (
      <div
        className={cn(
          'border border-rose-200 bg-rose-50 px-3 py-2.5 shadow-sm',
          layoutVariant === 'hero'
            ? 'border-x-0 border-b-0 border-t-rose-200/80'
            : 'mb-3 rounded-xl',
        )}
        role="alert"
      >
        <p className="text-xs leading-snug text-rose-700">{planError}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {lastPlanRetryRef.current ? (
            <button
              type="button"
              onClick={handleRetryPlan}
              className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-[10px] font-medium text-emerald-800 hover:bg-emerald-50"
            >
              重试
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setPlanError(null)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
          >
            知道了
          </button>
        </div>
      </div>
    ) : null;

  const setHomeMapBar = useHomeMapPlanningBarStore((state) => state.setBar);

  useEffect(() => {
    setHomeMapBar(controlPanelProps);
  }, [setHomeMapBar, controlPanelProps]);

  useEffect(() => {
    return () => {
      setHomeMapBar(null);
    };
  }, [setHomeMapBar]);

  useEffect(() => {
    if (searchGenerating) {
      setPlanError(null);
    }
  }, [searchGenerating]);

  return (
    <div className={cn(layoutVariant === 'hero' && 'home-map-trail-hero-stack flex w-full flex-col')}>
      {layoutVariant !== 'hero' ? planErrorBanner : null}

      <section
        className={cn(
          'home-map-trail-wall relative flex min-w-0 flex-col overflow-hidden',
          layoutVariant === 'cockpit'
            ? 'h-full min-h-0 rounded-none border-0 bg-slate-950'
            : layoutVariant === 'hero'
              ? cn('home-map-trail-wall--hero bg-slate-950', HOME_MAP_CARD_SHELL)
              : cn(
                  'rounded-2xl border border-slate-800',
                  PAGE_CONTAINER_NEG_MARGIN_X,
                  'min-h-[calc(100dvh-var(--app-header-offset)-7.5rem)]',
                ),
        )}
        aria-label="地图轨迹墙"
      >
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          data-map-planning-root
        >
          <HomeMapTrailLayers
            mapRef={mapRef}
            viewState={viewState}
            onViewStateChange={handleViewStateChange}
            lineCollection={lineCollection}
            userRouteCollection={userRouteCollection}
            userOriginPoint={userOriginPoint}
            userOriginGcjPoint={userOriginGcjPoint}
            crawlerCollection={crawlerCollection}
            activeTrailId={activeTrailId}
            pulseOpacity={pulseOpacity}
            pulseBrightness={pulseBrightness}
            onTrailClick={(trailId) => {
              const guide = findTrailGuideById(guides, trailId);
              if (guide) {
                handleGuidePlan(guide);
              } else {
                setHighlightedTrailId(trailId);
              }
            }}
            onTrailHover={setHoveredTrailId}
            onMapClick={handleMapClick}
            flyTo={mapFlyTo}
            className="absolute inset-0 cursor-pointer"
          />

          {searchGenerating && !planning.resultOpen ? (
            <div
              className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]"
              aria-live="polite"
            >
              <div className="w-[min(calc(100%-2rem),24rem)] max-h-[min(70vh,28rem)] rounded-2xl border border-emerald-400/30 bg-slate-900/90 px-5 py-4 text-left shadow-xl">
                <p className="text-center text-sm font-medium text-white">AI 正在为你定制漫行方案</p>
                <p className="mt-2 text-center text-xs text-emerald-200/90">{planLoadingMessage}</p>
                {planning.streamPreview ? (
                  <div
                    className="mt-3 max-h-[min(50vh,18rem)] overflow-y-auto rounded-lg border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-left text-xs leading-relaxed text-slate-200"
                    aria-live="polite"
                  >
                    <AiChatMarkdown content={planning.streamPreview} />
                  </div>
                ) : planFirstTokenSlow ? (
                  <div
                    className="mt-3 rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2 text-center"
                    role="status"
                  >
                    <p className="text-xs font-medium text-amber-100">等待偏久，可能是网络或 AI 繁忙</p>
                    <p className="mt-1 text-[10px] leading-snug text-amber-100/80">
                      可继续等，或停止后重试
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-center text-[10px] text-slate-400">正在连接 AI，首字即将出现…</p>
                )}
                <div
                  className="mx-auto mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-700/80"
                  aria-hidden
                >
                  <div className="h-full w-1/3 animate-[plan-loading-slide_1.4s_ease-in-out_infinite] rounded-full bg-emerald-400/80" />
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-500">文字会边生成边出现，可随时停止</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={planning.cancelActivePlanRequest}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  >
                    停止生成
                  </button>
                  {planFirstTokenSlow && lastPlanRetryRef.current ? (
                    <button
                      type="button"
                      onClick={handleRetryPlan}
                      className="rounded-lg border border-emerald-500/50 bg-emerald-900/50 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-900/80"
                    >
                      重试
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {planErrorBanner}

        <HomeMapTrailMobileStrip
          guides={stripGuides}
          highlightedTrailId={highlightedTrailId}
          onPlanGuide={handleGuidePlan}
          planning={searchGenerating}
        />
      </section>
    </div>
  );
}
