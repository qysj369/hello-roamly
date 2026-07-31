import { ChevronLeft, ChevronRight, MapPin, Play } from 'lucide-react';
import { useCallback, useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { getMomentImageAlt, getMomentVideoAlt } from '@/utils/imageAlt';
import { cn } from '@/utils/cn';

export type TravelMomentCardMediaProps = {
  moment: TravelMoment;
  className?: string;
};

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-violet-50 to-cyan-50 px-8 text-center">
      <MapPin className="h-10 w-10 text-violet-400/90" aria-hidden />
      <p className="mt-3 text-sm font-medium leading-snug text-slate-700">{label}</p>
    </div>
  );
}

/** Instagram 风格方形媒体区（单图 / 多图轮播 / 视频） */
export default function TravelMomentCardMedia({ moment, className }: TravelMomentCardMediaProps) {
  const images = moment.imageUrls ?? [];
  const hasVideo = Boolean(moment.videoUrl);
  const [index, setIndex] = useState(0);

  const slideCount = hasVideo ? 1 : images.length;
  const canSlide = slideCount > 1;

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % slideCount);
  }, [slideCount]);

  if (!hasVideo && images.length === 0) {
    return (
      <div className={cn('bg-black', className)}>
        <MediaPlaceholder label={moment.location?.trim() || '暂无图片'} />
      </div>
    );
  }

  if (hasVideo && moment.videoUrl) {
    const poster = images[0];
    return (
      <div className={cn('relative aspect-square w-full bg-black', className)}>
        <video
          src={moment.videoUrl}
          className="h-full w-full object-cover"
          controls
          preload="metadata"
          poster={poster}
          aria-label={getMomentVideoAlt(moment)}
        />
        {!moment.videoUrl.startsWith('data:') && poster && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="ml-1 h-6 w-6 text-slate-900" aria-hidden />
            </span>
          </span>
        )}
      </div>
    );
  }

  const safeIndex = Math.min(index, images.length - 1);

  return (
    <div className={cn('group relative aspect-square w-full bg-black', className)}>
      <OptimizedImage
        src={images[safeIndex]!}
        alt={getMomentImageAlt(moment, { index: safeIndex, total: images.length })}
        fill
        sizes="(max-width: 640px) 100vw, 480px"
      />

      {canSlide && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/55 focus:opacity-100 group-hover:opacity-100"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/55 focus:opacity-100 group-hover:opacity-100"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div
            className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5"
            aria-hidden
          >
            {images.map((url, dotIndex) => (
              <span
                key={url}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition',
                  dotIndex === safeIndex ? 'bg-white' : 'bg-white/45',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
