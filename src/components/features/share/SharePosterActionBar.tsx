import { Copy } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SharePosterActionBarProps = {
  isXhs: boolean;
  isDouyin?: boolean;
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
  onShareImage?: () => void;
  shareImageLabel?: string;
  showDownload?: boolean;
  showDownloadCurrent?: boolean;
  showDownloadAll?: boolean;
  showCopyNote?: boolean;
  showSystemShareButton?: boolean;
  showViewFull?: boolean;
  downloadAllLabel?: string;
  tone?: 'default' | 'brand';
  onViewFull?: () => void;
  viewFullLabel?: string;
};

export default function SharePosterActionBar({
  isXhs,
  isDouyin = false,
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
  onShareImage,
  shareImageLabel = '分享图片',
  showDownload = true,
  showDownloadCurrent,
  showDownloadAll,
  showCopyNote,
  showSystemShareButton,
  showViewFull,
  downloadAllLabel,
  tone = 'default',
  onViewFull,
  viewFullLabel = '查看大图',
}: SharePosterActionBarProps) {
  const downloadDisabled = !hasPoster || isGenerating;
  const shareDisabled = downloadDisabled;
  const allowDownloadCurrent = showDownloadCurrent ?? showDownload;
  const allowDownloadAll = showDownloadAll ?? (showDownload && isMultiSlide);
  const allowCopyNote = showCopyNote ?? canCopyXhs;
  const allowViewFull = showViewFull ?? Boolean(onViewFull);
  const allowSystemShare = showSystemShareButton ?? (hasSystemShare && !onShareImage);
  const useBrand = tone === 'brand';
  const primaryClass = cn(
    'inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50',
    useBrand
      ? 'bg-[var(--color-main)] hover:opacity-90'
      : isXhs || isDouyin
        ? 'bg-[#FE2C55] hover:bg-[#e61f3a]'
        : 'bg-violet-600 hover:bg-violet-700',
  );
  const brandGhost =
    'inline-flex flex-1 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-main)_28%,var(--theme-line))] bg-[var(--theme-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-main)] disabled:opacity-50';
  const xhsGhost =
    'inline-flex flex-1 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50';

  return (
    <div className="flex flex-wrap gap-2">
      {onShareImage ? (
        <button
          type="button"
          disabled={shareDisabled}
          onClick={onShareImage}
          className={primaryClass}
        >
          {shareImageLabel}
        </button>
      ) : null}

      {allowDownloadCurrent ? (
        <button
          type="button"
          disabled={downloadDisabled}
          onClick={onDownloadCurrent}
          className={onShareImage ? brandGhost : primaryClass}
        >
          {isMultiSlide ? `保存当前 (${slideIndex + 1}/${slideCount})` : '保存图片'}
        </button>
      ) : null}

      {allowDownloadAll ? (
        <button
          type="button"
          disabled={isGenerating || slideCount === 0}
          onClick={onDownloadAll}
          className={useBrand ? brandGhost : xhsGhost}
        >
          {downloadAllLabel ?? `保存全部 (${slideCount} 张)`}
        </button>
      ) : null}

      {allowCopyNote && (
        <button
          type="button"
          onClick={onCopyXhsText}
          className={
            useBrand
              ? `${brandGhost} gap-1.5 sm:flex-initial`
              : 'inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-50 sm:w-auto sm:flex-1'
          }
        >
          <Copy className="h-4 w-4" aria-hidden />
          复制文案
        </button>
      )}

      {allowViewFull && onViewFull ? (
        <button
          type="button"
          disabled={downloadDisabled}
          onClick={onViewFull}
          className={brandGhost}
        >
          {viewFullLabel}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onCopyLink}
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-violet-200"
      >
        复制链接
      </button>

      {allowSystemShare ? (
        <button
          type="button"
          onClick={onSystemShare}
          className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 sm:w-auto sm:flex-1"
        >
          系统分享
        </button>
      ) : null}
    </div>
  );
}
