import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  buildSearchPlanDouyinStaticPosterBlob,
  buildSearchPlanWechatSquarePosterBlob,
  getSearchPlanFragmentPoster,
  searchPlanPosterShareUrl,
} from '@/lib/home/buildSearchPlanPoster';
import {
  buildSearchPlanXhsNoteSlides,
  buildSearchPlanXhsSeedCopy,
  renderSearchPlanXhsNotePosters,
} from '@/lib/home/buildSearchPlanXhsNotePack';
import { preloadShanghaiSharePhotos } from '@/lib/home/shanghaiSharePhotoMatch';
import { searchPlanShareCardDesc, searchPlanShareTitle } from '@/lib/home/formatSearchPlanCopyText';
import {
  SEARCH_PLAN_DISCLAIMER,
  buildSearchPlanChannelCopy,
  sanitizeShareExportText,
  searchPlanExportHint,
} from '@/lib/home/searchPlanShareChannels';
import { searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import HoloSearchPlanDouyinReel from '@/components/home/holo/HoloSearchPlanDouyinReel';
import { pickCityShareDouyinScript } from '@/data/cityShareSeedKit';
import { downloadBlob, downloadBlobsSequential } from '@/lib/share/download';
import { isLikelyMobileShareDevice } from '@/lib/share/openSocialApp';
import { blobToShareFile, canShareImageFiles, shareImageFiles } from '@/lib/share/shareImageFiles';
import { isWechatInAppBrowser } from '@/lib/share/wechat';
import { configureWechatJsShare, wechatShareCardImageUrl } from '@/lib/share/wechatJsSdk';
import { copyTextToClipboardSync, copyVisibleText } from '@/utils/copyTextToClipboard';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanAutoExportKind = 'douyin' | 'wechat' | 'xhs';

export function toShareAutoExport(kind: string | null | undefined): SearchPlanAutoExportKind | null {
  if (kind === 'wechat' || kind === 'douyin' || kind === 'xhs') return kind;
  return null;
}

type HoloSearchPlanShareSheetProps = {
  plan: SearchStructuredPlan;
  savedSessionId: string | null;
  copiedOnOpen?: boolean;
  autoExport?: SearchPlanAutoExportKind | null;
  onExportDone?: () => void;
  onClose: () => void;
};

const SHARE_LEAD = '点微信、抖音或小红书：下载海报并复制文案。不唤起 App。';

async function makeShareQr(shareUrl: string): Promise<string> {
  return QRCode.toDataURL(shareUrl, {
    width: 220,
    margin: 1,
    color: { dark: '#222c28', light: '#ffffff' },
  });
}

function copyPlain(text: string): boolean {
  if (copyTextToClipboardSync(text) === 'copied') return true;
  if (!navigator.clipboard?.writeText) return false;
  void navigator.clipboard.writeText(text);
  return true;
}

async function tryMobileShare(blobs: Blob[], names: string[], title: string, text: string): Promise<boolean> {
  if (!isLikelyMobileShareDevice()) return false;
  const files = blobs.map((blob, index) => blobToShareFile(blob, names[index] ?? `share-${index + 1}.png`));
  if (!canShareImageFiles(files)) return false;
  return (await shareImageFiles({ files, title, text })) === 'shared';
}

export default function HoloSearchPlanShareSheet({
  plan,
  savedSessionId,
  copiedOnOpen = false,
  autoExport = null,
  onExportDone,
  onClose,
}: HoloSearchPlanShareSheetProps) {
  const shareUrl = searchPlanPosterShareUrl(savedSessionId, plan.baseInfo);
  const wechatNote = sanitizeShareExportText(buildSearchPlanChannelCopy('wechat', plan, shareUrl));
  const douyinNote = sanitizeShareExportText(buildSearchPlanChannelCopy('douyin', plan, shareUrl));
  const xhsNote = sanitizeShareExportText(buildSearchPlanXhsSeedCopy(plan));
  const wechatThumb = getSearchPlanFragmentPoster(plan);
  const xhsSlides = buildSearchPlanXhsNoteSlides(plan);
  const douyinScript = pickCityShareDouyinScript(plan);
  const inWechat = isWechatInAppBrowser();
  const wechatBoxRef = useRef<HTMLTextAreaElement>(null);
  const douyinBoxRef = useRef<HTMLTextAreaElement>(null);
  const xhsBoxRef = useRef<HTMLTextAreaElement>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [showWechatQr, setShowWechatQr] = useState(false);
  const [reelFull, setReelFull] = useState(false);
  const [exporting, setExporting] = useState<SearchPlanAutoExportKind | null>(null);
  const [status, setStatus] = useState(
    copiedOnOpen
      ? '文案已复制。打开微信粘贴，或再点下面的微信按钮下图。'
      : inWechat
        ? '点微信、抖音或小红书：下载海报并复制文案。不唤起 App。'
        : SHARE_LEAD,
  );

  useEffect(() => {
    preloadShanghaiSharePhotos();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void makeShareQr(shareUrl).then((url) => {
      if (!cancelled) setQrUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  useEffect(() => {
    void configureWechatJsShare({
      title: searchPlanShareTitle(plan),
      desc: searchPlanShareCardDesc(plan),
      link: shareUrl,
      imgUrl: wechatShareCardImageUrl(),
    });
  }, [plan, shareUrl]);

  const copyWechatNote = () => {
    const node = wechatBoxRef.current;
    if (node && copyVisibleText(node) === 'copied') return true;
    return copyPlain(wechatNote);
  };

  const copyDouyinNote = () => {
    const node = douyinBoxRef.current;
    if (node && copyVisibleText(node) === 'copied') return true;
    return copyPlain(douyinNote);
  };

  const copyXhsNote = () => {
    const node = xhsBoxRef.current;
    if (node && copyVisibleText(node) === 'copied') return true;
    return copyPlain(xhsNote);
  };

  const runExportRef = useRef<(kind: SearchPlanAutoExportKind) => Promise<void>>(async () => undefined);

  const runExport = async (kind: SearchPlanAutoExportKind) => {
    if (exporting) return;
    setExporting(kind);
    const city = searchPlanShareCityName(plan) || '漫游';
    if (kind === 'wechat') {
      copyWechatNote();
    } else if (kind === 'douyin') {
      copyDouyinNote();
    } else {
      copyXhsNote();
    }
    try {
      setShowWechatQr(kind === 'wechat');
      if (kind === 'xhs') {
        const slides = await renderSearchPlanXhsNotePosters(plan);
        await downloadBlobsSequential(slides, (index, total) => `${city}-xiaohongshu-${index + 1}-of-${total}.png`);
        await tryMobileShare(slides, slides.map((_, index) => `${city}-xiaohongshu-${index + 1}.png`), `${city}小红书`, xhsNote);
      } else if (kind === 'douyin') {
        const blob = await buildSearchPlanDouyinStaticPosterBlob(plan);
        downloadBlob(blob, `${city}-douyin.png`);
        await tryMobileShare([blob], [`${city}-douyin.png`], `${city}抖音`, douyinNote);
      } else {
        const blob = await buildSearchPlanWechatSquarePosterBlob(plan);
        downloadBlob(blob, `${city}-wechat.png`);
        await tryMobileShare([blob], [`${city}-wechat.png`], `${city}微信`, wechatNote);
      }
      setStatus(searchPlanExportHint(kind));
    } catch {
      setStatus('图片没下下来。文案可先粘贴；再点一次按钮重试下载。');
    } finally {
      setExporting(null);
      onExportDone?.();
    }
  };
  runExportRef.current = runExport;

  useEffect(() => {
    if (!autoExport) return undefined;
    void runExportRef.current(autoExport);
    return undefined;
  }, [autoExport]);

  return (
    <div className="holo-home__plan-modal" role="dialog" aria-label="发给朋友" onClick={onClose}>
      <div
        className="holo-home__plan-modal-card holo-home__plan-share-lite"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="holo-home__plan-poster-head">
          <p className="holo-home__plan-label">发给朋友</p>
          <button type="button" className="holo-home__plan-ghost" onClick={onClose}>
            关闭
          </button>
        </div>

        <p className="holo-home__plan-share-lead" role="status">
          {status}
        </p>

        <section className="holo-home__plan-share-xhs" aria-label="微信">
          <h4 className="holo-home__plan-share-xhs-title">微信</h4>
          <p className="holo-home__plan-share-hint">下载 1:1 方图，短文案发朋友圈。不打开微信 App。</p>
          <div className="holo-home__plan-share-xhs-thumbs holo-home__plan-share-xhs-thumbs--square">
            <figure className="holo-home__plan-share-xhs-thumb">
              <img src={wechatThumb.imageUrl} alt={wechatThumb.title} />
              <figcaption>{wechatThumb.title}</figcaption>
            </figure>
          </div>
          <textarea
            ref={wechatBoxRef}
            className="holo-home__plan-share-copy-box holo-home__plan-share-copy-box--wechat"
            readOnly
            value={wechatNote}
            aria-label="朋友圈短文案"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className="holo-home__plan-share-copy-btn"
            disabled={Boolean(exporting)}
            onClick={() => void runExport('wechat')}
          >
            {exporting === 'wechat' ? '生成中…' : '下载微信海报并复制文案'}
          </button>
          {showWechatQr && qrUrl ? (
            <div className="holo-home__plan-share-qr">
              <img src={qrUrl} alt="扫码打开完整攻略页" width={140} height={140} />
              <p className="holo-home__plan-share-note-label">扫码打开完整攻略页</p>
            </div>
          ) : null}
        </section>

        <section className="holo-home__plan-share-xhs" aria-label="抖音">
          <h4 className="holo-home__plan-share-xhs-title">抖音</h4>
          <p className="holo-home__plan-share-hint">竖版滚动卡可直接对着录。图上不写完整行程、预算、外链。不打开抖音 App。</p>
          <div className="holo-home__plan-share-stage">
            <HoloSearchPlanDouyinReel
              plan={plan}
              script={douyinScript}
              fullscreen={reelFull}
              onToggleFullscreen={() => setReelFull(false)}
            />
            <button
              type="button"
              className="holo-home__plan-ghost"
              onClick={() => {
                copyDouyinNote();
                setShowWechatQr(false);
                setReelFull(true);
              }}
            >
              全屏录屏卡
            </button>
          </div>
          <textarea
            ref={douyinBoxRef}
            className="holo-home__plan-share-copy-box holo-home__plan-share-copy-box--xhs"
            readOnly
            value={douyinNote}
            aria-label="抖音口播"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className="holo-home__plan-share-copy-btn"
            disabled={Boolean(exporting)}
            onClick={() => void runExport('douyin')}
          >
            {exporting === 'douyin' ? '生成中…' : '下载抖音海报并复制口播'}
          </button>
        </section>

        <section className="holo-home__plan-share-xhs" aria-label="小红书">
          <h4 className="holo-home__plan-share-xhs-title">小红书</h4>
          <p className="holo-home__plan-share-hint">下载3张3:4竖版图文，复制种草文案，不唤起小红书App</p>
          <div className="holo-home__plan-share-xhs-thumbs">
            {xhsSlides.map((slide) => (
              <figure key={slide.role} className="holo-home__plan-share-xhs-thumb">
                <img src={slide.imageUrl} alt={slide.title} />
                <figcaption>{slide.title}</figcaption>
              </figure>
            ))}
          </div>
          <textarea
            ref={xhsBoxRef}
            className="holo-home__plan-share-copy-box holo-home__plan-share-copy-box--xhs"
            readOnly
            value={xhsNote}
            aria-label="小红书种草文案"
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className="holo-home__plan-share-copy-btn"
            disabled={Boolean(exporting)}
            onClick={() => void runExport('xhs')}
          >
            {exporting === 'xhs' ? '生成中…' : '下载3张小红书海报并复制种草文案'}
          </button>
        </section>

        <p className="holo-home__plan-share-legal">{SEARCH_PLAN_DISCLAIMER}</p>
      </div>
    </div>
  );
}
