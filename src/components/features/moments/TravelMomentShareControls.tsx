import { QrCode, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import SharePosterDialog from '@/components/features/share/SharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { buildShareUrl } from '@/lib/share/shareUrl';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import {
  buildTravelMomentPosterBlob,
  buildTravelMomentXhsPosterBlob,
  buildTravelMomentXhsPosterSlides,
  getTravelMomentXhsCopyText,
} from '@/utils/buildTravelMomentPoster';
import type { ShareTravelMomentResult } from '@/utils/shareTravelMoment';
import {
  getTravelMomentSharePath,
  shareTravelMoment,
} from '@/utils/shareTravelMoment';
import { cn } from '@/utils/cn';

type ShareFeedback = 'idle' | ShareTravelMomentResult;

export type TravelMomentShareControlsProps = {
  moment: TravelMoment;
  authorId: string;
  authorName: string;
  isOwnProfile?: boolean;
  className?: string;
  variant?: 'primary' | 'compact' | 'icon';
};

const FEEDBACK_LABEL: Record<Exclude<ShareFeedback, 'idle' | 'cancelled'>, string> = {
  shared: '已分享',
  copied: '已复制',
  failed: '失败',
};

export default function TravelMomentShareControls({
  moment,
  authorId,
  authorName,
  isOwnProfile,
  className,
  variant = 'primary',
}: TravelMomentShareControlsProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>('idle');
  const [posterOpen, setPosterOpen] = useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isIcon = variant === 'icon';
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

  const shareParams = { moment, authorId, authorName, isOwnProfile };

  async function handleQuickShare(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const result = await shareTravelMoment(shareParams);
    if (result !== 'cancelled') {
      setFeedback(result);
    }
  }

  const quickLabel =
    feedback !== 'idle' && feedback !== 'cancelled' && !isIcon
      ? FEEDBACK_LABEL[feedback]
      : '分享';

  const buttonBase = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition',
    isIcon && 'rounded-lg p-0 text-slate-800 hover:text-slate-600',
    !isIcon && isPrimary && 'rounded-xl px-3.5 py-2 text-sm shadow-sm',
    !isIcon && !isPrimary && 'rounded-lg px-2.5 py-1.5 text-xs',
  );

  const iconSize = isIcon ? 'h-6 w-6' : isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const safeName = (moment.title || authorName).replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
  const shareUrl = buildShareUrl(getTravelMomentSharePath(moment, authorId, { isOwnProfile }));

  return (
    <>
      <div className={cn('flex items-center gap-2', className)}>
        <button
          type="button"
          onClick={handleQuickShare}
          className={cn(
            buttonBase,
            !isIcon && (isPrimary
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'text-slate-600 hover:bg-slate-100'),
          )}
          aria-label="分享瞬间"
        >
          <Share2 className={iconSize} strokeWidth={isIcon ? 1.5 : 2} aria-hidden />
          {!isIcon && <span>{quickLabel}</span>}
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
              !isIcon && (isPrimary
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'text-emerald-700 hover:bg-emerald-50'),
            )}
            aria-label="生成微信分享海报"
          >
            <QrCode className={iconSize} strokeWidth={isIcon ? 1.5 : 2} aria-hidden />
            {!isIcon && <span>{isPrimary ? '分享图' : '海报'}</span>}
          </button>
        )}
      </div>

      <SharePosterDialog
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        title="图文分享 · 瞬间"
        description="生成微信海报或小红书风格笔记图"
        shareUrl={shareUrl}
        downloadFilename={`${safeName || '瞬间'}-分享海报.png`}
        posterAlt={`${authorName} 旅行瞬间分享图`}
        posterVariants={createChinaPosterVariants({
          baseFilename: safeName || '瞬间',
          buildWechat: () => buildTravelMomentPosterBlob(shareParams),
          buildXhs: () => buildTravelMomentXhsPosterBlob(shareParams),
          buildXhsSlides: () => buildTravelMomentXhsPosterSlides(shareParams),
          getXhsCopyText: () => getTravelMomentXhsCopyText(shareParams),
        })}
        shareTrackContext={{ contentKind: 'travel_moment', contentId: moment.id }}
        onSystemShare={() => shareTravelMoment(shareParams)}
      />
    </>
  );
}
