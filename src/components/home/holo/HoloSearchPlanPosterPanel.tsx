import { useMemo, useState } from 'react';
import SharePosterActionBar from '@/components/features/share/SharePosterActionBar';
import SharePosterHintBar from '@/components/features/share/SharePosterHintBar';
import SharePosterPreview from '@/components/features/share/SharePosterPreview';
import SharePosterVariantTabs from '@/components/features/share/SharePosterVariantTabs';
import { useSharePosterDialog } from '@/hooks/share/useSharePosterDialog';
import {
  buildSearchPlanDouyinPosterBlob,
  buildSearchPlanPosterBlob,
  buildSearchPlanXhsPosterBlob,
  buildSearchPlanXhsPosterSlides,
  getSearchPlanDouyinCopyText,
  getSearchPlanXhsCopyText,
  searchPlanPosterShareUrl,
} from '@/lib/home/buildSearchPlanPoster';
import { defaultSearchPlanTitle } from '@/lib/home/saveSearchStructuredPlan';
import {
  searchPlanCatchyTitle,
  searchPlanShareHashtags,
  searchPlanShareHook,
} from '@/lib/home/searchPlanShareCopy';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import type { ShareTextResult } from '@/utils/copyTextToClipboard';

type HoloSearchPlanPosterPanelProps = {
  plan: SearchStructuredPlan;
  savedSessionId: string | null;
  onSystemShare: () => Promise<ShareTextResult>;
  copyPlainText: (text: string) => Promise<boolean>;
  onClose: () => void;
};

function planShareHint(isXhs: boolean, isDouyin: boolean): string {
  if (isXhs) return '全套3图+配套文案，一键复制';
  if (isDouyin) return '复制图片，上传抖音发布';
  return '复制图片，直接发朋友圈';
}

export default function HoloSearchPlanPosterPanel({
  plan,
  savedSessionId,
  onSystemShare,
  copyPlainText,
  onClose,
}: HoloSearchPlanPosterPanelProps) {
  const shareUrl = searchPlanPosterShareUrl(savedSessionId, plan.baseInfo, plan);
  const safeName = defaultSearchPlanTitle(plan).replace(/[\\/:*?"<>|]/g, '_').slice(0, 36);
  const posterVariants = useMemo(
    () =>
      createChinaPosterVariants({
        baseFilename: safeName || '行程',
        buildWechat: () => buildSearchPlanPosterBlob(plan, shareUrl),
        buildXhs: () => buildSearchPlanXhsPosterBlob(plan, shareUrl),
        buildXhsSlides: () => buildSearchPlanXhsPosterSlides(plan, shareUrl),
        buildDouyin: () => buildSearchPlanDouyinPosterBlob(plan, shareUrl),
        getXhsCopyText: () => getSearchPlanXhsCopyText(plan, shareUrl),
        getDouyinCopyText: () => getSearchPlanDouyinCopyText(plan, shareUrl),
      }),
    [plan, shareUrl, safeName],
  );
  const shareTrackContext = useMemo(
    () =>
      savedSessionId
        ? { contentKind: 'saved_user_plan' as const, contentId: savedSessionId }
        : { contentKind: 'travel_plan' as const, contentId: `search-${plan.baseInfo.targetCity}` },
    [savedSessionId, plan.baseInfo.targetCity],
  );
  const [fullView, setFullView] = useState(false);
  const poster = useSharePosterDialog({
    open: true,
    shareUrl,
    downloadFilename: `${safeName || '行程'}-分享海报.png`,
    posterVariants,
    shareTrackContext,
    onSystemShare,
    copyPlainText,
  });

  return (
    <section
      className={fullView ? 'holo-home__plan-poster is-full' : 'holo-home__plan-poster'}
      aria-label="图文分享"
    >
      <div className="holo-home__plan-poster-head">
        <p className="holo-home__plan-label">分享行程</p>
        <button
          type="button"
          className="holo-home__plan-ghost"
          onClick={onClose}
        >
          收起分享图
        </button>
      </div>
      <p className="holo-home__plan-muted">分享标题：{searchPlanCatchyTitle(plan)}</p>
      <p className="holo-home__plan-muted">种草短句：{searchPlanShareHook(plan)}</p>
      <p className="holo-home__plan-muted">
        小红书标签：{searchPlanShareHashtags(plan).map((tag) => `#${tag}`).join(' ')}
      </p>
      <SharePosterVariantTabs
        variants={poster.variants}
        activeVariantId={poster.activeVariantId}
        onSelect={poster.setActiveVariantId}
        tone="brand"
      />
      <SharePosterHintBar
        hint={planShareHint(poster.isXhs, poster.isDouyin)}
        isXhs={poster.isXhs}
        isDouyin={poster.isDouyin}
        tone="brand"
      />
      <SharePosterPreview
        posterAlt={`${plan.baseInfo.targetCity}行程分享图`}
        isGenerating={poster.isGenerating}
        generatingLabel={poster.activeVariant?.label ?? '海报'}
        error={poster.error}
        activePosterUrl={poster.activePosterUrl}
        slideIndex={poster.slideIndex}
        slideCount={poster.slideCount}
        isXhs={poster.isXhs}
        isDouyin={poster.isDouyin}
        isMultiSlide={poster.isMultiSlide}
        onRetry={() => void poster.runGenerate()}
        onPrevSlide={poster.goPrevSlide}
        onNextSlide={poster.goNextSlide}
        onGoToSlide={poster.goToSlide}
        expanded={fullView}
        tone="brand"
      />
      {poster.assistHint || poster.copyFeedback ? (
        <p
          className={
            poster.assistHint
              ? 'holo-home__plan-poster-assist'
              : 'holo-home__plan-muted'
          }
          role="status"
        >
          {poster.assistHint || poster.copyFeedback}
        </p>
      ) : null}
      <div className="holo-home__plan-poster-actions">
        <SharePosterActionBar
          isXhs={poster.isXhs}
          isDouyin={poster.isDouyin}
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
          onShareImage={() => void poster.handleShareImage()}
          shareImageLabel="复制图片"
          showDownload={poster.showDownload}
          showDownloadCurrent={!poster.isXhs}
          showDownloadAll={poster.isXhs}
          showCopyNote={poster.isXhs}
          showSystemShareButton={false}
          showViewFull={!poster.isXhs}
          downloadAllLabel="保存全部图片"
          tone="brand"
          onViewFull={
            !poster.isXhs && poster.activePosterUrl
              ? () => setFullView((open) => !open)
              : undefined
          }
          viewFullLabel={fullView ? '收起大图' : '查看大图'}
        />
      </div>
    </section>
  );
}
