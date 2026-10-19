import { Component, useMemo, type ReactNode } from 'react';
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
  getSearchPlanWechatCopyText,
  getSearchPlanXhsCopyText,
  searchPlanPosterShareUrl,
} from '@/lib/home/buildSearchPlanPoster';
import { defaultSearchPlanTitle } from '@/lib/home/saveSearchStructuredPlan';
import {
  buildSearchPlanDouyinPlatformCopy,
  buildSearchPlanWechatPlatformCopy,
  searchPlanCatchyTitle,
  searchPlanShareHashtags,
  searchPlanShareHook,
  type SearchPlanPlatformCopy,
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
  if (isDouyin) return '单图+配套文案，上传抖音发布';
  return '单图+配套文案，一键复制';
}

const POSTER_RETRY_HINT = '配图暂时没生成，点重试再看一眼';

class PosterPreviewBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    const { children, onRetry } = this.props;
    const { failed } = this.state;
    if (!failed) return children;
    return (
      <div className="space-y-3 px-4 py-12 text-center">
        <p className="text-sm text-rose-600">{POSTER_RETRY_HINT}</p>
        <button
          type="button"
          className="text-sm font-semibold text-brand-600 hover:underline"
          onClick={() => {
            this.setState({ failed: false });
            onRetry();
          }}
        >
          重试
        </button>
      </div>
    );
  }
}

function visiblePlatformCopy(
  plan: HoloSearchPlanPosterPanelProps['plan'],
  isXhs: boolean,
  isDouyin: boolean,
): SearchPlanPlatformCopy {
  try {
    if (isDouyin) return buildSearchPlanDouyinPlatformCopy(plan);
    if (isXhs) {
      return {
        title: searchPlanCatchyTitle(plan),
        hook: searchPlanShareHook(plan),
        hashtags: searchPlanShareHashtags(plan),
      };
    }
    return buildSearchPlanWechatPlatformCopy(plan);
  } catch {
    const city = plan.baseInfo.targetCity.trim() || '这趟';
    return {
      title: `${city}慢游`,
      hook: '文案暂时没准备好，点重试再生成。',
      hashtags: ['蜗牛旅行'],
    };
  }
}

export default function HoloSearchPlanPosterPanel({
  plan,
  savedSessionId,
  onSystemShare,
  copyPlainText,
  onClose,
}: HoloSearchPlanPosterPanelProps) {
  const shareUrl = searchPlanPosterShareUrl(savedSessionId, plan.baseInfo, plan);
  const safeName = defaultSearchPlanTitle(plan)
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 36);
  const posterVariants = useMemo(
    () =>
      createChinaPosterVariants({
        baseFilename: safeName || '行程',
        buildWechat: () => buildSearchPlanPosterBlob(plan, shareUrl),
        buildXhs: () => buildSearchPlanXhsPosterBlob(plan, shareUrl),
        buildXhsSlides: () => buildSearchPlanXhsPosterSlides(plan, shareUrl),
        buildDouyin: () => buildSearchPlanDouyinPosterBlob(plan, shareUrl),
        getWechatCopyText: () => getSearchPlanWechatCopyText(plan),
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
  const poster = useSharePosterDialog({
    open: true,
    shareUrl,
    downloadFilename: `${safeName || '行程'}-分享海报.png`,
    posterVariants,
    shareTrackContext,
    onSystemShare,
    copyPlainText,
  });
  const platformCopy = useMemo(
    () => visiblePlatformCopy(plan, poster.isXhs, poster.isDouyin),
    [plan, poster.isDouyin, poster.isXhs],
  );

  return (
    <section className="holo-home__plan-poster" aria-label="图文分享">
      <div className="holo-home__plan-poster-head">
        <p className="holo-home__plan-label">分享行程</p>
        <button type="button" className="holo-home__plan-ghost" onClick={onClose}>
          收起分享图
        </button>
      </div>
      <p className="holo-home__plan-muted">分享标题：{platformCopy.title}</p>
      <p className="holo-home__plan-muted">种草短句：{platformCopy.hook}</p>
      <p className="holo-home__plan-muted">
        话题标签：{platformCopy.hashtags.map((tag) => `#${tag.replace(/^#/u, '')}`).join(' ')}
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
      <PosterPreviewBoundary
        onRetry={() => {
          poster.runGenerate();
        }}
      >
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
          onRetry={() => {
            poster.runGenerate();
          }}
          onPrevSlide={poster.goPrevSlide}
          onNextSlide={poster.goNextSlide}
          onGoToSlide={poster.goToSlide}
          tone="brand"
        />
      </PosterPreviewBoundary>
      {poster.assistHint || poster.copyFeedback ? (
        <p
          className={poster.assistHint ? 'holo-home__plan-poster-assist' : 'holo-home__plan-muted'}
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
          onDownloadCurrent={() => {
            poster.handleDownloadCurrent();
          }}
          onDownloadAll={() => {
            poster.handleDownloadAll();
          }}
          onCopyXhsText={() => {
            poster.handleCopyXhsText();
          }}
          onCopyLink={() => {
            poster.handleCopyLink();
          }}
          onSystemShare={() => {
            poster.handleSystemShare();
          }}
          onShareImage={() => {
            poster.handleShareImage();
          }}
          shareImageLabel="复制图片"
          showDownload={poster.showDownload}
          showDownloadCurrent={!poster.isXhs}
          showDownloadAll={poster.isXhs}
          showCopyNote
          showSystemShareButton={false}
          showViewFull={false}
          downloadAllLabel="保存全部图片"
          tone="brand"
        />
      </div>
    </section>
  );
}
