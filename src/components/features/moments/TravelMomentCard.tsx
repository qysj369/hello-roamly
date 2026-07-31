import { Globe, Lock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { findUserById } from '@/data/findUserById';
import type { TravelMoment, TravelMomentVisibility } from '@/types/domain/user/userSocial';
import { userProfilePath } from '@/router/paths';
import TravelMomentCardActions, {
  useMomentLikeCount,
} from '@/components/features/moments/TravelMomentCardActions';
import TravelMomentCardMedia from '@/components/features/moments/TravelMomentCardMedia';
import TravelMomentDoubleTapLike from '@/components/features/moments/TravelMomentDoubleTapLike';
import TravelMomentTagList from '@/components/features/moments/TravelMomentTagList';
import { AvatarImage } from '@/components/ui';
import { formatRelativeZh } from '@/utils/date';
import {
  getMomentDescription,
  getMomentDetailText,
  getMomentTags,
} from '@/utils/travelMomentDisplay';
import { getCountryLabel } from '@/utils/userProfileView';
import {
  canViewTravelMoment,
  getTravelMomentVisibilityLabel,
} from '@/utils/travelMomentVisibility';
import { cn } from '@/utils/cn';

export type TravelMomentCardAuthor = {
  userId: string;
  username: string;
  avatar?: string;
};

export type TravelMomentCardProps = {
  moment: TravelMoment;
  author?: TravelMomentCardAuthor;
  showVisibilityBadge?: boolean;
  interactive?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  /** 未传时按可见性规则推断是否显示分享 */
  shareEnabled?: boolean;
  className?: string;
};

const VISIBILITY_BADGE_STYLES: Record<
  TravelMomentVisibility,
  { className: string; Icon: typeof Globe }
> = {
  public: {
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icon: Globe,
  },
  followers: {
    className: 'border-amber-200 bg-amber-50 text-amber-900',
    Icon: Users,
  },
  private: {
    className: 'border-slate-200 bg-slate-100 text-slate-700',
    Icon: Lock,
  },
};

function MomentVisibilityBadge({ visibility }: { visibility: TravelMomentVisibility }) {
  const { className: badgeClass, Icon } = VISIBILITY_BADGE_STYLES[visibility];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        badgeClass,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {getTravelMomentVisibilityLabel(visibility)}
    </span>
  );
}

function buildLocationLabel(moment: TravelMoment): string | null {
  const parts: string[] = [];
  if (moment.location?.trim()) {
    parts.push(moment.location.trim());
  }
  if (moment.countryCode) {
    parts.push(getCountryLabel(moment.countryCode));
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildMapsHref(moment: TravelMoment): string | null {
  if (moment.coordinates) {
    return `https://www.google.com/maps?q=${moment.coordinates.latitude},${moment.coordinates.longitude}`;
  }
  if (moment.location?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(moment.location.trim())}`;
  }
  return null;
}

function CardHeader({
  author,
  locationLabel,
  showVisibilityBadge,
  visibility,
}: {
  author: TravelMomentCardAuthor;
  locationLabel: string | null;
  showVisibilityBadge: boolean;
  visibility: TravelMomentVisibility;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
      <Link
        to={userProfilePath(author.userId)}
        className="flex min-w-0 flex-1 items-center gap-2.5"
      >
        {author.avatar ? (
          <AvatarImage
            src={author.avatar}
            displayName={author.username}
            size={36}
            className="h-9 w-9 shrink-0 border border-slate-200/80 bg-slate-100"
          />
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700"
            aria-hidden
          >
            {author.username.slice(0, 1)}
          </span>
        )}
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {author.username}
          </span>
          {locationLabel && (
            <span className="mt-0.5 flex items-center gap-0.5 truncate text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              {locationLabel}
            </span>
          )}
        </span>
      </Link>
      {showVisibilityBadge && <MomentVisibilityBadge visibility={visibility} />}
    </header>
  );
}

/** Instagram 风格旅行瞬间卡片 */
export default function TravelMomentCard({
  moment,
  author: authorProp,
  showVisibilityBadge = false,
  interactive = false,
  canDelete = false,
  onDelete,
  shareEnabled: shareEnabledProp,
  className,
}: TravelMomentCardProps) {
  const resolvedAuthor =
    authorProp ??
    (() => {
      const user = findUserById(moment.authorId);
      if (!user) {
        return { userId: moment.authorId, username: '旅人' };
      }
      return { userId: user.id, username: user.username, avatar: user.avatar };
    })();

  const description = getMomentDescription(moment);
  const detail = getMomentDetailText(moment);
  const tags = getMomentTags(moment);
  const locationLabel = buildLocationLabel(moment);
  const mapsHref = buildMapsHref(moment);
  const visibility = moment.visibility ?? 'public';

  const { displayLikes, isLiked, toggleLike } = useMomentLikeCount(moment, interactive);

  const handleCommentClick = () => {
    // TODO: 打开评论抽屉/跳转评论页，对接 POST /moments/:id/comments
  };

  const isAuthorOwnProfile = resolvedAuthor.userId === DEMO_CURRENT_USER_ID;
  const canShareMoment =
    shareEnabledProp ??
    canViewTravelMoment({
      moment,
      authorId: resolvedAuthor.userId,
      // TODO: 使用 auth 上下文中的 viewerId，支持访客仅看公开内容
      viewerId: DEMO_CURRENT_USER_ID,
      isOwnProfile: isAuthorOwnProfile,
    });

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm',
        className,
      )}
    >
      <CardHeader
        author={resolvedAuthor}
        locationLabel={locationLabel}
        showVisibilityBadge={showVisibilityBadge}
        visibility={visibility}
      />

      <TravelMomentDoubleTapLike
        enabled={interactive}
        isLiked={isLiked}
        onLike={toggleLike}
      >
        <TravelMomentCardMedia moment={moment} />
      </TravelMomentDoubleTapLike>

      <TravelMomentCardActions
        moment={moment}
        interactive={interactive}
        canDelete={canDelete}
        onDelete={onDelete}
        onCommentClick={handleCommentClick}
        shareEnabled={canShareMoment}
        shareAuthorId={resolvedAuthor.userId}
        shareAuthorName={resolvedAuthor.username}
        shareIsOwnProfile={isAuthorOwnProfile}
      />

      <div className="space-y-1.5 px-3 pb-3">
        {displayLikes > 0 && (
          <p className="text-sm font-semibold text-slate-900">{displayLikes} 次赞</p>
        )}

        <div className="text-sm leading-relaxed text-slate-900">
          {moment.title && (
            <p className="mb-1 font-semibold text-slate-900">{moment.title}</p>
          )}
          <p>
            <Link
              to={userProfilePath(resolvedAuthor.userId)}
              className="mr-1.5 font-semibold hover:underline"
            >
              {resolvedAuthor.username}
            </Link>
            <span className="text-slate-800">{description}</span>
          </p>
          {detail && <p className="mt-1.5 text-slate-600">{detail}</p>}
        </div>

        {tags.length > 0 && <TravelMomentTagList tags={tags} className="pt-0.5" />}

        {locationLabel && mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            在地图中查看
          </a>
        )}

        <time
          className="block pt-0.5 text-[10px] uppercase tracking-wide text-slate-400"
          dateTime={moment.createdAt}
        >
          {formatRelativeZh(moment.createdAt)}
        </time>

        {moment.commentCount > 0 && (
          <button
            type="button"
            onClick={handleCommentClick}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            查看全部 {moment.commentCount} 条评论
          </button>
        )}
      </div>
    </article>
  );
}
