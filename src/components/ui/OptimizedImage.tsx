import { useCallback, useMemo, useState } from 'react';
import { useIntersectionInView } from '@/hooks/browser/useIntersectionInView';
import {
  DEFAULT_IMAGE_WIDTHS,
  resolveOptimizedImageSources,
  type ResolveImageOptions,
} from '@/utils/imageOptimize';
import { cn } from '@/utils/cn';

/**
 * 远程图片组件 props（类 next/image 行为）。
 *
 * @property src - 图片 URL（支持 Unsplash / picsum / 经 CDN 代理的地址）
 * @property alt - 有意义的替代文本；`decorative` 为 true 时忽略
 * @property decorative - 装饰图：输出 `alt=""`，开发环境不警告缺 alt
 * @property fill - 父级需 `position: relative`，图片绝对定位铺满
 * @property priority - 首屏图：禁用懒加载、`loading="eager"`
 */
export type OptimizedImageProps = {
  src: string;
  alt: string;
  /** 装饰性图片：对读屏隐藏，使用 alt="" */
  decorative?: boolean;
  className?: string;
  /** 父级需 `position: relative`；图片绝对铺满 */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  widths?: readonly number[];
  /** 首屏关键图：跳过早退懒加载、loading=eager */
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
};

const DEFAULT_SIZES = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px';

/**
 * 响应式图片：Intersection 懒加载、WebP `<picture>`、srcset。
 *
 * @remarks
 * 生产环境应配置 `VITE_IMAGE_CDN`；picsum 演示图在无 CDN 时可能走境外 WebP 代理。
 *
 * @param props - {@link OptimizedImageProps}
 *
 * @example
 * ```tsx
 * <div className="relative aspect-video">
 *   <OptimizedImage src={coverUrl} alt="成都三日穷游封面" fill sizes="(max-width:768px) 100vw, 50vw" />
 * </div>
 * ```
 */
export default function OptimizedImage({
  src,
  alt,
  decorative = false,
  className,
  fill = false,
  width,
  height,
  sizes = DEFAULT_SIZES,
  widths = DEFAULT_IMAGE_WIDTHS,
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const resolvedAlt = decorative ? '' : alt.trim() || '图片';

  if (import.meta.env.DEV && !decorative && !alt.trim()) {
    console.warn('[OptimizedImage] 缺少有意义的 alt，已使用占位文案', src);
  }

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);

  const { ref, isInView } = useIntersectionInView({
    disabled: priority,
    rootMargin: '280px',
  });

  const sources = useMemo(
    () =>
      resolveOptimizedImageSources(src, {
        widths: width ? [width, ...widths.filter((value) => value !== width)] : widths,
      } satisfies ResolveImageOptions),
    [src, width, widths],
  );

  const shouldLoad = priority || isInView;

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (sources.webp && !webpFailed) {
      setWebpFailed(true);
      setLoaded(false);
      return;
    }
    setFailed(true);
    onError?.();
  }, [onError, sources.webp, webpFailed]);

  const imgClassName = cn(
    fill ? 'absolute inset-0 h-full w-full object-cover' : 'h-full w-full object-cover',
    'transition-opacity duration-300',
    loaded ? 'opacity-100' : 'opacity-0',
    className,
  );

  const placeholder = (
    <div
      className={cn(
        fill ? 'absolute inset-0' : 'h-full w-full',
        'animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200',
        loaded && 'pointer-events-none opacity-0',
      )}
      aria-hidden
    />
  );

  const imageNode =
    shouldLoad && !failed ? (
      webpFailed || !sources.webp ? (
        <img
          src={sources.fallback}
          srcSet={sources.fallbackSrcSet}
          sizes={sources.fallbackSrcSet ? sizes : undefined}
          alt={resolvedAlt}
          width={width}
          height={height}
          className={imgClassName}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchpriority: 'high' as const } : {})}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <picture className={fill ? 'absolute inset-0 block h-full w-full' : 'block h-full w-full'}>
          <source
            type="image/webp"
            srcSet={sources.webpSrcSet ?? sources.webp}
            sizes={sources.webpSrcSet ? sizes : undefined}
          />
          <img
            src={sources.fallback}
            srcSet={sources.fallbackSrcSet}
            sizes={sources.fallbackSrcSet ? sizes : undefined}
            alt={resolvedAlt}
            width={width}
            height={height}
            className={imgClassName}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...(priority ? { fetchpriority: 'high' as const } : {})}
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )
    ) : null;

  if (fill) {
    return (
      <div ref={ref} className="relative h-full w-full overflow-hidden">
        {placeholder}
        {imageNode}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      style={width && height ? { width, height } : undefined}
    >
      {placeholder}
      {imageNode}
    </div>
  );
}
