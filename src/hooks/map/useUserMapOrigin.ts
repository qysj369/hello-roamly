import { useCallback, useEffect, useRef, useState } from 'react';
import { buildDefaultDemoOrigin } from '@/lib/map/defaultMapOrigin';
import {
  resolveOriginAddressToCoords,
  reverseGeocodeAmapLabels,
} from '@/lib/map/amapGeocoderClient';
import { normalizeOriginDisplayLabel } from '@/lib/map/originDisplay';
import { convertCoordinates } from '@/lib/map/coordinates';
import {
  classifyGeolocationFailure,
  queryGeolocationPermission,
  type GeoFailureKind,
  isSecureContextForGeolocation,
} from '@/lib/map/geolocationPermission';
import { fetchApproximateLocationByIp } from '@/lib/map/ipApproximateLocation';
import {
  requestBrowserGeolocation,
  requestSilentBrowserGeolocation,
} from '@/lib/map/requestBrowserGeolocation';
import { formatCoordinateLabel } from '@/lib/map/resolveAmapPlaceName';
import { withTimeout } from '@/utils/withTimeout';

export type UserMapOrigin = {
  label: string;
  longitude: number;
  latitude: number;
  gcjLng: number;
  gcjLat: number;
};

export type OriginStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'fallback'
  | 'denied'
  | 'unsupported'
  | 'insecure'
  | 'error';

export type OriginSource = 'gps' | 'manual' | 'fallback' | 'ip';

export type GeoBlockReason = GeoFailureKind | 'low_accuracy' | 'address_failed' | null;

export type RefreshOriginOptions = {
  /** 用户点击「重新定位」时传 true，可打断进行中的请求并再次触发授权弹窗 */
  force?: boolean;
};

const MANUAL_ORIGIN_STORAGE_KEY = 'hello-roamly-manual-origin';
const MANUAL_ORIGIN_LOCAL_KEY = 'hello-roamly-manual-origin-v2';
const REVERSE_GEO_TIMEOUT_MS = 10_000;
/** 电脑浏览器 GPS 误差常 >800m，超过则提示地址校正 */
const GPS_LOW_ACCURACY_METERS = 800;

function canAutoFallbackOrigin(): boolean {
  return import.meta.env.VITE_DEMO_ORIGIN_AUTO === '1';
}

function detectGeoBlockReason(): GeoFailureKind | null {
  if (!isSecureContextForGeolocation()) {
    return 'insecure';
  }
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }
  return null;
}

function normalizeStoredOrigin(origin: UserMapOrigin): UserMapOrigin {
  const demo = buildDefaultDemoOrigin();
  const legacyDistrictCenter =
    Math.abs((origin.gcjLng ?? 0) - 117.076) < 0.002 &&
    Math.abs((origin.gcjLat ?? 0) - 36.666) < 0.002;
  const coarseLixiaLabel =
    /^(山东省)?济南市历下区$/.test(origin.label.trim()) &&
    !/百合|中林路/.test(origin.label);
  if (legacyDistrictCenter || coarseLixiaLabel) {
    return demo;
  }
  if (/网络近似/.test(origin.label)) {
    return demo;
  }
  const label = normalizeOriginDisplayLabel(origin.label);
  return label === origin.label ? origin : { ...origin, label };
}

