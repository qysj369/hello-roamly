import { QrCode, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import SharePosterDialog from '@/components/features/share/SharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { guideDetailPath } from '@/router/paths';
import type { Guide } from '@/types/domain/guide';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import {
  buildGuidePosterBlob,
  buildGuideXhsPosterBlob,
  buildGuideXhsPosterSlides,
  getGuideXhsCopyText,
} from '@/utils/buildGuidePoster';
import type { ShareGuideResult } from '@/utils/shareGuide';
import { shareGuide } from '@/utils/shareGuide';
import { cn } from '@/utils/cn';

type ShareFeedback = 'idle' | ShareGuideResult;

export type GuideShareControlsProps = {
  guide: Guide;
  className?: string;
  variant?: 'primary' | 'compact';
};

const FEEDBACK_LABEL: Record<Exclude<ShareFeedback, 'idle' | 'cancelled'>, string> = {
  shared: '已分享',
  copied: '已复制',
  failed: '失败',
};

export default function GuideShareControls({
  guide,
  className,
  variant = 'primary',
}: GuideShareControlsProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>('idle');
  const [posterOpen, setPosterOpen] = useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isPrimary = variant === 'primary';

  useEffect(() => {
    if (feedback === 'idle' || feedback === 'cancelled') {
      return undefined;
    }
    const timer = window.setTimeout(() => setFeedback('idle'), 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);

  async function handleQuickShare(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const result = await shareGuide(guide);
    if (result !== 'cancelled') {
      setFeedback(result);
    }
  }

  const quickLabel = feedback !== 'idle' && feedback !== 'cancelled' ? FEEDBACK_LABEL[feedback] : '分享';

  const buttonBase = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition',
    isPrimary
      ? 'rounded-xl px-3.5 py-2 text-sm shadow-sm'
      : 'rounded-lg px-2.5 py-1.5 text-xs',
  );

  const safeName = guide.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <button
          type="button"
          onClick={handleQuickShare}
          className={cn(
            buttonBase,
            isPrimary
              ? 'border border-[#b7cdc4] bg-[#fffef6] text-[#2c6b58] hover:bg-emerald-50 shadow-none'
              : 'text-[#54786c] hover:bg-emerald-50',
          )}
          aria-label="分享攻略"
        >
          <Share2 className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
          <span>{quickLabel}</span>
        </button>

        {chinaShare && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPosterOpen(true);
            }}
            className={cn(
              buttonBase,
              isPrimary
                ? 'border border-[#b7cdc4] bg-[#2c6b58] text-[#f9f7eb] hover:brightness-105 shadow-none'
                : 'text-[#2c6b58] hover:bg-emerald-50',
            )}
            aria-label="生成微信分享海报"
          >
            <QrCode className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
            <span>{isPrimary ? '分享图' : '海报'}</span>
          </button>
        )}
      </div>

      <SharePosterDialog
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        title="图文分享 · 攻略"
        description="生成微信海报或小红书风格笔记图"
        shareUrl={buildShareUrl(guideDetailPath(guide.id))}
        downloadFilename={`${safeName || '攻略'}-分享海报.png`}
        posterAlt={`${guide.title} 分享图`}
        posterVariants={createChinaPosterVariants({
          baseFilename: safeName || '攻略',
          buildWechat: () => buildGuidePosterBlob(guide),
          buildXhs: () => buildGuideXhsPosterBlob(guide),
          buildXhsSlides: () => buildGuideXhsPosterSlides(guide),
          getXhsCopyText: () => getGuideXhsCopyText(guide),
        })}
        shareTrackContext={{ contentKind: 'guide', contentId: guide.id }}
        onSystemShare={() => shareGuide(guide)}
      />
    </>
  );
}
