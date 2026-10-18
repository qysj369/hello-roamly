import { convertCoordinates } from '@/lib/map/coordinates';
import {
  buildClarifyLockedSearchPlanQuery,
  buildCrossCitySearchPlanQuery,
  buildEnrichedSearchPlanQuery,
  isSameCityRegion,
  parseClarifyLockFromHandoff,
  parseTravelSearchIntent,
  resolveRealPlanCity,
} from '@/lib/map/planQueryBuilder';
import { resolveCityCenterSync } from '@/lib/map/parseTrailSearchQuery';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import {
  formatTravelSearchResolveError,
  resolveUserTravelSearch,
} from '@/lib/map/resolveUserTravelSearch';
import { parseUserTravelSearch } from '@/lib/map/userTravelSearchPipeline';
import { finalizeClarifyLockedPlan } from '@/lib/home/planDestinationDriftGuard';
import { fetchMapPlanWithStream } from '@/services/ai/api/fetchMapPlanStream';
import { GenerateMapPlanApiError } from '@/services/ai/api/generateMapPlan';
import { showGlobalApiError } from '@/stores/apiErrorStore';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import { toErrorMessage } from '@/utils/toErrorMessage';

export type LaunchHomeMapQiongYouPlanInput = {
  /** 首页已拼好的需求文案（可含出发地→目的地） */
  query: string;
  /** 用户出发地名称 */
  originName?: string | null;
  /** handoff 锁定的目的地城市（优先于文案解析，避免【出发地】干扰） */
  destinationHint?: string | null;
  signal?: AbortSignal;
};

export type LaunchHomeMapQiongYouPlanResult =
  | { ok: true }
  | { ok: false; error: string };

/** 客户端冷却：避免连点/重复 handoff 打出多路 SSE */
let lastLaunchAt = 0;
const CLIENT_LAUNCH_COOLDOWN_MS = 8_000;

/** 首页新搜索时放开冷却，避免上一轮测试挡住这一轮 */
export function resetHomeMapPlanLaunchCooldown(): void {
  lastLaunchAt = 0;
}

/** 生成失败友好文案（供 Toast，避免白屏） */
export function friendlyHomeMapPlanError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  if (
    error instanceof TypeError ||
    /Failed to fetch|NetworkError|network|ERR_INTERNET|Load failed/i.test(raw)
  ) {
    return '网络好像断了一下，请检查网络后重试';
  }
  if (error instanceof GenerateMapPlanApiError) {
    if (error.code === 'aborted') {
      return '已取消生成';
    }
    if (
      error.code === 'plan_incomplete' ||
      /超时|timeout|断开|incomplete/i.test(error.message)
    ) {
      return '生成超时或连接中断，请稍后再试';
    }
    if (error.code === 'deepseek_unconfigured') {
      return '大模型未配置，无法生成攻略';
    }
    if (error.status === 429 || error.code === 'rate_limited') {
      return '请求有点频繁，请稍等再试';
    }
    if (error.status != null && error.status >= 500) {
      return '服务暂时忙碌，请稍后再试';
    }
    return toErrorMessage(error, error.message || '攻略生成失败，请稍后再试');
  }
  if (/超时|timeout/i.test(raw)) {
    return '生成超时，请稍后再试';
  }
  if (/请输入旅行需求|空|empty/i.test(raw)) {
    return '请先输入目的地与出行信息，再生成漫行攻略';
  }
  return toErrorMessage(error, '攻略生成失败，请稍后再试');
}

/** handoff / 澄清草稿里的内部约束段，不应对用户展示，也不应参与地名解析 */
const HOLO_PLAN_META_MARKERS = [
  '【用户已确认】',
  '【慢行生成前置】',
  '【出发地】',
  '【风格说明】',
  '【玩法标签·非地名】',
  '【目的地锁定】',
  '【强制天数】',
  '【住宿与动线强制',
  '【同城准确度强制',
] as const;

/**
 * 去掉顾问 handoff 附加段，只保留用户真实出行需求，避免干扰天数/预算/地名解析。
 */
