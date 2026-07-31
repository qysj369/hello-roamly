import { applyImageCdnProxy, resolveRemoteImageUrl, shouldUseForeignImageProxy } from '@/lib/cdn';

/** 响应式宽度档位（与 next/image sizes 思路一致） */
export const DEFAULT_IMAGE_WIDTHS = [320, 640, 960, 1280] as const;

export type OptimizedImageSources = {
  fallback: string;
  webp?: string;
  fallbackSrcSet?: string;
  webpSrcSet?: string;
};

export type ResolveImageOptions = {
  widths?: readonly number[];
};

function isOptimizableRemoteUrl(src: string): boolean {
  return (
    src.startsWith('https://') &&
    !src.startsWith('data:') &&
    !src.startsWith('blob:')
  );
}

function clampWidth(width: number): number {
  return Math.min(1920, Math.max(16, Math.round(width)));
}

function applyUnsplashParams(url: URL, width: number, format?: 'webp'): string {
  const next = new URL(url.toString());
  next.searchParams.set('w', String(clampWidth(width)));
  next.searchParams.set('q', '80');
  next.searchParams.set('fit', 'crop');
  next.searchParams.set('auto', 'format');
  if (format === 'webp') {
    next.searchParams.set('fm', 'webp');
  }
  return next.toString();
}

function buildUnsplashSrcSet(src: string, widths: readonly number[], format?: 'webp'): string {
  try {
    const base = new URL(src);
    if (!base.hostname.includes('unsplash.com')) {
      return '';
    }
    return widths
      .map((width) => `${applyUnsplashParams(base, width, format)} ${width}w`)
      .join(', ');
  } catch {
    return '';
  }
}

/** picsum：按 seed 生成多宽度 JPEG srcset */
function buildPicsumSrcSet(src: string, widths: readonly number[]): string | undefined {
  const match = src.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
  if (!match) {
    return undefined;
  }
  const [, seed, widthStr, heightStr] = match;
  const baseW = Number(widthStr);
  const baseH = Number(heightStr);
  if (!seed || !baseW || !baseH) {
    return undefined;
  }
  const ratio = baseH / baseW;
  return widths
    .map((width) => {
      const height = Math.round(width * ratio);
      return `https://picsum.photos/seed/${seed}/${width}/${height} ${width}w`;
    })
    .join(', ');
}

/**
 * 演示环境：为 picsum 生成 WebP（可替换为自建 imgproxy / Cloudinary）
 * 生产建议配置 VITE_IMAGE_CDN 或使用 Unsplash 等原生支持 WebP 的源
 */
// TODO: 生产禁用 wsrv.nl 境外代理，统一走 VITE_IMAGE_CDN / 对象存储转码
function buildPicsumWebpUrl(src: string, width?: number): string | undefined {
  const proxied = applyImageCdnProxy(src, { width, format: 'webp' });
  if (proxied !== src) {
    return proxied;
  }
  if (!shouldUseForeignImageProxy()) {
    return undefined;
  }
  const encoded = encodeURIComponent(src);
  const w = width ? `&w=${clampWidth(width)}` : '';
  return `https://wsrv.nl/?url=${encoded}&output=webp&q=82${w}`;
}

function buildPicsumWebpSrcSet(src: string, widths: readonly number[]): string | undefined {
  const match = src.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
  if (!match) {
    return undefined;
  }
  const [, seed, widthStr, heightStr] = match;
  const baseW = Number(widthStr);
  const baseH = Number(heightStr);
  if (!seed || !baseW || !baseH) {
    return undefined;
  }
  const ratio = baseH / baseW;
  return widths
    .map((width) => {
      const height = Math.round(width * ratio);
      const jpeg = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      return `${buildPicsumWebpUrl(jpeg, width)} ${width}w`;
    })
    .join(', ');
}

export function toWebpUrl(src: string, width?: number): string | undefined {
  if (!isOptimizableRemoteUrl(src)) {
    return undefined;
  }

  try {
    const url = new URL(src);
    if (url.hostname.includes('unsplash.com')) {
      return applyUnsplashParams(url, width ?? (Number(url.searchParams.get('w')) || 640), 'webp');
    }
    if (url.hostname === 'picsum.photos') {
      return buildPicsumWebpUrl(src, width);
    }
    if (/\.(jpe?g|png)$/i.test(url.pathname)) {
      return src.replace(/\.(jpe?g|png)$/i, '.webp');
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function resolveOptimizedImageSources(
  src: string,
  options: ResolveImageOptions = {},
): OptimizedImageSources {
  const widths = options.widths ?? DEFAULT_IMAGE_WIDTHS;

  if (!src || !isOptimizableRemoteUrl(src)) {
    return { fallback: src };
  }

  const cdnSrc = resolveRemoteImageUrl(src);

  try {
    const url = new URL(cdnSrc);

    if (url.hostname.includes('unsplash.com')) {
      const fallbackSrcSet = buildUnsplashSrcSet(cdnSrc, widths);
      const webpSrcSet = buildUnsplashSrcSet(cdnSrc, widths, 'webp');
      return {
        fallback: applyUnsplashParams(url, widths[1] ?? widths[0] ?? 640),
        webp: applyUnsplashParams(url, widths[1] ?? widths[0] ?? 640, 'webp'),
        fallbackSrcSet: fallbackSrcSet || undefined,
        webpSrcSet: webpSrcSet || undefined,
      };
    }

    if (url.hostname === 'picsum.photos') {
      const fallbackSrcSet = buildPicsumSrcSet(cdnSrc, widths);
      const webpSrcSet = buildPicsumWebpSrcSet(cdnSrc, widths);
      const webp = buildPicsumWebpUrl(cdnSrc, widths[1] ?? widths[0]);
      return {
        fallback: cdnSrc,
        webp,
        fallbackSrcSet,
        webpSrcSet,
      };
    }
  } catch {
    return { fallback: cdnSrc };
  }

  const webp = toWebpUrl(cdnSrc);
  return {
    fallback: cdnSrc,
    webp,
  };
}
