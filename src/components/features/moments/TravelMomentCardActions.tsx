import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import TravelMomentShareControls from '@/components/features/moments/TravelMomentShareControls';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { useMomentLikes } from '@/hooks/api/useMomentLikes';
import { useToggleMomentLike } from '@/hooks/api/useToggleMomentLike';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';
export type TravelMomentCardActionsProps = {
  moment: TravelMoment;
  interactive?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  onCommentClick?: () => void;
  shareEnabled?: boolean;
  shareAuthorId?: string;
  shareAuthorName?: string;
  shareIsOwnProfile?: boolean;
  className?: string;
};

export function useMomentLikeCount(moment: TravelMoment, interactive: boolean): {
  displayLikes: number;
  isLiked: boolean;
  toggleLike: () => void;
  isTogglingLike: boolean;
} {
  const { data: likedIds = [] } = useMomentLikes(interactive);
  const toggleLikeMutation = useToggleMomentLike();
  const isLiked = likedIds.includes(moment.id);

  return {
    displayLikes: moment.likeCount + (isLiked ? 1 : 0),
    isLiked,
    toggleLike: () => {
      if (!interactive) {
        return;
      }
      toggleLikeMutation.mutate(moment.id);
    },
    isTogglingLike: toggleLikeMutation.isPending,
  };
}

/** Instagram 风格操作栏：点赞、评论 */
export default function TravelMomentCardActions({
  moment,
  interactive = false,
  canDelete = false,
  onDelete,
  onCommentClick,
  shareEnabled = false,
  shareAuthorId,
  shareAuthorName,
  shareIsOwnProfile,
  className,
}: TravelMomentCardActionsProps) {
  const { displayLikes, isLiked, toggleLike, isTogglingLike } = useMomentLikeCount(
    moment,
    interactive,
  );

  return (
    <div className={cn('flex items-center justify-between gap-2 px-3 py-2.5', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!interactive || isTogglingLike}
          onClick={toggleLike}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold transition',
            isLiked ? 'text-rose-600' : 'text-slate-800 hover:text-slate-600',
            (!interactive || isTogglingLike) && 'opacity-60',
          )}
          aria-pressed={isLiked}
          aria-label={isLiked ? SNAIL_GLOBAL_COPY.unlike : SNAIL_GLOBAL_COPY.like}        >
          <Heart
            className={cn('h-6 w-6', isLiked && 'fill-current')}
            strokeWidth={isLiked ? 0 : 1.5}
            aria-hidden
          />
          {displayLikes > 0 && <span className="tabular-nums">{displayLikes}</span>}
        </button>

        <button
          type="button"
          onClick={onCommentClick}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 transition hover:text-slate-600"
          aria-label="评论"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </button>

        {shareEnabled && shareAuthorId && shareAuthorName && (
          <TravelMomentShareControls
            moment={moment}
            authorId={shareAuthorId}
            authorName={shareAuthorName}
            isOwnProfile={shareIsOwnProfile}
            variant="icon"
          />
        )}
      </div>

      {canDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label="删除瞬间"
        >
          <Trash2 className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