function loadStoredManualOrigin(): UserMapOrigin | null {
  for (const key of [MANUAL_ORIGIN_LOCAL_KEY, MANUAL_ORIGIN_STORAGE_KEY]) {
    try {
      const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (!raw) {
        continue;
      }
      const parsed = JSON.parse(raw) as UserMapOrigin;
      if (
        typeof parsed.label === 'string' &&
        typeof parsed.longitude === 'number' &&
        typeof parsed.latitude === 'number'
      ) {
        const upgraded = normalizeStoredOrigin(parsed);
        if (
          upgraded.label !== parsed.label ||
          upgraded.gcjLng !== parsed.gcjLng ||
          upgraded.gcjLat !== parsed.gcjLat
        ) {
          persistManualOrigin(upgraded);
        }
        return upgraded;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

function persistManualOrigin(origin: UserMapOrigin | null): void {
  try {
    if (!origin) {
      localStorage.removeItem(MANUAL_ORIGIN_LOCAL_KEY);
      sessionStorage.removeItem(MANUAL_ORIGIN_STORAGE_KEY);
      return;
    }
    const json = JSON.stringify(origin);
    localStorage.setItem(MANUAL_ORIGIN_LOCAL_KEY, json);
    sessionStorage.setItem(MANUAL_ORIGIN_STORAGE_KEY, json);
  } catch {
    /* ignore */
  }
}

function loadInitialOriginState(): {
  origin: UserMapOrigin;
  status: OriginStatus;
  source: OriginSource;
  manualLock: boolean;
} {
  const stored = loadStoredManualOrigin();
  if (stored) {
    return {
      origin: stored,
      status: 'ready',
      source: 'manual',
      manualLock: true,
    };
  }

  const demo = buildDefaultDemoOrigin();
  persistManualOrigin(demo);
  return {
    origin: demo,
    status: 'fallback',
    source: 'fallback',
    manualLock: true,
  };
}

/** 浏览器定位 + 高德逆地理；支持地图/搜索校正并覆盖错误定位 */
export function useUserMapOrigin() {
  const initial = loadInitialOriginState();
  const [origin, setOrigin] = useState<UserMapOrigin>(initial.origin);
  const [status, setStatus] = useState<OriginStatus>(initial.status);
  const [source, setSource] = useState<OriginSource>(initial.source);
  const [geoBlockReason, setGeoBlockReason] = useState<GeoBlockReason>(null);
  const pendingRef = useRef<Promise<UserMapOrigin | null> | null>(null);
  const manualLockRef = useRef(initial.manualLock);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applyFallbackOrigin = useCallback((): UserMapOrigin => {
    const next = buildDefaultDemoOrigin();
    manualLockRef.current = false;
    persistManualOrigin(null);
    setOrigin(next);
    setSource('fallback');
    setStatus('fallback');
    setGeoBlockReason(null);
    return next;
  }, []);

  const setOriginManually = useCallback((next: UserMapOrigin, originSource: OriginSource = 'manual') => {
    manualLockRef.current = true;
    persistManualOrigin(next);
    setOrigin(next);
    setSource(originSource);
    setStatus('ready');
    setGeoBlockReason(null);
  }, []);

  const refineOriginLabel = useCallback(
    async (base: UserMapOrigin, gcjLng: number, gcjLat: number): Promise<UserMapOrigin> => {
      try {
        const labels = await withTimeout(
          reverseGeocodeAmapLabels(gcjLng, gcjLat),
          REVERSE_GEO_TIMEOUT_MS,
          '逆地理超时',
        );
        const refined =
          labels?.originLabel ?? labels?.nearbyLabel ?? labels?.destinationLabel ?? null;
        if (refined && mountedRef.current) {
          const refinedOrigin = {
            ...base,
            label: normalizeOriginDisplayLabel(refined, base.label),
          };
          if (manualLockRef.current) {
            persistManualOrigin(refinedOrigin);
          }
          setOrigin(refinedOrigin);
          return refinedOrigin;
        }
      } catch {
        /* 保留原标签 */
      }
      return base;
    },
    [],
  );

  const resolveFromWgs = useCallback(
    async (
      wgs: { longitude: number; latitude: number },
      originSource: OriginSource,
    ): Promise<UserMapOrigin> => {
      const gcj = convertCoordinates(wgs, 'wgs84', 'gcj02');
      const coordLabel = formatCoordinateLabel(wgs.latitude, wgs.longitude);

      const next: UserMapOrigin = {
        label: coordLabel,
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng: gcj.longitude,
        gcjLat: gcj.latitude,
      };

      setOrigin(next);
      setSource(originSource);
      setStatus('ready');
      setGeoBlockReason(null);

      return refineOriginLabel(next, gcj.longitude, gcj.latitude);
    },
    [refineOriginLabel],
  );

  const resolveFromPosition = useCallback(
    async (position: GeolocationPosition): Promise<UserMapOrigin> => {
      const result = await resolveFromWgs(
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        },
        'gps',
      );

      const accuracy = position.coords.accuracy;
      if (Number.isFinite(accuracy) && accuracy > GPS_LOW_ACCURACY_METERS) {
        setGeoBlockReason('low_accuracy');
      }

      return result;
    },
    [resolveFromWgs],
  );

  const trySilentIpOrigin = useCallback(async (): Promise<UserMapOrigin | null> => {
    const ip = await fetchApproximateLocationByIp();
    if (!ip) {
      return null;
    }

    const gcj = convertCoordinates(
      { longitude: ip.longitude, latitude: ip.latitude },
      'wgs84',
      'gcj02',
    );
    const provisional: UserMapOrigin = {
      label: `${ip.label}（网络近似）`,
      longitude: ip.longitude,
      latitude: ip.latitude,
      gcjLng: gcj.longitude,
      gcjLat: gcj.latitude,
    };
    manualLockRef.current = true;
    setOriginManually(provisional, 'ip');
    const refined = await refineOriginLabel(provisional, gcj.longitude, gcj.latitude);
    const withHint = {
      ...refined,
      label: refined.label.includes('近似') ? refined.label : `${refined.label}（网络近似）`,
    };
    setOriginManually(withHint, 'ip');
    return withHint;
  }, [refineOriginLabel, setOriginManually]);

  const refreshApproximateByIp = useCallback(async (): Promise<UserMapOrigin | null> => {
    setStatus('loading');
    setGeoBlockReason(null);
    const result = await trySilentIpOrigin();
    if (!result) {
      setStatus('error');
      setGeoBlockReason('unavailable');
    }
    return result;
  }, [trySilentIpOrigin]);

  const refreshOrigin = useCallback(
    (options?: RefreshOriginOptions): Promise<UserMapOrigin | null> => {
      if (pendingRef.current && !options?.force) {
        return pendingRef.current;
      }
      pendingRef.current = null;

      if (manualLockRef.current && origin && !options?.force) {
        return Promise.resolve(origin);
      }

      const backupManual =
        manualLockRef.current && origin?.label?.trim() ? origin : loadStoredManualOrigin();

      if (options?.force) {
        manualLockRef.current = false;
      }

      const blocked = detectGeoBlockReason();
      if (blocked) {
        setGeoBlockReason(blocked);
        setStatus(blocked === 'insecure' ? 'insecure' : 'unsupported');
        if (backupManual) {
          setOriginManually(backupManual);
          return Promise.resolve(backupManual);
        }
        setOrigin(null);
        if (canAutoFallbackOrigin()) {
          return Promise.resolve(applyFallbackOrigin());
        }
        return Promise.resolve(null);
      }

      setStatus('loading');
      setGeoBlockReason(null);

      const restoreManualIfNeeded = (): UserMapOrigin | null => {
        if (!backupManual) {
          return null;
        }
        setOriginManually(backupManual);
        return backupManual;
      };

      const task = requestBrowserGeolocation()
        .then((position) => {
          persistManualOrigin(null);
          return resolveFromPosition(position);
        })
        .catch(async (err) => {
          const reason = await classifyGeolocationFailure(err);
          setGeoBlockReason(reason);
          const restored = restoreManualIfNeeded();
          if (restored) {
            return restored;
          }
          setOrigin(null);
          setStatus(reason === 'denied' ? 'denied' : 'error');
          if (canAutoFallbackOrigin()) {
            return applyFallbackOrigin();
          }
          return null;
        })
        .finally(() => {
          pendingRef.current = null;
        });

      pendingRef.current = task;
      return task;
    },
    [applyFallbackOrigin, origin, resolveFromPosition, setOriginManually],
  );

  const setOriginFromAddress = useCallback(
    async (address: string): Promise<UserMapOrigin | null> => {
      const trimmed = address.trim();
      if (!trimmed) {
        return null;
      }

      setStatus('loading');
      setGeoBlockReason(null);

      const geocoded = await resolveOriginAddressToCoords(trimmed);
      if (!geocoded) {
        setStatus('error');
        setGeoBlockReason('address_failed');
        return null;
      }

      const wgs = convertCoordinates(
        { longitude: geocoded.lng, latitude: geocoded.lat },
        'gcj02',
        'wgs84',
      );
      const next: UserMapOrigin = {
        label: normalizeOriginDisplayLabel(geocoded.label, trimmed),
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng: geocoded.lng,
        gcjLat: geocoded.lat,
      };
      setOriginManually(next);
      return next;
    },
    [setOriginManually],
  );

  const setOriginFromMapClick = useCallback(
    async (gcjLng: number, gcjLat: number): Promise<UserMapOrigin | null> => {
      const wgs = convertCoordinates(
        { longitude: gcjLng, latitude: gcjLat },
        'gcj02',
        'wgs84',
      );
      const coordLabel = formatCoordinateLabel(wgs.latitude, wgs.longitude);

      const provisional: UserMapOrigin = {
        label: coordLabel,
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng,
        gcjLat,
      };
      setOriginManually(provisional);
      return refineOriginLabel(provisional, gcjLng, gcjLat);
    },
    [refineOriginLabel, setOriginManually],
  );

  /** 后台静默：已授权 GPS 时升级一次并持久化，无 UI、不弹窗 */
  useEffect(() => {
    if (source !== 'fallback') {
      return;
    }
    void (async () => {
      const blocked = detectGeoBlockReason();
      if (blocked) {
        return;
      }
      const permission = await queryGeolocationPermission();
      if (permission !== 'granted') {
        return;
      }
      const position = await requestSilentBrowserGeolocation();
      if (!position || !mountedRef.current) {
        return;
      }
      const resolved = await resolveFromPosition(position);
      if (resolved && mountedRef.current) {
        manualLockRef.current = true;
        persistManualOrigin(resolved);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    origin,
    status,
    source,
    geoBlockReason,
    refreshOrigin,
    refreshApproximateByIp,
    applyFallbackOrigin,
    setOriginManually,
    setOriginFromAddress,
    setOriginFromMapClick,
  };
}
