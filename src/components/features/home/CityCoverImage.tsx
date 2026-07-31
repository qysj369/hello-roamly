import { useState } from 'react';
import { guideCoverPalette } from '@/utils/guideCardDisplay';
import { cn } from '@/utils/cn';

type CityCoverImageProps = {
  city: string;
  src: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackTextClassName?: string;
};

/** 城市封面图 — 加载失败时回退为城市名渐变色块 */
export function CityCoverImage({
  city,
  src,
  className,
  imageClassName,
  fallbackClassName,
  fallbackTextClassName,
}: CityCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const palette = guideCoverPalette(city);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br',
          palette,
          className,
          fallbackClassName,
        )}
      >
        <span className={cn('font-bold text-slate-700/80', fallbackTextClassName)}>{city}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={cn(className, imageClassName)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
