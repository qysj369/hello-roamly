import { QrCode, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import WechatSharePosterDialog from '@/components/features/share/WechatSharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import type { TravelPlan } from '@/types/domain/travelPlan';
import type { ShareTravelPlanResult } from '@/utils/shareTravelPlan';
import { shareTravelPlan } from '@/utils/shareTravelPlan';
import { cn } from '@/utils/cn';

export type TravelPlanShareControlsProps = {
  plan: TravelPlan;
  className?: string;
  variant?: 'primary' | 'compact';
};

type ShareFeedback = 'idle' | ShareTravelPlanResult;

const FEEDBACK_LABEL: Record<Exclude<ShareFeedback, 'idle' | 'cancelled'>, string> = {
  shared: '已分享',
  copied: '已复制',
  failed: '失败',
};

export default function TravelPlanShareControls({
  plan,
  className,
  variant = 'primary',
}: TravelPlanShareControlsProps) {
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
    const result = await shareTravelPlan(plan);
    if (result !== 'cancelled') {
      setFeedback(result);
    }
  }

  function handleWechatPoster(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setPosterOpen(true);
  }

  const quickLabel =
    feedback !== 'idle' && feedback !== 'cancelled' ? FEEDBACK_LABEL[feedback] : '分享';

  const buttonBase = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition',
    isPrimary
      ? 'rounded-xl px-3.5 py-2 text-sm shadow-sm'
      : 'rounded-lg px-2.5 py-1.5 text-xs',
  );

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <button
          type="button"
          onClick={handleQuickShare}
          className={cn(
            buttonBase,
            isPrimary
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'text-slate-600 hover:bg-slate-100',
            (feedback === 'shared' || feedback === 'copied') &&
              isPrimary &&
              'bg-emerald-600 hover:bg-emerald-700',
          )}
          aria-label="分享旅行计划"
        >
          <Share2 className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
          <span>{quickLabel}</span>
        </button>

        {chinaShare && (
          <button
            type="button"
            onClick={handleWechatPoster}
            className={cn(
              buttonBase,
              isPrimary
                ? 'border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100'
                : 'text-violet-700 hover:bg-violet-50',
            )}
            aria-label="生成微信分享海报"
          >
            <QrCode className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
            <span>{isPrimary ? '分享图' : '海报'}</span>
          </button>
        )}
      </div>

      <WechatSharePosterDialog plan={plan} open={posterOpen} onClose={() => setPosterOpen(false)} />
    </>
  );
}
