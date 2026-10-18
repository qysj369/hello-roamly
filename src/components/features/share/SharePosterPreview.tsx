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
  isDouyin?: boolean;
  isMultiSlide: boolean;
  onRetry: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onGoToSlide: (index: number) => void;
  expanded?: boolean;
  tone?: 'default' | 'brand';
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
  isDouyin = false,
  isMultiSlide,
  onRetry,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
  expanded = false,
  tone = 'default',
}: SharePosterPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div
        className={cn(
          'relative flex items-center justify-center',
          expanded ? 'min-h-[280px]' : 'min-h-[180px]',
        )}
      >
        {isGenerating && (
          <div className="flex flex-col items-center gap-2 py-16 text-sm text-slate-500">
            <Loader2
              className={cn(
                'h-8 w-8 animate-spin',
                tone === 'brand'
                  ? 'text-[var(--color-main)]'
                  : isXhs || isDouyin
                    ? 'text-rose-500'
                    : 'text-violet-600',
              )}
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
            draggable
            className={cn(
              'mx-auto h-auto w-auto object-contain',
              expanded ? 'max-h-[min(72vh,40rem)]' : 'max-h-[min(36vh,20rem)]',
            )}
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
