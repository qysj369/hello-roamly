import { Bookmark, Heart, QrCode, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import WechatSharePosterDialog from '@/components/features/share/WechatSharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { usePlanInteractions } from '@/hooks/api/usePlanInteractions';
import { useTogglePlanFavorite } from '@/hooks/api/useTogglePlanFavorite';
import { useTogglePlanLike } from '@/hooks/api/useTogglePlanLike';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';
import { shareTravelPlan } from '@/utils/shareTravelPlan';
import { getPlanLikeCount } from '@/utils/travelPlanView';

type TravelPlanCardActionsProps = {
  plan: TravelPlan;
  className?: string;
};

type ShareFeedback = 'idle' | 'shared' | 'copied' | 'failed';

const actionButtonClass =
  'inline-flex min-h-9 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1';

export default function TravelPlanCardActions({ plan, className }: TravelPlanCardActionsProps) {
  const { data: interactions } = usePlanInteractions();
  const toggleLike = useTogglePlanLike();
  const toggleFavorite = useTogglePlanFavorite();

  const likedIds = interactions?.liked ?? [];
  const favoritedIds = interactions?.favorited ?? [];
  const isLiked = likedIds.includes(plan.id);
  const isFavorited = favoritedIds.includes(plan.id);

  const [shareFeedback, setShareFeedback] = useState<ShareFeedback>('idle');
  const [posterOpen, setPosterOpen] = useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const baseLikes = getPlanLikeCount(plan);
  const displayLikes = baseLikes + (isLiked ? 1 : 0);

  useEffect(() => {
    if (shareFeedback === 'idle') {
      return undefined;
    }
    const timer = window.setTimeout(() => setShareFeedback('idle'), 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [shareFeedback]);

  const handleShare = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const result = await shareTravelPlan(plan);
    if (result === 'shared') {
      setShareFeedback('shared');
    } else if (result === 'copied') {
      setShareFeedback('copied');
    } else if (result === 'failed') {
      setShareFeedback('failed');
    }
  };

  const shareLabels: Record<ShareFeedback, string> = {
    idle: '分享',
    shared: '已分享',
    copied: '已复制',
    failed: '失败',
  };
  const shareLabel = shareLabels[shareFeedback];

  const handlePoster = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPosterOpen(true);
  };

  return (
    <>
    <div
      className={cn(
        'flex items-stretch gap-1 border-t border-slate-100/90 pt-3',
        className,
      )}
      role="group"
      aria-label="计划互动"
    >
      <button
        type="button"
        className={cn(
          actionButtonClass,
          isLiked
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            : 'text-slate-600 hover:bg-slate-100',
          toggleLike.isPending && 'opacity-60',
        )}
        aria-pressed={isLiked}
        aria-label={SNAIL_GLOBAL_COPY.likeAria(displayLikes, isLiked)}
        disabled={toggleLike.isPending}
        onClick={(event) => {
          event.stopPropagation();
          toggleLike.mutate(plan.id);
        }}
      >
        <Heart
          className={cn('h-4 w-4', isLiked && 'fill-current')}
          strokeWidth={isLiked ? 0 : 2}
          aria-hidden
        />
        <span>{displayLikes > 0 ? displayLikes : SNAIL_GLOBAL_COPY.like}</span>      </button>

      <button
        type="button"
        className={cn(
          actionButtonClass,
          isFavorited
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'text-slate-600 hover:bg-slate-100',
          toggleFavorite.isPending && 'opacity-60',
        )}
        aria-pressed={isFavorited}
        aria-label={isFavorited ? SNAIL_GLOBAL_COPY.unfavorite : SNAIL_GLOBAL_COPY.favorite}        disabled={toggleFavorite.isPending}
        onClick={(event) => {
          event.stopPropagation();
          toggleFavorite.mutate(plan.id);
        }}
      >
        <Bookmark
          className={cn('h-4 w-4', isFavorited && 'fill-current')}
          strokeWidth={isFavorited ? 0 : 2}
          aria-hidden
        />
        <span>{isFavorited ? SNAIL_GLOBAL_COPY.favorited : SNAIL_GLOBAL_COPY.favorite}</span>      </button>

      <button
        type="button"
        className={cn(actionButtonClass, 'text-slate-600 hover:bg-slate-100')}
        aria-label={shareLabel}
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        <span>{shareLabel}</span>
      </button>

      {chinaShare && (
        <button
          type="button"
          className={cn(actionButtonClass, 'text-violet-700 hover:bg-violet-50')}
          aria-label="微信分享海报"
          onClick={handlePoster}
        >
          <QrCode className="h-4 w-4" aria-hidden />
          <span>海报</span>
        </button>
      )}
    </div>

    <WechatSharePosterDialog plan={plan} open={posterOpen} onClose={() => setPosterOpen(false)} />
    </>
  );
}
