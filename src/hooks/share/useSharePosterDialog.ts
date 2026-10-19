import { useCallback, useEffect, useMemo, useState } from 'react';
import { trackShareEvent } from '@/lib/share/analytics/trackShareEvent';
import { copyImageBlobToClipboard } from '@/lib/share/copyImageBlob';
import {
  shareChannelFromPosterVariant,
  xhsSlideDownloadFilename,
} from '@/lib/share/chinaPosterVariants';
import { generatePosterBlobs } from '@/lib/share/generatePosterBlobs';
import { createObjectUrlsFromBlobs, revokeObjectUrls } from '@/lib/share/objectUrl';
import { resolveSharePosterVariants } from '@/lib/share/resolveSharePosterVariants';
import { saveImageBlob } from '@/lib/share/saveImageBlob';
import { blobToShareFile, canShareImageFiles, shareImageFiles } from '@/lib/share/shareImageFiles';
import { getSharePosterHint } from '@/lib/share/sharePosterHint';
import {
  cannotProgrammaticDownload,
  isIosDevice,
  posterImageActionLabel,
} from '@/lib/share/deviceShare';
import { isWechatDesktopBrowser, isWechatInAppBrowser } from '@/lib/share/wechat';
import { copyXhsNoteToClipboard, formatXhsNoteForClipboard } from '@/lib/share/xhsNoteCopy';
import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';
import type { ShareTrackingContext } from '@/types/domain/shareAnalytics';

function friendlyGenerateError(reason: unknown): string {
  const raw = reason instanceof Error ? reason.message : '';
  if (!raw || /scenery|Cannot read properties|is not a function|undefined|null/i.test(raw)) {
    return '配图暂时没生成，点重试再看一眼';
  }
  return raw;
}

export type UseSharePosterDialogOptions = {
  open: boolean;
  shareUrl: string;
  downloadFilename: string;
  generatePoster?: () => Promise<Blob>;
  posterVariants?: SharePosterVariant[];
  shareTrackContext?: ShareTrackingContext;
  onSystemShare?: () => Promise<'shared' | 'copied' | 'cancelled' | 'failed' | void>;
  /** Native dialog top-layer 下 clipboard API 常失败，由调用方提供 textarea 回退 */
  copyPlainText?: (text: string) => Promise<boolean>;
};

