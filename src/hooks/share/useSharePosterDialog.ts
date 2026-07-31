import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackShareEvent } from '@/lib/share/analytics/trackShareEvent';
import { downloadBlob, downloadBlobsSequential } from '@/lib/share';
import { xhsSlideDownloadFilename } from '@/lib/share/chinaPosterVariants';
import { fetchBlobFromObjectUrl } from '@/lib/share/fetchPosterBlob';
import { generatePosterBlobs } from '@/lib/share/generatePosterBlobs';
import { createObjectUrlsFromBlobs, revokeObjectUrls } from '@/lib/share/objectUrl';
import { resolveSharePosterVariants } from '@/lib/share/resolveSharePosterVariants';
import { getSharePosterHint } from '@/lib/share/sharePosterHint';
import { copyXhsNoteToClipboard } from '@/lib/share/xhsNoteCopy';
import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';
import type { ShareTrackingContext } from '@/types/domain/shareAnalytics';

export type UseSharePosterDialogOptions = {
  open: boolean;
  shareUrl: string;
  downloadFilename: string;
  generatePoster?: () => Promise<Blob>;
  posterVariants?: SharePosterVariant[];
  shareTrackContext?: ShareTrackingContext;
  onSystemShare?: () => Promise<'shared' | 'copied' | 'cancelled' | 'failed' | void>;
};

