import { routeLoaders, type RouteChunkKey } from '@/router/lazyPages';
import { paths } from '@/router/paths';

const prefetched = new Set<RouteChunkKey>();

const PATH_TO_CHUNK: Record<string, RouteChunkKey> = {
  [paths.discover]: 'discover',
  [paths.ai]: 'ai',
  [paths.aiSnail]: 'aiSnail',
  [paths.guides]: 'guides',
  [paths.travelBuddies]: 'travelBuddies',
  [paths.profile]: 'userProfile',
  [paths.messages]: 'messages',
  [paths.about]: 'about',
  [paths.snailCulture]: 'snailCulture',
};

/** 浏览器空闲时预加载的常用 Tab（不含首页） */
export const IDLE_PREFETCH_PATHS = [
  paths.discover,
  paths.messages,
  paths.ai,
] as const;

export function prefetchRouteChunk(key: RouteChunkKey): void {
  if (prefetched.has(key)) {
    return;
  }
  prefetched.add(key);
  void routeLoaders[key]();
}

function normalizePath(path: string): string {
  const pathname = path.split('?')[0]!.split('#')[0]!;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

export function prefetchRouteByPath(path: string): void {
  const normalized = normalizePath(path);

  if (normalized === paths.home) {
    return;
  }

  const exact = PATH_TO_CHUNK[normalized];
  if (exact) {
    prefetchRouteChunk(exact);
    return;
  }

  if (normalized.startsWith(`${paths.guides}/`)) {
    prefetchRouteChunk('guideDetail');
    return;
  }

  if (normalized.startsWith(`${paths.plans}/`)) {
    prefetchRouteChunk('travelPlanDetail');
    return;
  }

  if (normalized.startsWith(`${paths.users}/`) || normalized === paths.profile) {
    prefetchRouteChunk('userProfile');
    return;
  }

  if (normalized.startsWith(`${paths.messages}/`)) {
    prefetchRouteChunk('messages');
  }
}

export function prefetchRoutesOnIdle(routes: readonly string[] = IDLE_PREFETCH_PATHS): void {
  const run = () => {
    for (const route of routes) {
      prefetchRouteByPath(route);
    }
  };

  if (typeof window === 'undefined') {
    return;
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 3000 });
  } else {
    globalThis.setTimeout(run, 1500);
  }
}

/** 悬停 / 聚焦 / 触摸导航时预加载 */
export function getRoutePrefetchHandlers(to: string) {
  return {
    onMouseEnter: () => prefetchRouteByPath(to),
    onFocus: () => prefetchRouteByPath(to),
    onTouchStart: () => prefetchRouteByPath(to),
  };
}
