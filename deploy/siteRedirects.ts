/**
 * 全站永久重定向（301/308）清单 — 与 vercel.json、public/_redirects 保持同步。
 * 用于旧链接、别名路径与 canonical URL，不包含 SPA 回退。
 */
export type SiteRedirect = {
  source: string;
  destination: string;
  /** 说明，便于维护 */
  reason: string;
};

export const sitePermanentRedirects: SiteRedirect[] = [
  { source: '/home', destination: '/', reason: '首页别名' },
  { source: '/index.html', destination: '/', reason: '避免重复收录根路径' },
  { source: '/me', destination: '/profile', reason: '个人主页别名' },
  { source: '/chat', destination: '/ai', reason: 'AI 顾问旧路径' },
  { source: '/explore', destination: '/discover', reason: '发现页旧路径' },
  { source: '/guide', destination: '/guides', reason: '攻略列表单数' },
  { source: '/plan', destination: '/discover', reason: '计划入口统一到发现流' },
];

/** Netlify _redirects 行（不含 SPA 200 回退） */
export function formatNetlifyRedirects(rules: SiteRedirect[] = sitePermanentRedirects): string {
  const lines = rules.map((r) => `${r.source}  ${r.destination}  301`);
  return [...lines, '', '# SPA：预渲染文件优先，其余回退', '/*  /index.html  200'].join('\n');
}

/** Vercel redirects 数组 */
export function formatVercelRedirects(rules: SiteRedirect[] = sitePermanentRedirects) {
  return rules.map((r) => ({
    source: r.source,
    destination: r.destination,
    permanent: true,
  }));
}
