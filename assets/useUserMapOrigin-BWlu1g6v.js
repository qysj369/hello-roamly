import { a as reactExports } from "./vendor-react-DtfH6MSw.js";
import { b as buildDefaultDemoOrigin } from "./defaultMapOrigin-DM9zdaEz.js";
import { c as reverseGeocodeAmapLabels, r as resolveOriginAddressToCoords } from "./amapGeocoderClient-CjYlis2t.js";
import { c as convertCoordinates } from "./coordinates-D-_oeTwy.js";
import { bV as formatCoordinateLabel } from "./index-DwV1qlqh.js";
function withTimeout(promise, ms, message = "请求超时，请重试") {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(message));
    }, ms);
    promise.then((value) => {
      window.clearTimeout(timer);
      resolve(value);
    }).catch((err) => {
      window.clearTimeout(timer);
      reject(err);
    });
  });
}
function normalizeOriginDisplayLabel(geocodedLabel, userInput) {
  const input = (userInput == null ? void 0 : userInput.trim()) ?? "";
  const fromGeocode = geocodedLabel.trim().replace(/^中国/, "").replace(/^山东省/, "").trim();
  if (!input) {
    return fromGeocode;
  }
  if (input.length > fromGeocode.length && /路|街|小区|花园|苑|号|村|镇/.test(input)) {
    return input.replace(/^山东省/, "").trim();
  }
  return fromGeocode || input;
}
async function queryGeolocationPermission() {
  var _a;
  if (typeof navigator === "undefined" || !((_a = navigator.permissions) == null ? void 0 : _a.query)) {
    return "unknown";
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch {
    return "unknown";
  }
}
function isSecureContextForGeolocation() {
  return typeof window !== "undefined" && window.isSecureContext;
}
function isEmbeddedBrowsingContext() {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    if (window.self !== window.top) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}
function mapRawGeolocationError(err) {
  if (err instanceof GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) {
      return "denied";
    }
    if (err.code === err.TIMEOUT) {
      return "timeout";
    }
    return "unavailable";
  }
  if (err instanceof Error) {
    if (err.message === "timeout") {
      return "timeout";
    }
    if (err.message === "unsupported") {
      return "unsupported";
    }
  }
  return "unavailable";
}
async function classifyGeolocationFailure(err) {
  const raw = mapRawGeolocationError(err);
  if (!isSecureContextForGeolocation()) {
    return "insecure";
  }
  if (isEmbeddedBrowsingContext() && raw === "timeout") {
    return "no_popup";
  }
  if (raw === "denied") {
    return "denied";
  }
  if (raw !== "timeout") {
    return raw;
  }
  const permission = await queryGeolocationPermission();
  if (permission === "denied") {
    return "denied";
  }
  if (permission === "prompt") {
    return "no_popup";
  }
  return "system_off";
}
async function fetchApproximateLocationByIp(signal) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8e3);
  try {
    const response = await fetch(
      "https://ip-api.com/json/?lang=zh-CN&fields=status,message,city,regionName,lat,lon",
      { signal: controller.signal }
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.status !== "success" || data.lat == null || data.lon == null) {
      return null;
    }
    const label = [data.regionName, data.city].filter(Boolean).join("") || "当前城市";
    return {
      label,
      latitude: data.lat,
      longitude: data.lon
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
const LOW_ACCURACY = {
  enableHighAccuracy: false,
  timeout: 8e3,
  maximumAge: 3e5
};
const HIGH_ACCURACY = {
  enableHighAccuracy: true,
  timeout: 12e3,
  maximumAge: 0
};
function getCurrentPositionOnce(options, raceMs) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    const timer = window.setTimeout(() => {
      reject(new Error("timeout"));
    }, raceMs);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve(position);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
      options
    );
  });
}
async function requestSilentBrowserGeolocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }
  try {
    return await getCurrentPositionOnce(
      {
        enableHighAccuracy: false,
        timeout: 5e3,
        maximumAge: 6e5
      },
      5500
    );
  } catch {
    return null;
  }
}
async function requestBrowserGeolocation() {
  try {
    return await getCurrentPositionOnce(LOW_ACCURACY, 9e3);
  } catch (firstError) {
    if (firstError instanceof GeolocationPositionError && firstError.code === firstError.PERMISSION_DENIED) {
      throw firstError;
    }
    return getCurrentPositionOnce(HIGH_ACCURACY, 14e3);
  }
}
const MANUAL_ORIGIN_STORAGE_KEY = "hello-roamly-manual-origin";
const MANUAL_ORIGIN_LOCAL_KEY = "hello-roamly-manual-origin-v2";
const REVERSE_GEO_TIMEOUT_MS = 1e4;
const GPS_LOW_ACCURACY_METERS = 800;
function detectGeoBlockReason() {
  if (!isSecureContextForGeolocation()) {
    return "insecure";
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  return null;
}
function normalizeStoredOrigin(origin) {
  const demo = buildDefaultDemoOrigin();
  const legacyDistrictCenter = Math.abs((origin.gcjLng ?? 0) - 117.076) < 2e-3 && Math.abs((origin.gcjLat ?? 0) - 36.666) < 2e-3;
  const coarseLixiaLabel = /^(山东省)?济南市历下区$/.test(origin.label.trim()) && !/百合|中林路/.test(origin.label);
  if (legacyDistrictCenter || coarseLixiaLabel) {
    return demo;
  }
  if (/网络近似/.test(origin.label)) {
    return demo;
  }
  const label = normalizeOriginDisplayLabel(origin.label);
  return label === origin.label ? origin : { ...origin, label };
}
function loadStoredManualOrigin() {
  for (const key of [MANUAL_ORIGIN_LOCAL_KEY, MANUAL_ORIGIN_STORAGE_KEY]) {
    try {
      const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
      if (!raw) {
        continue;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed.label === "string" && typeof parsed.longitude === "number" && typeof parsed.latitude === "number") {
        const upgraded = normalizeStoredOrigin(parsed);
        if (upgraded.label !== parsed.label || upgraded.gcjLng !== parsed.gcjLng || upgraded.gcjLat !== parsed.gcjLat) {
          persistManualOrigin(upgraded);
        }
        return upgraded;
      }
    } catch {
    }
  }
  return null;
}
function persistManualOrigin(origin) {
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
  }
}
function loadInitialOriginState() {
  const stored = loadStoredManualOrigin();
  if (stored) {
    return {
      origin: stored,
      status: "ready",
      source: "manual",
      manualLock: true
    };
  }
  const demo = buildDefaultDemoOrigin();
  persistManualOrigin(demo);
  return {
    origin: demo,
    status: "fallback",
    source: "fallback",
    manualLock: true
  };
}
function useUserMapOrigin() {
  const initial = loadInitialOriginState();
  const [origin, setOrigin] = reactExports.useState(initial.origin);
  const [status, setStatus] = reactExports.useState(initial.status);
  const [source, setSource] = reactExports.useState(initial.source);
  const [geoBlockReason, setGeoBlockReason] = reactExports.useState(null);
  const pendingRef = reactExports.useRef(null);
  const manualLockRef = reactExports.useRef(initial.manualLock);
  const mountedRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const applyFallbackOrigin = reactExports.useCallback(() => {
    const next = buildDefaultDemoOrigin();
    manualLockRef.current = false;
    persistManualOrigin(null);
    setOrigin(next);
    setSource("fallback");
    setStatus("fallback");
    setGeoBlockReason(null);
    return next;
  }, []);
  const setOriginManually = reactExports.useCallback((next, originSource = "manual") => {
    manualLockRef.current = true;
    persistManualOrigin(next);
    setOrigin(next);
    setSource(originSource);
    setStatus("ready");
    setGeoBlockReason(null);
  }, []);
  const refineOriginLabel = reactExports.useCallback(
    async (base, gcjLng, gcjLat) => {
      try {
        const labels = await withTimeout(
          reverseGeocodeAmapLabels(gcjLng, gcjLat),
          REVERSE_GEO_TIMEOUT_MS,
          "逆地理超时"
        );
        const refined = (labels == null ? void 0 : labels.originLabel) ?? (labels == null ? void 0 : labels.nearbyLabel) ?? (labels == null ? void 0 : labels.destinationLabel) ?? null;
        if (refined && mountedRef.current) {
          const refinedOrigin = {
            ...base,
            label: normalizeOriginDisplayLabel(refined, base.label)
          };
          if (manualLockRef.current) {
            persistManualOrigin(refinedOrigin);
          }
          setOrigin(refinedOrigin);
          return refinedOrigin;
        }
      } catch {
      }
      return base;
    },
    []
  );
  const resolveFromWgs = reactExports.useCallback(
    async (wgs, originSource) => {
      const gcj = convertCoordinates(wgs, "wgs84", "gcj02");
      const coordLabel = formatCoordinateLabel(wgs.latitude, wgs.longitude);
      const next = {
        label: coordLabel,
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng: gcj.longitude,
        gcjLat: gcj.latitude
      };
      setOrigin(next);
      setSource(originSource);
      setStatus("ready");
      setGeoBlockReason(null);
      return refineOriginLabel(next, gcj.longitude, gcj.latitude);
    },
    [refineOriginLabel]
  );
  const resolveFromPosition = reactExports.useCallback(
    async (position) => {
      const result = await resolveFromWgs(
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude
        },
        "gps"
      );
      const accuracy = position.coords.accuracy;
      if (Number.isFinite(accuracy) && accuracy > GPS_LOW_ACCURACY_METERS) {
        setGeoBlockReason("low_accuracy");
      }
      return result;
    },
    [resolveFromWgs]
  );
  const trySilentIpOrigin = reactExports.useCallback(async () => {
    const ip = await fetchApproximateLocationByIp();
    if (!ip) {
      return null;
    }
    const gcj = convertCoordinates(
      { longitude: ip.longitude, latitude: ip.latitude },
      "wgs84",
      "gcj02"
    );
    const provisional = {
      label: `${ip.label}（网络近似）`,
      longitude: ip.longitude,
      latitude: ip.latitude,
      gcjLng: gcj.longitude,
      gcjLat: gcj.latitude
    };
    manualLockRef.current = true;
    setOriginManually(provisional, "ip");
    const refined = await refineOriginLabel(provisional, gcj.longitude, gcj.latitude);
    const withHint = {
      ...refined,
      label: refined.label.includes("近似") ? refined.label : `${refined.label}（网络近似）`
    };
    setOriginManually(withHint, "ip");
    return withHint;
  }, [refineOriginLabel, setOriginManually]);
  const refreshApproximateByIp = reactExports.useCallback(async () => {
    setStatus("loading");
    setGeoBlockReason(null);
    const result = await trySilentIpOrigin();
    if (!result) {
      setStatus("error");
      setGeoBlockReason("unavailable");
    }
    return result;
  }, [trySilentIpOrigin]);
  const refreshOrigin = reactExports.useCallback(
    (options) => {
      var _a;
      if (pendingRef.current && !(options == null ? void 0 : options.force)) {
        return pendingRef.current;
      }
      pendingRef.current = null;
      if (manualLockRef.current && origin && !(options == null ? void 0 : options.force)) {
        return Promise.resolve(origin);
      }
      const backupManual = manualLockRef.current && ((_a = origin == null ? void 0 : origin.label) == null ? void 0 : _a.trim()) ? origin : loadStoredManualOrigin();
      if (options == null ? void 0 : options.force) {
        manualLockRef.current = false;
      }
      const blocked = detectGeoBlockReason();
      if (blocked) {
        setGeoBlockReason(blocked);
        setStatus(blocked === "insecure" ? "insecure" : "unsupported");
        if (backupManual) {
          setOriginManually(backupManual);
          return Promise.resolve(backupManual);
        }
        setOrigin(null);
        return Promise.resolve(null);
      }
      setStatus("loading");
      setGeoBlockReason(null);
      const restoreManualIfNeeded = () => {
        if (!backupManual) {
          return null;
        }
        setOriginManually(backupManual);
        return backupManual;
      };
      const task = requestBrowserGeolocation().then((position) => {
        persistManualOrigin(null);
        return resolveFromPosition(position);
      }).catch(async (err) => {
        const reason = await classifyGeolocationFailure(err);
        setGeoBlockReason(reason);
        const restored = restoreManualIfNeeded();
        if (restored) {
          return restored;
        }
        setOrigin(null);
        setStatus(reason === "denied" ? "denied" : "error");
        return null;
      }).finally(() => {
        pendingRef.current = null;
      });
      pendingRef.current = task;
      return task;
    },
    [applyFallbackOrigin, origin, resolveFromPosition, setOriginManually]
  );
  const setOriginFromAddress = reactExports.useCallback(
    async (address) => {
      const trimmed = address.trim();
      if (!trimmed) {
        return null;
      }
      setStatus("loading");
      setGeoBlockReason(null);
      const geocoded = await resolveOriginAddressToCoords(trimmed);
      if (!geocoded) {
        setStatus("error");
        setGeoBlockReason("address_failed");
        return null;
      }
      const wgs = convertCoordinates(
        { longitude: geocoded.lng, latitude: geocoded.lat },
        "gcj02",
        "wgs84"
      );
      const next = {
        label: normalizeOriginDisplayLabel(geocoded.label, trimmed),
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng: geocoded.lng,
        gcjLat: geocoded.lat
      };
      setOriginManually(next);
      return next;
    },
    [setOriginManually]
  );
  const setOriginFromMapClick = reactExports.useCallback(
    async (gcjLng, gcjLat) => {
      const wgs = convertCoordinates(
        { longitude: gcjLng, latitude: gcjLat },
        "gcj02",
        "wgs84"
      );
      const coordLabel = formatCoordinateLabel(wgs.latitude, wgs.longitude);
      const provisional = {
        label: coordLabel,
        longitude: wgs.longitude,
        latitude: wgs.latitude,
        gcjLng,
        gcjLat
      };
      setOriginManually(provisional);
      return refineOriginLabel(provisional, gcjLng, gcjLat);
    },
    [refineOriginLabel, setOriginManually]
  );
  reactExports.useEffect(() => {
    if (source !== "fallback") {
      return;
    }
    void (async () => {
      const blocked = detectGeoBlockReason();
      if (blocked) {
        return;
      }
      const permission = await queryGeolocationPermission();
      if (permission !== "granted") {
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
    setOriginFromMapClick
  };
}
export {
  useUserMapOrigin as u,
  withTimeout as w
};