export function stripHoloPlanHandoffMeta(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return '';
  }
  let cutAt = trimmed.length;
  for (const marker of HOLO_PLAN_META_MARKERS) {
    const idx = trimmed.indexOf(marker);
    if (idx >= 0 && idx < cutAt) {
      cutAt = idx;
    }
  }
  return trimmed
    .slice(0, cutAt)
    .replace(/[。．；;,\s]+$/g, '')
    .trim();
}

/** 结果页「需求：」展示用：去掉内部约束，只留用户确认的出行摘要 */
export function formatPlanDemandForDisplay(prompt: string | null | undefined): string {
  return stripHoloPlanHandoffMeta(prompt ?? '');
}

const PREFERENCE_AS_PIN =
  /^(?:美食探店|近郊轻游|人文慢逛|亲子时光|自然山水|自然山|海景|民俗|偏好|风光|Nearby soft trip|Culture stroll|Food lanes|Family time|Nature)$/i;

/** 结果针脚只显示锁定城市，不把玩法偏好当成地名 */
export function resolveClarifyPinLabel(
  raw: string | null | undefined,
  lockedCity?: string | null,
  preference?: string | null,
): string {
  const city = resolveRealPlanCity(lockedCity) || lockedCity?.trim();
  if (city && !PREFERENCE_AS_PIN.test(city)) {
    return sanitizeLocationLabelForDisplay(city);
  }
  const cleaned = resolveRealPlanCity(raw) || sanitizeLocationLabelForDisplay(raw);
  if (
    PREFERENCE_AS_PIN.test(cleaned) ||
    (preference?.trim() && cleaned === preference.trim())
  ) {
    return '所选地点';
  }
  return cleaned;
}

/**
 * 首页 / 顾问 home_map：走旧版地图漫行流水线（四区块 Markdown + PlanResultView）。
 * 不改 mapPlanStreamPipeline 业务逻辑，仅复用既有 SSE 与全局结果浮层。
 */
