import { collectSitemapEntries } from '../seo/sitemap';
import { paths } from '../../router/paths';

/** 不参与预渲染的路由（重交互 / 私信 / 地图依赖 token） */
const PRERENDER_EXCLUDED = new Set<string>([paths.messages, paths.map]);

function isExcluded(pathname: string): boolean {
  if (PRERENDER_EXCLUDED.has(pathname)) {
    return true;
  }
  return [...PRERENDER_EXCLUDED].some(
    (prefix) => prefix !== '/' && (pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
}

/**
 * 构建时预渲染的路径（与 sitemap 同步，排除私信与地图）。
 * 含首页、发现、攻略列表/详情、旅行计划详情、关于、AI、个人主页等。
 */
export function collectPrerenderPaths(): string[] {
  return collectSitemapEntries()
    .map((entry) => entry.path)
    .filter((pathname) => !isExcluded(pathname));
}
