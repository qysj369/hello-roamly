import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SharePosterPreviewProps = {
  posterAlt: string;
  isGenerating: boolean;
  generatingLabel?: string;
  error: string | null;
  activePosterUrl: string | null;
  slideIndex: number;
  slideCount: number;
  isXhs: boolean;
  isMultiSlide: boolean;
  onRetry: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
};

export default function SharePosterPreview({
  posterAlt,
  isGenerating,
  generatingLabel = '海报',
  error,
  activePosterUrl,
  slideIndex,
  slideCount,
  isXhs,
  isMultiSlide,
  onRetry,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}: SharePosterPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="relative flex min-h-[280px] items-center justify-center">
        {isGenerating && (
          <div className="flex flex-col items-center gap-2 py-16 text-sm text-slate-500">
            <Loader2
              className={cn('h-8 w-8 animate-spin', isXhs ? 'text-rose-500' : 'text-violet-600')}
              aria-hidden
            />
            正在生成{generatingLabel}…
          </div>
        )}
        {!isGenerating && error && (
          <div className="space-y-3 px-4 py-12 text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              重试
            </button>
          </div>
        )}
        {!isGenerating && activePosterUrl && (
          <img
            src={activePosterUrl}
            alt={`${posterAlt} ${slideIndex + 1}/${slideCount}`}
            className="max-h-[min(52vh,28rem)] w-full object-contain"
          />
        )}
      </div>

      {isMultiSlide && !isGenerating && activePosterUrl && (
        <>
          <button
            type="button"
            disabled={slideIndex <= 0}
            onClick={onPrevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md disabled:opacity-40"
            aria-label="上一张"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            disabled={slideIndex >= slideCount - 1}
            onClick={onNextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow-md disabled:opacity-40"
            aria-label="下一张"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onGoToSlide(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === slideIndex ? 'w-5 bg-rose-500' : 'w-1.5 bg-white/80',
                )}
                aria-label={`第 ${index + 1} 张`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
