import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { searchPlanPosterShareUrl } from '@/lib/home/buildSearchPlanPoster';
import { preloadShanghaiSharePhotos } from '@/lib/home/shanghaiSharePhotoMatch';
import { searchPlanShareCardDesc, searchPlanShareTitle } from '@/lib/home/formatSearchPlanCopyText';
import { renderItinerarySummaryPoster } from '@/lib/share/renderItinerarySummaryPoster';
import {
  SEARCH_PLAN_DISCLAIMER,
  buildSearchPlanChannelCopy,
  sanitizeShareExportText,
  searchPlanExportHint,
  searchPlanExportSteps,
} from '@/lib/home/searchPlanShareChannels';
import { searchPlanShareCityName } from '@/lib/home/searchPlanShareCopy';
import { listSearchPlanSharePhotos, type SearchPlanSharePhoto } from '@/lib/home/searchPlanShareVisuals';
import { downloadBlob } from '@/lib/share/download';
import { isLikelyMobileShareDevice } from '@/lib/share/openSocialApp';
import { blobToShareFile, canShareImageFiles, shareImageFiles } from '@/lib/share/shareImageFiles';
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

const CHANNELS: Array<{ id: SearchPlanAutoExportKind; label: string; hint: string }> = [
  { id: 'wechat', label: '微信', hint: '走心短文 + 汇总海报' },
  { id: 'douyin', label: '抖音', hint: '口播短句 + 竖版汇总海报' },
  { id: 'xhs', label: '小红书', hint: '种草文案 + 3:4 汇总海报' },
];

const SHARE_LEAD = '选平台，复制对应文案并下载行程汇总海报。网页不能直发 App。';

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

