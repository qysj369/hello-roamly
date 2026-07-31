import { useCallback } from 'react';
import type { FeatureCollection, LineString } from 'geojson';
import type { MapFlyTarget, MapRouteEndpoint } from '@/hooks/map/useMapPlanningAssistant';
import type { UserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import {
  buildRoutePlanningIntro,
  buildRoutePlanningSummary,
  primePlanVoiceNarration,
  speakPlanVoiceNarration,
} from '@/lib/browser/planVoiceNarration';
import { reverseGeocodeAmapLabels } from '@/lib/map/amapGeocoderClient';
import { convertCoordinates } from '@/lib/map/coordinates';
import { buildCrossCityPlanQuery, buildGuidePlanQuery } from '@/lib/map/planQueryBuilder';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import {
  buildUserRouteLineCollection,
  computeRouteFlyTarget,
} from '@/lib/map/trailWall/userRouteGeoJson';
import type { MapClickEvent } from '@/lib/map/types';
import type { TrailWallGuide } from '@/types/domain/trailWall';

type CrossCityPlanning = {
  loading: boolean;
  isGenerating: boolean;
  closeModal: () => void;
  generateFromMapDestination: (
    origin: MapRouteEndpoint,
    destination: MapRouteEndpoint,
    options?: {
      onLocated?: (target: MapFlyTarget) => void;
      planQuery?: string;
      trigger?: 'map_click' | 'card_click';
    },
  ) => Promise<{ content: string; locationName: string } | string | null>;
};

type UseCrossCityDestinationPlanOptions = {
  userOrigin: UserMapOrigin | null;
  refreshOrigin: () => Promise<UserMapOrigin | null>;
  applyFallbackOrigin: () => UserMapOrigin;
  planning: CrossCityPlanning;
  locateOnMap: (target: MapFlyTarget) => void;
  setUserRouteCollection: (collection: FeatureCollection<LineString> | null) => void;
  showPlanError: (message: string | null) => void;
};

function buildOriginEndpoint(origin: UserMapOrigin): MapRouteEndpoint {
  return {
    label: origin.label,
    gcjLng: origin.gcjLng,
    gcjLat: origin.gcjLat,
    wgsLng: origin.longitude,
    wgsLat: origin.latitude,
  };
}

/** 从用户当前定位 → 目的地：画弧线、语音解读、AI 跨城规划 */
export function useCrossCityDestinationPlan({
  userOrigin,
  refreshOrigin,
  applyFallbackOrigin,
  planning,
  locateOnMap,
  setUserRouteCollection,
  showPlanError,
}: UseCrossCityDestinationPlanOptions) {
  const resolveOrigin = useCallback(async (): Promise<MapRouteEndpoint | null> => {
    let origin = userOrigin ?? (await refreshOrigin());
    if (!origin && import.meta.env.VITE_DEMO_ORIGIN_AUTO === '1') {
      origin = applyFallbackOrigin();
    }
    if (!origin) {
      return null;
    }
    return buildOriginEndpoint(origin);
  }, [applyFallbackOrigin, refreshOrigin, userOrigin]);

  const planToDestination = useCallback(
    async (destination: MapRouteEndpoint, guide?: TrailWallGuide) => {
      if (planning.isGenerating) {
        return;
      }
      planning.closeModal();
      primePlanVoiceNarration();

      const originPoint = await resolveOrigin();
      if (!originPoint) {
        showPlanError('未获取到出发地：请在下方输入地址点「地址校正」，或点「地图选出发地」');
        return;
      }

      const routeLine = buildUserRouteLineCollection(
        [originPoint.wgsLng, originPoint.wgsLat],
        [destination.wgsLng, destination.wgsLat],
      );
      setUserRouteCollection(routeLine);
      locateOnMap(
        computeRouteFlyTarget(
          [originPoint.wgsLng, originPoint.wgsLat],
          [destination.wgsLng, destination.wgsLat],
        ),
      );

      const planQuery = guide
        ? buildGuidePlanQuery(originPoint.label, guide)
        : buildCrossCityPlanQuery(originPoint.label, destination.label);
      const trigger = guide ? 'card_click' : 'map_click';

      speakPlanVoiceNarration(buildRoutePlanningIntro(originPoint.label, destination.label));

      const result = await planning.generateFromMapDestination(originPoint, destination, {
        planQuery,
        trigger,
      });
      if (typeof result === 'string') {
        showPlanError(result);
        return;
      }
      if (result) {
        speakPlanVoiceNarration(
          buildRoutePlanningSummary(originPoint.label, destination.label, result.content),
        );
      }
    },
    [
      locateOnMap,
      planning,
      resolveOrigin,
      setUserRouteCollection,
      showPlanError,
    ],
  );

  const planFromMapClick = useCallback(
    async (event: MapClickEvent) => {
      const destGcj = { longitude: event.lng, latitude: event.lat };
      const destWgs = convertCoordinates(destGcj, 'gcj02', 'wgs84');
      const labels = await reverseGeocodeAmapLabels(event.lng, event.lat);
      const destinationLabel = sanitizeLocationLabelForDisplay(
        labels?.destinationLabel ??
          labels?.originLabel ??
          labels?.nearbyLabel,
        '所选地点',
      );

      await planToDestination({
        label: destinationLabel,
        gcjLng: destGcj.longitude,
        gcjLat: destGcj.latitude,
        wgsLng: destWgs.longitude,
        wgsLat: destWgs.latitude,
      });
    },
    [planToDestination],
  );

  const planFromCoordinates = useCallback(
    async (
      wgsLng: number,
      wgsLat: number,
      label: string,
      guide?: TrailWallGuide,
    ) => {
      const gcj = convertCoordinates({ longitude: wgsLng, latitude: wgsLat }, 'wgs84', 'gcj02');
      await planToDestination(
        {
          label,
          gcjLng: gcj.longitude,
          gcjLat: gcj.latitude,
          wgsLng,
          wgsLat,
        },
        guide,
      );
    },
    [planToDestination],
  );

  return { planFromMapClick, planFromCoordinates, planToDestination };
}