export async function launchHomeMapQiongYouPlan(
  input: LaunchHomeMapQiongYouPlanInput,
): Promise<LaunchHomeMapQiongYouPlanResult> {
  const trimmed = stripHoloPlanHandoffMeta(input.query);
  if (!trimmed) {
    return { ok: false, error: '请输入旅行需求' };
  }

  const clarifyLock = parseClarifyLockFromHandoff(input.query);

  const store = useGlobalMapPlanningStore.getState();
  if (store.planStreaming) {
    const error = '正在生成中，请稍候';
    showGlobalApiError(error);
    return { ok: false, error };
  }

  const now = Date.now();
  if (now - lastLaunchAt < CLIENT_LAUNCH_COOLDOWN_MS) {
    const waitSec = Math.ceil((CLIENT_LAUNCH_COOLDOWN_MS - (now - lastLaunchAt)) / 1000);
    const error = `生成过于频繁，请 ${waitSec} 秒后再试`;
    showGlobalApiError(error);
    return { ok: false, error };
  }
  lastLaunchAt = now;

  const originName = input.originName?.trim() || null;
  const destinationHint = [
    clarifyLock?.city,
    input.destinationHint?.trim(),
    parseTravelSearchIntent(trimmed).destinationHint?.trim(),
  ].find((hint) => hint && !PREFERENCE_AS_PIN.test(hint)) || null;

  const localPreview =
    (destinationHint ? resolveCityCenterSync(destinationHint) : null) ??
    resolveCityCenterSync(trimmed) ??
    (parseTravelSearchIntent(trimmed).destinationHint
      ? resolveCityCenterSync(parseTravelSearchIntent(trimmed).destinationHint!)
      : null);

  let provisionalGcj = { lng: 116.4074, lat: 39.9042 };
  let provisionalLabel = resolveClarifyPinLabel(
    destinationHint || trimmed,
    clarifyLock?.city,
    clarifyLock?.preference,
  );
  if (localPreview) {
    const previewGcj = convertCoordinates(
      { longitude: localPreview.longitude, latitude: localPreview.latitude },
      localPreview.coordSystem,
      'gcj02',
    );
    provisionalGcj = { lng: previewGcj.longitude, lat: previewGcj.latitude };
    provisionalLabel = localPreview.label;
  }

  store.beginPlanStreamSession({
    trigger: 'search',
    locationName: provisionalLabel,
    lng: provisionalGcj.lng,
    lat: provisionalGcj.lat,
    initialQuery: trimmed,
  });

  try {
    /** 优先用锁定目的地解析，避免 handoff 里【出发地】区县抢成结果城市 */
    const resolved =
      (destinationHint ? await resolveUserTravelSearch(destinationHint) : null) ??
      (await resolveUserTravelSearch(trimmed));
    if (!resolved) {
      store.closeResult();
      const error = formatTravelSearchResolveError(
        parseUserTravelSearch(destinationHint || trimmed),
      );
      showGlobalApiError(error);
      return { ok: false, error };
    }

    const gcj = convertCoordinates(
      { longitude: resolved.location.longitude, latitude: resolved.location.latitude },
      resolved.location.coordSystem,
      'gcj02',
    );
    const destLabel = resolveClarifyPinLabel(
      clarifyLock?.city || destinationHint || resolved.location.label,
      clarifyLock?.city,
      clarifyLock?.preference,
    );
    const attachOrigin =
      Boolean(originName) && !isSameCityRegion(originName!, destLabel);
    const effectiveOrigin = attachOrigin ? originName : null;
    const aiQuery = clarifyLock
      ? buildClarifyLockedSearchPlanQuery(effectiveOrigin, clarifyLock)
      : (() => {
          const intent = parseTravelSearchIntent(trimmed);
          return effectiveOrigin
            ? buildCrossCitySearchPlanQuery(effectiveOrigin, destLabel, intent, trimmed)
            : buildEnrichedSearchPlanQuery(trimmed, destLabel, intent);
        })();

    /** 结果标题只展示目的地城市，不把出发区县写进 location 针脚 */
    useGlobalMapPlanningStore.setState({
      resultLocation: destLabel,
      coords: { lng: gcj.longitude, lat: gcj.latitude },
    });

    const result = await fetchMapPlanWithStream({
      params: {
        lng: gcj.longitude,
        lat: gcj.latitude,
        query: aiQuery,
        /** 用清洗后的需求文案做天数截断依据，避免 handoff 附加段干扰 */
        searchQuery: aiQuery,
        initialQuery: trimmed,
        locationName: destLabel,
        originName: effectiveOrigin ?? undefined,
      },
      signal: input.signal,
      onDelta: (text) => {
        useGlobalMapPlanningStore.getState().appendPlanStreamDelta(text);
      },
      onSync: (full) => {
        useGlobalMapPlanningStore.getState().replacePlanStreamContent(full);
      },
      onStatus: (message) => {
        useGlobalMapPlanningStore.getState().setPlanStreamStatus(message);
      },
    });
    let content = result.content.trim();

    if (clarifyLock && content) {
      content = finalizeClarifyLockedPlan(content, clarifyLock);
      useGlobalMapPlanningStore.getState().replacePlanStreamContent(content);
    }
    if (!content) {
      store.closeResult();
      const error = '方案内容为空，请重试';
      showGlobalApiError(error);
      return { ok: false, error };
    }

    useGlobalMapPlanningStore.getState().finishPlanStream({
      trigger: 'search',
      locationName: destLabel,
      content,
      lng: gcj.longitude,
      lat: gcj.latitude,
      initialQuery: trimmed,
    });

    return { ok: true };
  } catch (error) {
    useGlobalMapPlanningStore.getState().closeResult();
    if (input.signal?.aborted) {
      return { ok: false, error: '已取消生成' };
    }
    const message = friendlyHomeMapPlanError(error);
    showGlobalApiError(message);
    return { ok: false, error: message };
  }
}
