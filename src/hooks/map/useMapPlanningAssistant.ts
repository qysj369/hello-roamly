import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { stopPlanVoiceNarration } from '@/lib/browser/planVoiceNarration';
import { reverseGeocodeWithAmapGeocoder } from '@/lib/map/amapGeocoderClient';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import { convertCoordinates } from '@/lib/map/coordinates';
import type { MapClickEvent } from '@/lib/map/types';
import {
  buildCrossCityPlanQuery,
  buildCrossCitySearchPlanQuery,
  buildEnrichedSearchPlanQuery,
  buildGuidePlanQuery,
  buildMultiStopSearchPlanQuery,
  isSameCityRegion,
  parseTravelSearchIntent,
} from '@/lib/map/planQueryBuilder';
import { createThrottledFlusher } from '@/lib/plan/throttledStreamFlush';
import { fetchMapPlanWithStream } from '@/services/ai/api/fetchMapPlanStream';
import {
  coalesceSearchQueryWithDestination,
  extractMultiStopDestinations,
  resolveCityCenterSync,
} from '@/lib/map/parseTrailSearchQuery';
import {
  formatTravelSearchResolveError,
  resolveUserTravelSearch,
} from '@/lib/map/resolveUserTravelSearch';
import { parseUserTravelSearch, isDurationOnlyTravelQuery } from '@/lib/map/userTravelSearchPipeline';
import { buildDefaultDemoOrigin } from '@/lib/map/defaultMapOrigin';
import { resolvePlanOriginEndpoint, shouldAttachOriginToPlan } from '@/lib/map/resolvePlanOrigin';
import {
  buildPlanRouteDisplayLabel,
  filterOriginFromMultiStops,
  preferPlanRouteLabel,
} from '@/lib/map/planRouteLabel';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';
import {
  buildMultiStopRouteLineCollection,
  computeBoundsFlyTarget,
  computeRouteFlyTarget,
} from '@/lib/map/trailWall/userRouteGeoJson';
import { registerPlanCancelHandler } from '@/stores/globalMapPlanning/planCancelBridge';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import type { PlanHistoryTrigger } from '@/types/domain/planHistory';
import type { TrailWallGuide } from '@/types/domain/trailWall';
import { toErrorMessage } from '@/utils/toErrorMessage';
import { withTimeout } from '@/utils/withTimeout';

const GEOCODE_TIMEOUT_MS = 12_000;

function buildDefaultOriginEndpoint(): MapRouteEndpoint {
  const demo = buildDefaultDemoOrigin();
  return {
    label: demo.label,
    gcjLng: demo.gcjLng,
    gcjLat: demo.gcjLat,
    wgsLng: demo.longitude,
    wgsLat: demo.latitude,
  };
}

const INITIAL_LOCATION_LABEL = '正在识别地点：...';

export type MapFlyTarget = {
  longitude: number;
  latitude: number;
  zoom?: number;
};

export type MapRouteEndpoint = {
  label: string;
  gcjLng: number;
  gcjLat: number;
  wgsLng: number;
  wgsLat: number;
};

export type MapDestinationPlanOptions = {
  onLocated?: (target: MapFlyTarget) => void;
  planQuery?: string;
  trigger?: PlanHistoryTrigger;
};

export type SearchPlanOptions = {
  /** 用户当前定位（出发地），用于跨城大交通规划 */
  origin?: MapRouteEndpoint | null;
  /** manual = 地址校正或地图选点，规划时优先于搜索里的「历下区」等粗地址 */
  originSource?: 'manual' | 'gps' | 'ip' | 'fallback';
  /** 识别为跨城后绘制地图弧线 */
  onCrossCityRoute?: (origin: MapRouteEndpoint, destination: MapRouteEndpoint) => void;
  /** 多地联游：绘制逐站路线 */
  onMultiStopRoute?: (origin: MapRouteEndpoint | null, stops: MapRouteEndpoint[]) => void;
};