export function useSharePosterDialog({
  open,
  shareUrl,
  downloadFilename,
  generatePoster,
  posterVariants,
  shareTrackContext,
  onSystemShare,
  copyPlainText,
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
  const [posterBlobs, setPosterBlobs] = useState<Blob[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [assistHint, setAssistHint] = useState<string | null>(null);

  const slideCount = posterUrls.length;
  const activePosterUrl = posterUrls[slideIndex] ?? null;
  const isXhs = activeVariantId === 'xhs';
  const isDouyin = activeVariantId === 'douyin';
  const activeChannel = shareChannelFromPosterVariant(activeVariantId);
  const isMultiSlide = isXhs && slideCount > 1;
  const hint = useMemo(
    () => getSharePosterHint(activeVariant, slideCount),
    [activeVariant, slideCount],
  );
  const baseFilename = activeVariant?.downloadFilename ?? downloadFilename;
  const showVariantTabs = variants.length > 1;
  const canCopyXhs = Boolean(activeVariant?.getXhsCopyText);

  const showCopyFeedback = useCallback((message: string, durationMs = 2000) => {
    setCopyFeedback(message);
    window.setTimeout(() => setCopyFeedback(null), durationMs);
  }, []);

  const showAssistHint = useCallback(
    (message: string) => {
      setAssistHint(message);
      showCopyFeedback(message, 8000);
    },
    [showCopyFeedback],
  );

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
      setPosterBlobs(blobs);
      setPosterUrls((prev) => {
        revokeObjectUrls(prev);
        return urls;
      });
    } catch (reason) {
      setError(friendlyGenerateError(reason));
      setPosterBlobs([]);
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
    runGenerate().catch(() => undefined);
    return () => {
      setPosterBlobs([]);
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
      channel: shareChannelFromPosterVariant(activeVariant.id),
      shareUrl,
    });
  }, [activeVariantId, open, shareTrackContext, activeVariant, shareUrl]);

  useEffect(() => {
    if (slideIndex >= slideCount && slideCount > 0) {
      setSlideIndex(0);
    }
  }, [slideIndex, slideCount]);

  const copyPosterHint = useCallback((copied: boolean) => {
    if (copied && isWechatDesktopBrowser()) return '图片已复制，到微信聊天里粘贴即可';
    if (copied && isWechatInAppBrowser()) return '图片已复制；也可长按上方图片发给好友';
    if (copied) return '图片已复制，可粘贴到微信 / 小红书 / 抖音';
    if (isWechatDesktopBrowser()) {
      return '请把上方图片拖进微信聊天，不要点下载';
    }
    if (isWechatInAppBrowser() || isIosDevice()) {
      return '请长按上方大图，保存到相册或发给好友';
    }
    return '请右键上方图片另存，或拖进微信聊天';
  }, []);

  const handleDownloadCurrent = useCallback(async () => {
    if (!activeVariant) {
      return;
    }
    const blob = posterBlobs[isMultiSlide ? slideIndex : 0];
    if (!blob) {
      return;
    }
    const name = isMultiSlide
      ? xhsSlideDownloadFilename(baseFilename, slideIndex)
      : activeVariant.downloadFilename;
    const result = await saveImageBlob(blob, name);
    if (result === 'cancelled') {
      return;
    }
    if (result === 'needs-long-press' || result === 'failed') {
      const copied = await copyImageBlobToClipboard(blob);
      let assist = '请长按上方图片保存到相册';
      if (copied) assist = copyPosterHint(true);
      else if (isMultiSlide) assist = `请长按上方第 ${slideIndex + 1} 张图片保存到相册`;
      showAssistHint(assist);
      return;
    }
    showCopyFeedback('已保存到你选择的文件夹');
    if (shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'poster_download',
        channel: activeChannel,
        shareUrl,
        slideCount: isMultiSlide ? slideCount : 1,
        meta: isMultiSlide ? { slide: String(slideIndex + 1) } : undefined,
      });
    }
  }, [
    activeVariant,
    baseFilename,
    copyPosterHint,
    isMultiSlide,
    activeChannel,
    posterBlobs,
    shareTrackContext,
    shareUrl,
    showAssistHint,
    showCopyFeedback,
    slideCount,
    slideIndex,
  ]);

  const handleDownloadAll = useCallback(async () => {
    if (posterBlobs.length === 0) {
      return;
    }
    const allFiles = posterBlobs.map((blob, index) =>
      blobToShareFile(blob, xhsSlideDownloadFilename(baseFilename, index)),
    );
    if (canShareImageFiles(allFiles)) {
      const shared = await shareImageFiles({
        files: allFiles,
        title: '行程分享图',
      });
      if (shared === 'shared') {
        showCopyFeedback(`已打开系统分享（${allFiles.length} 张）`);
        return;
      }
      if (shared === 'cancelled') {
        return;
      }
    }
    if (cannotProgrammaticDownload() || isWechatInAppBrowser()) {
      showAssistHint('左右滑动查看全部图片，分别长按保存到相册');
      return;
    }
    const savedState = await posterBlobs.reduce(
      async (previous, blob, index) => {
        const state = await previous;
        if (state.stopped) return state;
        const result = await saveImageBlob(blob, xhsSlideDownloadFilename(baseFilename, index));
        if (result === 'cancelled') return { count: state.count, stopped: true };
        if (result === 'saved') return { count: state.count + 1, stopped: false };
        return state;
      },
      Promise.resolve({ count: 0, stopped: false }),
    );
    const saved = savedState.count;
    if (saved === 0) {
      showCopyFeedback('保存失败，请右键图片另存');
      return;
    }
    showCopyFeedback(`已保存 ${saved} 张图片`, 2500);
    if (shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'poster_download_all',
        channel: 'xhs',
        shareUrl,
        slideCount: saved,
      });
    }
  }, [baseFilename, posterBlobs, shareTrackContext, shareUrl, showAssistHint, showCopyFeedback]);

  const handleCopyLink = useCallback(async () => {
    try {
      const ok = copyPlainText
        ? await copyPlainText(shareUrl)
        : await navigator.clipboard.writeText(shareUrl).then(() => true);
      if (!ok) throw new Error('copy failed');
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
  }, [copyPlainText, shareTrackContext, shareUrl, showCopyFeedback]);

  const handleCopyXhsText = useCallback(async () => {
    let text: ReturnType<NonNullable<SharePosterVariant['getXhsCopyText']>> | undefined;
    try {
      text = activeVariant?.getXhsCopyText?.();
    } catch {
      showCopyFeedback('文案暂时没准备好，请重试');
      return;
    }
    if (!text) {
      return;
    }
    const ok = copyPlainText
      ? await copyPlainText(formatXhsNoteForClipboard(text))
      : await copyXhsNoteToClipboard(text);
    showCopyFeedback(ok ? '复制成功' : '复制失败');
    if (ok && shareTrackContext) {
      trackShareEvent({
        ...shareTrackContext,
        action: 'share_copy_xhs_text',
        channel: activeChannel,
        shareUrl,
      });
    }
  }, [activeChannel, activeVariant, copyPlainText, shareTrackContext, shareUrl, showCopyFeedback]);

  const handleSystemShare = useCallback(async () => {
    if (!onSystemShare) {
      return;
    }
    const result = await onSystemShare();
    if (result === 'copied' || result === 'shared') {
      showCopyFeedback(result === 'shared' ? '已分享' : '已复制分享文案');
    }
  }, [onSystemShare, showCopyFeedback]);

  /** 分享当前海报图：手机走系统分享，电脑/微信复制图片，绝不回退成下载 */
  const handleShareImage = useCallback(async () => {
    if (!activeVariant || posterBlobs.length === 0) {
      return;
    }
    const blobsToShare = isMultiSlide ? posterBlobs : [posterBlobs[0]!];
    const files = blobsToShare.map((blob, index) => {
      const name = isMultiSlide
        ? xhsSlideDownloadFilename(baseFilename, index)
        : activeVariant.downloadFilename;
      return blobToShareFile(blob, name);
    });

    let toShare = files;
    if (files.length > 1 && !canShareImageFiles(files)) {
      const current = files[slideIndex];
      toShare = current && canShareImageFiles([current]) ? [current] : [];
    } else if (files.length === 1 && !canShareImageFiles(files)) {
      toShare = [];
    }

    if (toShare.length > 0) {
      const result = await shareImageFiles({
        files: toShare,
        title: activeVariant.label,
        text: shareUrl,
        url: shareUrl,
      });
      if (result === 'shared') {
        showCopyFeedback('已打开系统分享');
        if (shareTrackContext) {
          trackShareEvent({
            ...shareTrackContext,
            action: 'share_native',
            channel: activeChannel,
            shareUrl,
            slideCount: toShare.length,
          });
        }
        return;
      }
      if (result === 'cancelled') {
        return;
      }
    }

    const blob = blobsToShare[slideIndex] ?? blobsToShare[0];
    if (blob) {
      const copied = await copyImageBlobToClipboard(blob);
      if (copied) {
        showCopyFeedback(copyPosterHint(true));
        if (shareTrackContext) {
          trackShareEvent({
            ...shareTrackContext,
            action: 'share_native',
            channel: activeChannel,
            shareUrl,
            slideCount: 1,
            meta: { via: 'clipboard' },
          });
        }
        return;
      }
    }

    showAssistHint(copyPosterHint(false));
  }, [
    activeVariant,
    baseFilename,
    copyPosterHint,
    isMultiSlide,
    activeChannel,
    posterBlobs,
    shareTrackContext,
    shareUrl,
    showAssistHint,
    showCopyFeedback,
    slideIndex,
  ]);

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
    assistHint,
    hint,
    isXhs,
    isDouyin,
    isMultiSlide,
    showVariantTabs,
    canCopyXhs,
    runGenerate,
    handleDownloadCurrent,
    handleDownloadAll,
    handleCopyLink,
    handleCopyXhsText,
    handleSystemShare,
    handleShareImage,
    goPrevSlide,
    goNextSlide,
    goToSlide,
    hasSystemShare: Boolean(onSystemShare),
    showDownload: true,
    shareImageLabel: posterImageActionLabel(),
  };
}
