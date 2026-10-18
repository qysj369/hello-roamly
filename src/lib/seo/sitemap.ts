import { demoGuides } from '../../data/demoGuides';
import { DEMO_USERS } from '../../data/demoUsers';
import {
  guideDetailPath,
  paths,
  travelPlanDetailPath,
  userProfilePath,
} from '../../router/paths';

export const DEFAULT_SITE_ORIGIN = 'https://helloroamly.com';

export type SitemapChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapEntry = {
  path: string;
  lastmod?: string;
  changefreq?: SitemapChangeFreq;
  priority?: number;
};

/** 构建 / 生成脚本使用的站点根 URL（优先 VITE_SITE_URL） */
export function getSiteOriginForBuild(): string {
  const fromEnv = process.env.VITE_SITE_URL?.trim().replace(/\/$/, '');
  return fromEnv || DEFAULT_SITE_ORIGIN;
}

function toAbsoluteUrl(origin: string, pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin.replace(/\/$/, '')}${path}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(iso?: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

/** 汇总应被搜索引擎收录的站内路径（不含私信、404） */
export function collectSitemapEntries(): SitemapEntry[] {
  const today = new Date().toISOString().slice(0, 10);

  const staticPages: SitemapEntry[] = [
    { path: paths.home, changefreq: 'daily', priority: 1 },
    { path: paths.discover, changefreq: 'daily', priority: 0.9 },
    { path: paths.guides, changefreq: 'weekly', priority: 0.9 },
    { path: paths.ai, changefreq: 'weekly', priority: 0.6 },
    { path: paths.profile, changefreq: 'weekly', priority: 0.5 },
    { path: paths.about, changefreq: 'monthly', priority: 0.4, lastmod: today },
    { path: paths.snailCulture, changefreq: 'monthly', priority: 0.35, lastmod: today },
    { path: paths.cities, changefreq: 'weekly', priority: 0.8, lastmod: today },
    { path: paths.budget, changefreq: 'monthly', priority: 0.55, lastmod: today },
    { path: paths.mp, changefreq: 'weekly', priority: 0.5, lastmod: today },
    { path: paths.inspire, changefreq: 'weekly', priority: 0.85, lastmod: today },
    { path: paths.privacy, changefreq: 'monthly', priority: 0.3, lastmod: today },
    { path: paths.terms, changefreq: 'monthly', priority: 0.3, lastmod: today },
    { path: paths.contact, changefreq: 'monthly', priority: 0.3, lastmod: today },
    { path: paths.feedback, changefreq: 'monthly', priority: 0.3, lastmod: today },
  ];

  const guidePages: SitemapEntry[] = demoGuides.map((guide) => ({
    path: guideDetailPath(guide.id),
    lastmod: formatLastmod(guide.updatedAt),
    changefreq: 'weekly',
    priority: 0.8,
  }));

  const planPages: SitemapEntry[] = demoGuides.map((guide) => ({
    path: travelPlanDetailPath(`plan-${guide.id}`),
    lastmod: formatLastmod(guide.updatedAt),
    changefreq: 'weekly' as const,
    priority: 0.7,
  }));

  const publicUserPages: SitemapEntry[] = DEMO_USERS.map((user) => ({
    path: userProfilePath(user.id),
    changefreq: 'weekly' as const,
    priority: 0.5,
    lastmod: formatLastmod(user.updatedAt),
  }));

  const byPath = new Map<string, SitemapEntry>();
  for (const entry of [...staticPages, ...guidePages, ...planPages, ...publicUserPages]) {
    byPath.set(entry.path, entry);
  }

  return [...byPath.values()];
}

export function renderSitemapXml(origin: string, entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map((entry) => {
      const loc = escapeXml(toAbsoluteUrl(origin, entry.path));
      const parts = [`    <loc>${loc}</loc>`];
      if (entry.lastmod) {
        parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }
      if (entry.changefreq) {
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export function renderRobotsTxt(origin: string): string {
  const sitemapUrl = toAbsoluteUrl(origin, '/sitemap.xml');

  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# 私信会话页已在页面 meta 中标记 noindex
Disallow: ${paths.messages}
Disallow: ${paths.messages}/

Sitemap: ${sitemapUrl}
`;
}