export function useSharePosterDialog({
  open,
  shareUrl,
  downloadFilename,
  generatePoster,
  posterVariants,
  shareTrackContext,
  onSystemShare,
}: UseSharePosterDialogOptions) {
  const variants = useMemo(
    () =>
      resolveSharePosterVariants({
        posterVariants,
        generatePoster,
        downloadFilename,
      }),
    [posterVariants, generatePoster, downloadFilename],
  );

  const [activeVariantId, setActiveVariantId] = useState<SharePosterVariant['id']>('wechat');
  const activeVariant = variants.find((item) => item.id === activeVariantId) ?? variants[0];

  const [posterUrls, setPosterUrls] = useState<string[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const slideCount = posterUrls.length;
  const activePosterUrl = posterUrls[slideIndex] ?? null;
  const isXhs = activeVariantId === 'xhs';
  const isMultiSlide = isXhs && slideCount > 1;
  const hint = useMemo(
    () => getSharePosterHint(activeVariant, slideCount),
    [activeVariant, slideCount],
  );
  const baseFilename = activeVariant?.downloadFilename ?? downloadFilename;
  const showVariantTabs = variants.length > 1;
  const canCopyXhs = isXhs && Boolean(activeVariant?.getXhsCopyText);

  const showCopyFeedback = useCallback((message: string, durationMs = 2000) => {
    setCopyFeedback(message);
    window.setTimeout(() => setCopyFeedback(null), durationMs);
  }, []);

  useEffect(() => {
    if (variants[0]) {
      setActiveVariantId(variants[0].id);
    }
  }, [open, variants]);

  const runGenerate = useCallback(async () => {
    if (!activeVariant) {
      return;
    }
    setIsGenerating(true);
    setError(null);
    setSlideIndex(0);
    try {
      const blobs = await generatePosterBlobs(activeVariant);
      if (blobs.length === 0) {
        throw new Error('未生成任何图片');
      }
      const urls = createObjectUrlsFromBlobs(blobs);
      setPosterUrls((prev) => {
        revokeObjectUrls(prev);
        return urls;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '生成海报失败');
      setPosterUrls((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
    } finally {
      setIsGenerating(false);
    }
  }, [activeVariant]);

  useEffect(() => {
    if (!open || !shareTrackContext) {
      return;
    }
    trackShareEvent({
      ...shareTrackContext,
      action: 'share_dialog_open',
      channel: 'unknown',
      shareUrl,
    });
  }, [open, shareTrackContext, shareUrl]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    void runGenerate();
    return () => {
      setPosterUrls((prev) => {
        revokeObjectUrls(prev);
        return [];
      });
    };
  }, [open, runGenerate]);

  useEffect(() => {
    if (!open || !shareTrackContext || !activeVariant) {
      return;
    }
    trackShareEvent({
      ...shareTrackContext,
      action: 'poster_variant_view',
      channel: activeVariant.id === 'xhs' ? 'xhs' : 'wechat',
      shareUrl,
    });
  }, [activeVariantId, open, shareTrackContext, activeVariant, shareUrl]);

  useEffect(() => {
    if (slideIndex >= slideCount && slideCount > 0) {
      setSlideIndex(0);
    }
  }, [slideIndex, slideCount]);

  const handleDownloadCurrent = useCallback(async () => {
    if (!activePosterUrl || !activeVariant) {
      return;
    }
    const blob = await fetchBlobFromObjectUrl(activePosterUrl);
    const name = isMultiSlide
      ? xhsSlideDownloadFilename(baseFilename, slideIndex)
      : activeVariant.downloadFilename;
    downloadBlob(blob, name);
    if (shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'poster_download',
        channel: isXhs ? 'xhs' : 'wechat',
        shareUrl,
        slideCount: isMultiSlide ? slideCount : 1,
        meta: isMultiSlide ? { slide: String(slideIndex + 1) } : undefined,
      });
    }
  }, [
    activePosterUrl,
    activeVariant,
    baseFilename,
    isMultiSlide,
    isXhs,
    shareTrackContext,
    shareUrl,
    slideCount,
    slideIndex,
  ]);

  const handleDownloadAll = useCallback(async () => {
    if (posterUrls.length === 0) {
      return;
    }
    const blobs = await Promise.all(posterUrls.map((url) => fetchBlobFromObjectUrl(url)));
    await downloadBlobsSequential(blobs, (index) => xhsSlideDownloadFilename(baseFilename, index));
    showCopyFeedback(`已保存 ${blobs.length} 张图片`, 2500);
    if (shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'poster_download_all',
        channel: 'xhs',
        shareUrl,
        slideCount: blobs.length,
      });
    }
  }, [baseFilename, posterUrls, shareTrackContext, shareUrl, showCopyFeedback]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showCopyFeedback('链接已复制');
      if (shareTrackContext) {
        trackShareEvent({
          ...shareTrackContext,
          action: 'share_copy_link',
          channel: 'link',
          shareUrl,
        });
      }
    } catch {
      showCopyFeedback('复制失败');
    }
  }, [shareTrackContext, shareUrl, showCopyFeedback]);

  const handleCopyXhsText = useCallback(async () => {
    const text = activeVariant?.getXhsCopyText?.();
    if (!text) {
      return;
    }
    const ok = await copyXhsNoteToClipboard(text);
    showCopyFeedback(ok ? '标题与正文已复制' : '复制失败');
    if (ok && shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'share_copy_xhs_text',
        channel: 'xhs',
        shareUrl,
      });
    }
  }, [activeVariant, shareTrackContext, shareUrl, showCopyFeedback]);

  const handleSystemShare = useCallback(async () => {
    if (!onSystemShare) {
      return;
    }
    const result = await onSystemShare();
    if (result === 'copied' || result === 'shared') {
      showCopyFeedback(result === 'shared' ? '已分享' : '已复制分享文案');
    }
  }, [onSystemShare, showCopyFeedback]);

  const goPrevSlide = useCallback(() => {
    setSlideIndex((value) => Math.max(0, value - 1));
  }, []);

  const goNextSlide = useCallback(() => {
    setSlideIndex((value) => Math.min(slideCount - 1, value + 1));
  }, [slideCount]);

  const goToSlide = useCallback((index: number) => {
    setSlideIndex(index);
  }, []);

  return {
    variants,
    activeVariantId,
    setActiveVariantId,
    activeVariant,
    posterUrls,
    slideIndex,
    slideCount,
    activePosterUrl,
    isGenerating,
    error,
    copyFeedback,
    hint,
    isXhs,
    isMultiSlide,
    showVariantTabs,
    canCopyXhs,
    runGenerate,
    handleDownloadCurrent,
    handleDownloadAll,
    handleCopyLink,
    handleCopyXhsText,
    handleSystemShare,
    goPrevSlide,
    goNextSlide,
    goToSlide,
    hasSystemShare: Boolean(onSystemShare),
  };
}