function formatPlanningLabel(name: string): string {
  return `正在规划：${name}`;
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

type PlanStreamHandlers = {
  onDelta?: (text: string) => void;
  onSync?: (fullText: string) => void;
  onStatus?: (message: string) => void;
};

async function runFetchPlan(
  params: {
    lng: number;
    lat: number;
    query: string;
    locationName: string;
    originName?: string | null;
    searchQuery?: string;
    initialQuery?: string;
  },
  signal?: AbortSignal,
  stream?: PlanStreamHandlers,
) {
  return fetchMapPlanWithStream({
    params: {
      lng: params.lng,
      lat: params.lat,
      query: params.query,
      locationName: params.locationName,
      originName: params.originName ?? undefined,
      searchQuery: params.searchQuery,
      initialQuery: params.initialQuery ?? params.searchQuery,
    },
    signal,
    onDelta: stream?.onDelta,
    onSync: stream?.onSync,
    onStatus: stream?.onStatus,
  });
}

export function useMapPlanningAssistant() {
  const global = useGlobalMapPlanningStore(
    useShallow((state) => ({
      resultOpen: state.resultOpen,
      resultLocation: state.resultLocation,
      resultContent: state.resultContent,
      conversationTurns: state.conversationTurns,
      followUpLoading: state.followUpLoading,
      followUpError: state.followUpError,
      saveLoading: state.saveLoading,
      saveError: state.saveError,
      saveSuccess: state.saveSuccess,
      planStreaming: state.planStreaming,
      openPlanResult: state.openPlanResult,
      beginPlanStreamSession: state.beginPlanStreamSession,
      finishPlanStream: state.finishPlanStream,
      closeResult: state.closeResult,
    })),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [coords, setCoords] = useState({ lng: 0, lat: 0 });
  const [resolvedLocationName, setResolvedLocationName] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState(INITIAL_LOCATION_LABEL);
  const [loading, setLoading] = useState(false);
  const [streamPreview, setStreamPreview] = useState('');
  const [error, setError] = useState<string | null>(null);
  const planRequestRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const streamPreviewRef = useRef('');
  const streamFlushRef = useRef(
    createThrottledFlusher(() => {
      const content = streamPreviewRef.current;
      setStreamPreview(content);
      useGlobalMapPlanningStore.getState().replacePlanStreamContent(content);
    }),
  );

  const releasePlanRequest = useCallback((requestId: number) => {
    streamFlushRef.current.cancel();
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
    if (requestId === planRequestRef.current) {
      abortRef.current = null;
      setLoading(false);
      setStreamPreview('');
      streamPreviewRef.current = '';
    }
  }, []);

  /** 中止进行中的请求，不清空已展示的结果（供新开规划前调用） */
  const abortActivePlanRequest = useCallback(() => {
    planRequestRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    stopPlanVoiceNarration();
    setLoading(false);
    setStreamPreview('');
    streamPreviewRef.current = '';
    useGlobalMapPlanningStore.setState({
      planStreaming: false,
      planStreamStatus: null,
    });
  }, []);

  /** 用户点停止：中止并关闭结果浮层 */
  const cancelActivePlanRequest = useCallback(() => {
    abortActivePlanRequest();
    useGlobalMapPlanningStore.getState().closeResult();
  }, [abortActivePlanRequest]);

  const closeModal = useCallback(() => {
    cancelActivePlanRequest();
    setModalOpen(false);
    setError(null);
  }, [cancelActivePlanRequest]);

  useEffect(() => {
    registerPlanCancelHandler(cancelActivePlanRequest);
    return () => {
      registerPlanCancelHandler(null);
    };
  }, [cancelActivePlanRequest]);

  const syncPlanStreamContent = useCallback((fullText: string) => {
    streamPreviewRef.current = fullText;
    streamFlushRef.current.flushNow();
  }, []);

  const pushPlanStreamDelta = useCallback((text: string) => {
    if (!text) {
      return;
    }
    streamPreviewRef.current += text;
    streamFlushRef.current.schedule();
  }, []);

  const handlePlanStreamStatus = useCallback((message: string) => {
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(message);
  }, []);

  const completePlanStream = useCallback(
    (params: Parameters<typeof global.finishPlanStream>[0]) => {
      streamFlushRef.current.cancel();
      useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
      global.finishPlanStream(params);
    },
    [global],
  );

  const beginPlanRequest = useCallback(() => {
    streamPreviewRef.current = '';
    setStreamPreview('');
    streamFlushRef.current.cancel();
    useGlobalMapPlanningStore.getState().setPlanStreamStatus(null);
    abortActivePlanRequest();
    const requestId = planRequestRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    return { requestId, signal: controller.signal };
  }, [abortActivePlanRequest]);

  const handleMapClick = useCallback(async (event: MapClickEvent) => {
    setAnchor({ x: event.x, y: event.y });
    setCoords({ lng: event.lng, lat: event.lat });
    setQuery('');
    setResolvedLocationName(null);
    setLocationLabel('正在识别地点：...');
    setError(null);
    setModalOpen(true);

    try {
      const address = await withTimeout(
        reverseGeocodeWithAmapGeocoder(event.lng, event.lat),
        GEOCODE_TIMEOUT_MS,
        '识别地点超时',
      );
      const label = sanitizeLocationLabelForDisplay(address, '所选地点');
      setResolvedLocationName(label);
      setLocationLabel(formatPlanningLabel(label));
    } catch {
      const fallback = '所选地点';
      setResolvedLocationName(fallback);
      setLocationLabel(formatPlanningLabel(fallback));
    }
  }, []);

  const generatePlan = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setError('请填写旅行需求');
      return;
    }

    const { requestId, signal } = beginPlanRequest();
    const displayLocation = sanitizeLocationLabelForDisplay(
      resolvedLocationName ?? trimmed,
    );

    global.beginPlanStreamSession({
      trigger: 'map_click',
      locationName: displayLocation,
      lng: coords.lng,
      lat: coords.lat,
      initialQuery: trimmed,
    });

    try {
      const result = await runFetchPlan(
        {
          lng: coords.lng,
          lat: coords.lat,
          query: trimmed,
          locationName: displayLocation,
        },
        signal,
        {
          onDelta: pushPlanStreamDelta,
          onSync: syncPlanStreamContent,
          onStatus: handlePlanStreamStatus,
        },
      );

      if (requestId !== planRequestRef.current) {
        return;
      }

      const planContent =
        result.content.trim() || streamPreviewRef.current.trim();
      if (!planContent) {
        global.closeResult();
        setError('方案内容为空，请重试');
        return;
      }
      setLocationLabel(formatPlanningLabel(displayLocation));
      setModalOpen(false);
      setLoading(false);
      completePlanStream({
        trigger: 'map_click',
        locationName: result.locationName,
        content: planContent,
        lng: coords.lng,
        lat: coords.lat,
        initialQuery: trimmed,
      });
    } catch (err) {
      // 被更新的请求取代时，不要 closeResult，否则会误关新会话
      if (requestId !== planRequestRef.current) {
        return;
      }
      global.closeResult();
      if (isAbortError(err)) {
        return;
      }
      setError(toErrorMessage(err, '生成方案失败，请稍后再试'));
    } finally {
      releasePlanRequest(requestId);
    }
  }, [
    beginPlanRequest,
    coords.lat,
    coords.lng,
    global,
    pushPlanStreamDelta,
    syncPlanStreamContent,
    handlePlanStreamStatus,
    completePlanStream,
    releasePlanRequest,
    query,
    resolvedLocationName,
  ]);

  const generateFromSearchQuery = useCallback(
    async (
      searchText: string,
      onLocated?: (target: MapFlyTarget) => void,
      options?: SearchPlanOptions,
    ): Promise<string | null> => {
      const trimmed = coalesceSearchQueryWithDestination(
        correctAdvisorSpeechIntent(searchText.trim()),
      );
      if (!trimmed) {
        return '请输入旅行需求';
      }

      const parsedSearch = parseUserTravelSearch(trimmed);
      if (!parsedSearch) {
        return '请输入旅行需求';
      }
      if (isDurationOnlyTravelQuery(trimmed)) {
        return '请加上城市名，如「成都 三天」';
      }

      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);

      const route = parsedSearch.route;
      const localPreview =
        resolveCityCenterSync(trimmed) ??
        (parsedSearch.primaryPlace ? resolveCityCenterSync(parsedSearch.primaryPlace) : null);
      const provisionalLabel = parsedSearch.destinationLabel;
      let provisionalGcj = { lng: 116.4074, lat: 39.9042 };
      if (localPreview) {
        const previewGcj = convertCoordinates(
          { longitude: localPreview.longitude, latitude: localPreview.latitude },
          localPreview.coordSystem,
          'gcj02',
        );
        provisionalGcj = { lng: previewGcj.longitude, lat: previewGcj.latitude };
      }

      global.beginPlanStreamSession({
        trigger: 'search',
        locationName: provisionalLabel,
        lng: provisionalGcj.lng,
        lat: provisionalGcj.lat,
        initialQuery: trimmed,
      });

      try {
        const searchResolved = await resolveUserTravelSearch(trimmed);
        if (!searchResolved) {
          global.closeResult();
          return formatTravelSearchResolveError(parsedSearch);
        }

        const { location: resolved, multiStop: multiStopResolved } = searchResolved;

        const gcj = convertCoordinates(
          { longitude: resolved.longitude, latitude: resolved.latitude },
          resolved.coordSystem,
          'gcj02',
        );
        const flyWgs84 = convertCoordinates(
          { longitude: resolved.longitude, latitude: resolved.latitude },
          resolved.coordSystem,
          'wgs84',
        );
        provisionalGcj = { lng: gcj.longitude, lat: gcj.latitude };
        setCoords({ lng: gcj.longitude, lat: gcj.latitude });
        setResolvedLocationName(resolved.label);
        onLocated?.({
          longitude: flyWgs84.longitude,
          latitude: flyWgs84.latitude,
          zoom: 9,
        });

        const intent = parseTravelSearchIntent(trimmed);
        const parsedMultiStops =
          multiStopResolved?.stops.map((stop) => stop.stopName) ??
          (intent.multiStops.length >= 2
            ? intent.multiStops
            : extractMultiStopDestinations(trimmed));

        const originInput = options?.origin ?? buildDefaultOriginEndpoint();
        const originSource = options?.origin ? options?.originSource : 'fallback';

        const originResolved = await resolvePlanOriginEndpoint(
          route.origin,
          originInput,
          originSource,
        );
        const provisionalDestLabel =
          parsedMultiStops.length >= 2
            ? parsedMultiStops.join('→')
            : sanitizeLocationLabelForDisplay(resolved.label);
        const attachOrigin = shouldAttachOriginToPlan(
          originResolved,
          route.origin,
          provisionalDestLabel,
        );
        const originLabel = attachOrigin
          ? originResolved.labelForAi
          : parsedMultiStops.length >= 2
            ? (originResolved.labelForAi ?? buildDefaultOriginEndpoint().label)
            : null;
        const multiStops = filterOriginFromMultiStops(parsedMultiStops, originLabel);
        const destLabel =
          multiStops.length >= 2
            ? multiStops.join('→')
            : sanitizeLocationLabelForDisplay(resolved.label);
        const routeLabel = buildPlanRouteDisplayLabel(destLabel, originLabel);
        const crossCity =
          Boolean(originLabel) &&
          !isSameCityRegion(originLabel!, multiStops.length >= 2 ? multiStops[0]! : destLabel);

        const aiQuery =
          multiStops.length >= 2
            ? buildMultiStopSearchPlanQuery(multiStops, intent, originLabel)
            : crossCity
              ? buildCrossCitySearchPlanQuery(originLabel!, destLabel, intent, trimmed)
              : buildEnrichedSearchPlanQuery(trimmed, destLabel, intent);

        const destEndpoint: MapRouteEndpoint = {
          label: destLabel,
          gcjLng: gcj.longitude,
          gcjLat: gcj.latitude,
          wgsLng: flyWgs84.longitude,
          wgsLat: flyWgs84.latitude,
        };

        const stopEndpoints: MapRouteEndpoint[] =
          multiStopResolved?.stops.map((stop) => {
            const stopGcj = convertCoordinates(
              { longitude: stop.longitude, latitude: stop.latitude },
              stop.coordSystem,
              'gcj02',
            );
            const stopWgs = convertCoordinates(
              { longitude: stop.longitude, latitude: stop.latitude },
              stop.coordSystem,
              'wgs84',
            );
            return {
              label: stop.label,
              gcjLng: stopGcj.longitude,
              gcjLat: stopGcj.latitude,
              wgsLng: stopWgs.longitude,
              wgsLat: stopWgs.latitude,
            };
          }) ?? (multiStops.length >= 2 ? [destEndpoint] : []);

        if (multiStops.length >= 2 && stopEndpoints.length >= 2) {
          options?.onMultiStopRoute?.(originResolved.endpoint, stopEndpoints);
          const waypoints: [number, number][] = [];
          if (originResolved.endpoint) {
            waypoints.push([originResolved.endpoint.wgsLng, originResolved.endpoint.wgsLat]);
          }
          for (const stop of stopEndpoints) {
            waypoints.push([stop.wgsLng, stop.wgsLat]);
          }
          if (waypoints.length >= 2) {
            onLocated?.(computeBoundsFlyTarget(waypoints));
          }
        } else if (crossCity && originResolved.endpoint) {
          options?.onCrossCityRoute?.(originResolved.endpoint, destEndpoint);
          onLocated?.(
            computeRouteFlyTarget(
              [originResolved.endpoint.wgsLng, originResolved.endpoint.wgsLat],
              [destEndpoint.wgsLng, destEndpoint.wgsLat],
            ),
          );
        }

        useGlobalMapPlanningStore.setState({
          resultLocation: routeLabel,
          coords: { lng: gcj.longitude, lat: gcj.latitude },
        });

        const result = await runFetchPlan(
          {
            lng: gcj.longitude,
            lat: gcj.latitude,
            query: aiQuery,
            searchQuery: trimmed,
            initialQuery: trimmed,
            locationName: destLabel,
            originName: originLabel ?? undefined,
          },
          signal,
        {
          onDelta: pushPlanStreamDelta,
          onSync: syncPlanStreamContent,
          onStatus: handlePlanStreamStatus,
        },
      );

        if (requestId !== planRequestRef.current) {
          return null;
        }

        const planContent =
          result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return '方案内容为空，请重试';
        }

        setLoading(false);
        completePlanStream({
          trigger: 'search',
          locationName: buildPlanRouteDisplayLabel(
            preferPlanRouteLabel(routeLabel, result.locationName),
            attachOrigin ? originLabel : null,
          ),
          content: planContent,
          lng: gcj.longitude,
          lat: gcj.latitude,
          initialQuery: trimmed,
        });
        return null;
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, '生成方案失败，请稍后再试');
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest,
    ],
  );

  const generateFromGuide = useCallback(
    async (
      guide: TrailWallGuide,
      originLabel?: string,
      onLocated?: (target: MapFlyTarget) => void,
    ): Promise<string | null> => {
      const gcj = convertCoordinates(
        { longitude: guide.end_coords[0], latitude: guide.end_coords[1] },
        'wgs84',
        'gcj02',
      );
      const planQuery = buildGuidePlanQuery(originLabel ?? '当前位置', guide);

      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);
      global.closeResult();
      setCoords({ lng: gcj.longitude, lat: gcj.latitude });
      setResolvedLocationName(guide.end_city);

      onLocated?.({
        longitude: guide.end_coords[0],
        latitude: guide.end_coords[1],
        zoom: 9,
      });

      global.beginPlanStreamSession({
        trigger: 'card_click',
        locationName: guide.end_city,
        lng: gcj.longitude,
        lat: gcj.latitude,
        initialQuery: planQuery,
      });

      try {
        const result = await runFetchPlan(
          {
            lng: gcj.longitude,
            lat: gcj.latitude,
            query: planQuery,
            locationName: guide.end_city,
            originName: originLabel ?? undefined,
          },
          signal,
        {
          onDelta: pushPlanStreamDelta,
          onSync: syncPlanStreamContent,
          onStatus: handlePlanStreamStatus,
        },
      );

        if (requestId !== planRequestRef.current) {
          return null;
        }

        const planContent =
          result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return '方案内容为空，请重试';
        }

        setLoading(false);
        completePlanStream({
          trigger: 'card_click',
          locationName: result.locationName,
          content: planContent,
          lng: gcj.longitude,
          lat: gcj.latitude,
          initialQuery: planQuery,
        });
        return null;
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, '生成方案失败，请稍后再试');
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest,
    ],
  );

  const generateFromMapDestination = useCallback(
    async (
      origin: MapRouteEndpoint,
      destination: MapRouteEndpoint,
      options?: MapDestinationPlanOptions,
    ): Promise<{ content: string; locationName: string } | string | null> => {
      const planQuery =
        options?.planQuery ?? buildCrossCityPlanQuery(origin.label, destination.label);
      const trigger = options?.trigger ?? 'map_click';

      const { requestId, signal } = beginPlanRequest();
      setModalOpen(false);
      global.closeResult();
      setCoords({ lng: destination.gcjLng, lat: destination.gcjLat });
      setResolvedLocationName(destination.label);
      setQuery(planQuery);

      options?.onLocated?.({
        longitude: (origin.wgsLng + destination.wgsLng) / 2,
        latitude: (origin.wgsLat + destination.wgsLat) / 2,
        zoom: undefined,
      });

      global.beginPlanStreamSession({
        trigger,
        locationName: destination.label,
        lng: destination.gcjLng,
        lat: destination.gcjLat,
        initialQuery: planQuery,
      });

      try {
        const result = await runFetchPlan(
          {
            lng: destination.gcjLng,
            lat: destination.gcjLat,
            query: planQuery,
            locationName: destination.label,
            originName: origin.label,
          },
          signal,
        {
          onDelta: pushPlanStreamDelta,
          onSync: syncPlanStreamContent,
          onStatus: handlePlanStreamStatus,
        },
      );

        if (requestId !== planRequestRef.current) {
          return null;
        }

        const planContent =
          result.content.trim() || streamPreviewRef.current.trim();
        if (!planContent) {
          global.closeResult();
          return '方案内容为空，请重试';
        }

        setLoading(false);
        completePlanStream({
          trigger,
          locationName: result.locationName,
          content: planContent,
          lng: destination.gcjLng,
          lat: destination.gcjLat,
          initialQuery: planQuery,
        });
        return { content: planContent, locationName: result.locationName };
      } catch (err) {
        if (requestId !== planRequestRef.current) {
          return null;
        }
        global.closeResult();
        if (isAbortError(err)) {
          return null;
        }
        return toErrorMessage(err, '生成方案失败，请稍后再试');
      } finally {
        releasePlanRequest(requestId);
      }
    },
    [
      beginPlanRequest,
      completePlanStream,
      global,
      pushPlanStreamDelta,
      syncPlanStreamContent,
      handlePlanStreamStatus,
      releasePlanRequest,
    ],
  );

  return {
    modalOpen,
    anchor,
    locationLabel,
    query,
    loading,
    isGenerating: loading || global.planStreaming,
    streamPreview,
    planStreaming: global.planStreaming,
    error,
    resultOpen: global.resultOpen,
    resultLocation: global.resultLocation,
    resultContent: global.resultContent,
    conversationTurns: global.conversationTurns,
    followUpLoading: global.followUpLoading,
    followUpError: global.followUpError,
    saveLoading: global.saveLoading,
    saveError: global.saveError,
    saveSuccess: global.saveSuccess,
    setQuery,
    handleMapClick,
    generateFromSearchQuery,
    generateFromGuide,
    generateFromMapDestination,
    closeModal,
    cancelActivePlanRequest,
    closeResult: global.closeResult,
    generatePlan,
  };
}
