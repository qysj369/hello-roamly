import { Dialog } from '@/components/ui';
import SharePosterActionBar from '@/components/features/share/SharePosterActionBar';
import SharePosterHintBar from '@/components/features/share/SharePosterHintBar';
import SharePosterPreview from '@/components/features/share/SharePosterPreview';
import SharePosterVariantTabs from '@/components/features/share/SharePosterVariantTabs';
import { useSharePosterDialog } from '@/hooks/share/useSharePosterDialog';
import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';
import type { ShareTrackingContext } from '@/types/domain/shareAnalytics';

export type SharePosterDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  shareUrl: string;
  downloadFilename: string;
  posterAlt: string;
  /** 单样式（兼容旧用法） */
  generatePoster?: () => Promise<Blob>;
  /** 中国版：微信 + 小红书等多样式 */
  posterVariants?: SharePosterVariant[];
  shareTrackContext?: ShareTrackingContext;
  onSystemShare?: () => Promise<'shared' | 'copied' | 'cancelled' | 'failed' | void>;
};

/** 分享海报弹窗：容器组件，逻辑见 useSharePosterDialog */
export default function SharePosterDialog({
  open,
  onClose,
  title,
  description,
  shareUrl,
  downloadFilename,
  posterAlt,
  generatePoster,
  posterVariants,
  shareTrackContext,
  onSystemShare,
}: SharePosterDialogProps) {
  const poster = useSharePosterDialog({
    open,
    shareUrl,
    downloadFilename,
    generatePoster,
    posterVariants,
    shareTrackContext,
    onSystemShare,
  });

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} className="max-w-lg">
      <div className="space-y-4">
        <SharePosterVariantTabs
          variants={poster.variants}
          activeVariantId={poster.activeVariantId}
          onSelect={poster.setActiveVariantId}
        />

        <SharePosterHintBar hint={poster.hint} isXhs={poster.isXhs} />

        <SharePosterPreview
          posterAlt={posterAlt}
          isGenerating={poster.isGenerating}
          generatingLabel={poster.activeVariant?.label ?? '海报'}
          error={poster.error}
          activePosterUrl={poster.activePosterUrl}
          slideIndex={poster.slideIndex}
          slideCount={poster.slideCount}
          isXhs={poster.isXhs}
          isMultiSlide={poster.isMultiSlide}
          onRetry={() => void poster.runGenerate()}
          onPrevSlide={poster.goPrevSlide}
          onNextSlide={poster.goNextSlide}
          onGoToSlide={poster.goToSlide}
        />

        {poster.copyFeedback && (
          <p className="text-center text-xs text-emerald-700" role="status">
            {poster.copyFeedback}
          </p>
        )}

        <SharePosterActionBar
          isXhs={poster.isXhs}
          isMultiSlide={poster.isMultiSlide}
          slideIndex={poster.slideIndex}
          slideCount={poster.slideCount}
          isGenerating={poster.isGenerating}
          hasPoster={Boolean(poster.activePosterUrl)}
          canCopyXhs={poster.canCopyXhs}
          hasSystemShare={poster.hasSystemShare}
          onDownloadCurrent={() => void poster.handleDownloadCurrent()}
          onDownloadAll={() => void poster.handleDownloadAll()}
          onCopyXhsText={() => void poster.handleCopyXhsText()}
          onCopyLink={() => void poster.handleCopyLink()}
          onSystemShare={() => void poster.handleSystemShare()}
        />
      </div>
    </Dialog>
  );
}
