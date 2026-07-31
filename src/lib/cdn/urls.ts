import {
  allowForeignImageProxy,
  getAssetCdnBase,
  getImageCdnTemplate,
  hasImageCdn,
  preferChinaCdn,
} from './config';

/** 规范化 Vite `base`（必须以 / 结尾） */
export function normalizeViteBase(base: string | undefined): string {
  if (!base?.trim()) {
    return '/';
  }
  const trimmed = base.trim();
  if (trimmed === '/') {
    return '/';
  }
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

/**
 * 将远程图片 URL 套上一层国内 CDN / 图片处理服务。
 * 未配置 VITE_IMAGE_CDN 时原样返回。
 */
export function applyImageCdnProxy(
  remoteUrl: string,
  params?: { width?: number; format?: 'webp' },
): string {
  const template = getImageCdnTemplate();
  if (!template || !remoteUrl.startsWith('http')) {
    return remoteUrl;
  }

  const encoded = encodeURIComponent(remoteUrl);
  let result = template.includes('{url}')
    ? template.replace(/\{url\}/g, encoded)
    : `${template}${template.includes('?') ? '&' : '?'}url=${encoded}`;

  if (params?.width) {
    result += `${result.includes('?') ? '&' : '?'}w=${Math.round(params.width)}`;
  }
  if (params?.format === 'webp') {
    result += `${result.includes('?') ? '&' : '?'}format=webp`;
  }

  return result;
}

/** 远程图片统一入口（配置 VITE_IMAGE_CDN 时走国内图床/代理） */
export function resolveRemoteImageUrl(
  remoteUrl: string,
  params?: { width?: number; format?: 'webp' },
): string {
  if (!remoteUrl.startsWith('http')) {
    return remoteUrl;
  }
  if (getImageCdnTemplate()?.trim()) {
    return applyImageCdnProxy(remoteUrl, params);
  }
  return remoteUrl;
}

/**
 * 站内相对路径资源（public 或构建产物）。
 * 运行时若配置了 VITE_CDN_BASE 则拼上 CDN 域名。
 */
export function resolvePublicAssetUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const cdnBase = getAssetCdnBase();
  if (!cdnBase) {
    return normalizedPath;
  }
  const base = normalizeViteBase(cdnBase);
  if (base.startsWith('http')) {
    return new URL(normalizedPath.replace(/^\//, ''), base).toString();
  }
  return `${base.replace(/\/$/, '')}${normalizedPath}`;
}

/** 是否应使用境外 wsrv.nl 等演示 WebP 代理 */
export function shouldUseForeignImageProxy(): boolean {
  if (allowForeignImageProxy()) {
    return true;
  }
  if (preferChinaCdn() && hasImageCdn()) {
    return false;
  }
  return !preferChinaCdn();
}
