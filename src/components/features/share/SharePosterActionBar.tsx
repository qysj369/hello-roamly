import { Copy } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SharePosterActionBarProps = {
  isXhs: boolean;
  isMultiSlide: boolean;
  slideIndex: number;
  slideCount: number;
  isGenerating: boolean;
  hasPoster: boolean;
  canCopyXhs: boolean;
  hasSystemShare: boolean;
  onDownloadCurrent: () => void;
  onDownloadAll: () => void;
  onCopyXhsText: () => void;
  onCopyLink: () => void;
  onSystemShare: () => void;
};

export default function SharePosterActionBar({
  isXhs,
  isMultiSlide,
  slideIndex,
  slideCount,
  isGenerating,
  hasPoster,
  canCopyXhs,
  hasSystemShare,
  onDownloadCurrent,
  onDownloadAll,
  onCopyXhsText,
  onCopyLink,
  onSystemShare,
}: SharePosterActionBarProps) {
  const downloadDisabled = !hasPoster || isGenerating;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={downloadDisabled}
        onClick={onDownloadCurrent}
        className={cn(
          'inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50',
          isXhs ? 'bg-[#FF2442] hover:bg-[#e61f3a]' : 'bg-violet-600 hover:bg-violet-700',
        )}
      >
        {isMultiSlide ? `保存当前 (${slideIndex + 1}/${slideCount})` : '保存图片'}
      </button>

      {isMultiSlide && (
        <button
          type="button"
          disabled={isGenerating || slideCount === 0}
          onClick={onDownloadAll}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
        >
          保存全部 ({slideCount} 张)
        </button>
      )}

      {canCopyXhs && (
        <button
          type="button"
          onClick={onCopyXhsText}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-50 sm:w-auto sm:flex-1"
        >
          <Copy className="h-4 w-4" aria-hidden />
          复制文案
        </button>
      )}

      <button
        type="button"
        onClick={onCopyLink}
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-200"
      >
        复制链接
      </button>

      {hasSystemShare && (
        <button
          type="button"
          onClick={onSystemShare}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 sm:w-auto sm:flex-1"
        >
          系统分享
        </button>
      )}
    </div>
  );
}