function ShareSummaryPreview({
  kind,
  plan,
  photos,
  qrUrl,
}: {
  kind: SearchPlanAutoExportKind;
  plan: SearchStructuredPlan;
  photos: SearchPlanSharePhoto[];
  qrUrl: string | null;
}) {
  const city = searchPlanShareCityName(plan);
  const cover = photos[0];
  const thumbs = photos.slice(1, 4);
  const days = plan.dayList.slice(0, 3);
  const label = kind === 'wechat' ? '微信' : kind === 'douyin' ? '抖音' : '小红书';
  return (
    <article
      className={`holo-home__plan-share-summary holo-home__plan-share-summary--${kind}`}
      aria-label={`${label}汇总海报预览`}
    >
      {cover ? (
        <img className="holo-home__plan-share-summary-cover" src={cover.photoPath} alt={cover.name} />
      ) : null}
      <div className="holo-home__plan-share-summary-body">
        <p className="holo-home__plan-share-summary-kicker">蜗牛旅行</p>
        <h4>
          {city}
          {plan.baseInfo.days}天行程汇总
        </h4>
        <ul>
          {days.map((day, index) => (
            <li key={day.day}>
              {thumbs[index] ? <img src={thumbs[index]!.photoPath} alt="" /> : null}
              <span>
                D{day.day}{' '}
                {day.spots
                  .map((spot) => spot.name)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(' · ') || day.title}
              </span>
            </li>
          ))}
        </ul>
        {qrUrl ? (
          <div className="holo-home__plan-share-summary-qr-wrap">
            <img className="holo-home__plan-share-summary-qr" src={qrUrl} alt="扫码打开这趟行程" width={72} height={72} />
            <span>扫码打开这趟行程</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function HoloSearchPlanShareSheet({
  plan,
  savedSessionId,
  copiedOnOpen: _copiedOnOpen = false,
  autoExport = null,
  onExportDone,
  onClose,
}: HoloSearchPlanShareSheetProps) {
  const shareUrl = searchPlanPosterShareUrl(savedSessionId, plan.baseInfo, plan);
  const wechatNote = sanitizeShareExportText(buildSearchPlanChannelCopy('wechat', plan, shareUrl));
  const douyinNote = sanitizeShareExportText(buildSearchPlanChannelCopy('douyin', plan, shareUrl));
  const xhsNote = sanitizeShareExportText(buildSearchPlanChannelCopy('xhs', plan, shareUrl));
  const wechatBoxRef = useRef<HTMLTextAreaElement>(null);
  const douyinBoxRef = useRef<HTMLTextAreaElement>(null);
  const xhsBoxRef = useRef<HTMLTextAreaElement>(null);
  const photos = listSearchPlanSharePhotos(plan);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [channel, setChannel] = useState<SearchPlanAutoExportKind | null>(autoExport ?? 'wechat');
  const [exporting, setExporting] = useState<SearchPlanAutoExportKind | null>(null);
  const [status, setStatus] = useState(SHARE_LEAD);

  useEffect(() => {
    preloadShanghaiSharePhotos();
  }, []);

  useEffect(() => {
    if (autoExport) setChannel(autoExport);
  }, [autoExport]);

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

  const pickChannel = (next: SearchPlanAutoExportKind) => {
    setChannel(next);
    const label = CHANNELS.find((item) => item.id === next)?.label ?? next;
    setStatus(`已选${label}。复制文案，再下载行程汇总海报。`);
  };

  const runExportRef = useRef<(kind: SearchPlanAutoExportKind) => Promise<void>>(async () => undefined);

  const runExport = async (kind: SearchPlanAutoExportKind) => {
    if (exporting) return;
    setExporting(kind);
    const city = searchPlanShareCityName(plan) || '漫游';
    const note = kind === 'wechat' ? wechatNote : kind === 'douyin' ? douyinNote : xhsNote;
    if (kind === 'wechat') copyWechatNote();
    else if (kind === 'douyin') copyDouyinNote();
    else copyXhsNote();
    try {
      const blob = await renderItinerarySummaryPoster(plan, kind, shareUrl);
      const name = `${city}-${kind === 'xhs' ? '小红书' : kind === 'douyin' ? '抖音' : '微信'}汇总海报.png`;
      downloadBlob(blob, name);
      await tryMobileShare(
        [blob],
        [name],
        `${city}${kind === 'xhs' ? '小红书' : kind === 'douyin' ? '抖音' : '微信'}`,
        note,
      );
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

  const note =
    channel === 'wechat' ? wechatNote : channel === 'douyin' ? douyinNote : channel === 'xhs' ? xhsNote : '';
  const noteRef = channel === 'wechat' ? wechatBoxRef : channel === 'douyin' ? douyinBoxRef : xhsBoxRef;
  const noteLabel = channel === 'wechat' ? '朋友圈短文案' : channel === 'douyin' ? '抖音口播' : '小红书种草文案';
  const copyLabel = '复制文案';
  const downloadLabel = '下载海报';

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

        <div className="holo-home__plan-share-pick" role="group" aria-label="选择分享渠道">
          {CHANNELS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                channel === item.id ? 'holo-home__plan-share-channel is-on' : 'holo-home__plan-share-channel'
              }
              aria-pressed={channel === item.id}
              onClick={() => pickChannel(item.id)}
            >
              <span className="holo-home__plan-share-channel-name">{item.label}</span>
              <span className="holo-home__plan-share-channel-hint">{item.hint}</span>
            </button>
          ))}
        </div>

        {channel ? (
          <section className="holo-home__plan-share-xhs" aria-label={CHANNELS.find((item) => item.id === channel)?.label}>
            <ol className="holo-home__plan-share-steps">
              {searchPlanExportSteps(channel).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ShareSummaryPreview kind={channel} plan={plan} photos={photos} qrUrl={qrUrl} />
            <textarea
              ref={noteRef}
              className="holo-home__plan-share-copy-box"
              readOnly
              value={note}
              aria-label={noteLabel}
              onFocus={(event) => event.currentTarget.select()}
            />
            <div className="holo-home__plan-share-actions">
              <button
                type="button"
                className="holo-home__plan-share-copy-btn"
                onClick={() => {
                  if (channel === 'wechat') copyWechatNote();
                  else if (channel === 'douyin') copyDouyinNote();
                  else copyXhsNote();
                  setStatus(`${CHANNELS.find((item) => item.id === channel)?.label ?? ''}文案已复制。`);
                }}
              >
                {copyLabel}
              </button>
              <button
                type="button"
                className="holo-home__plan-share-copy-btn"
                disabled={Boolean(exporting)}
                onClick={() => void runExport(channel)}
              >
                {exporting === channel ? '生成中…' : downloadLabel}
              </button>
            </div>
          </section>
        ) : null}

        <p className="holo-home__plan-share-legal">{SEARCH_PLAN_DISCLAIMER}</p>
      </div>
    </div>
  );
}
