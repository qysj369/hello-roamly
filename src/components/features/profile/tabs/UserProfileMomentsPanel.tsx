import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { findUserById } from '@/data/findUserById';
import TravelMoment from '@/components/features/moments/TravelMoment';
import TravelMomentCard, {
  type TravelMomentCardAuthor,
} from '@/components/features/moments/TravelMomentCard';
import TravelMomentTagFilter from '@/components/features/moments/TravelMomentTagFilter';
import TravelMomentsFeedFooter from '@/components/features/moments/TravelMomentsFeedFooter';
import type {
  TravelMoment as TravelMomentType,
  TravelMomentVisibility,
} from '@/types/domain/user/userSocial';
import { useInfiniteTravelMoments } from '@/hooks/moments/useInfiniteTravelMoments';
import { useTravelMomentsStore } from '@/stores/travelMoments/store';
import { travelMomentDomId, parseTravelMomentIdFromHash } from '@/router/paths';
import { collectMomentTags } from '@/utils/travelMomentFilter';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';

export type UserProfileMomentsPanelProps = {
  moments: TravelMomentType[];
  isOwnProfile: boolean;
  authorId: string;
  defaultMomentVisibility?: TravelMomentVisibility;
  className?: string;
};

export default function UserProfileMomentsPanel({
  moments,
  isOwnProfile,
  authorId,
  defaultMomentVisibility,
  className,
}: UserProfileMomentsPanelProps) {
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);
  const removeMoment = useTravelMomentsStore((state) => state.removeMoment);
  const hasMoment = useTravelMomentsStore((state) => state.hasMoment);

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const cardAuthor = useMemo((): TravelMomentCardAuthor | undefined => {
    const user = findUserById(authorId);
    if (!user) {
      return undefined;
    }
    return { userId: user.id, username: user.username, avatar: user.avatar };
  }, [authorId]);

  const {
    items: feedMoments,
    isLoading,
    isReady,
    hasMore,
    error,
    retry,
    sentinelRef,
  } = useInfiniteTravelMoments({
    moments,
    authorId,
    activeTag,
    enabled: moments.length > 0,
  });

  useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);

  useEffect(() => {
    const momentId = parseTravelMomentIdFromHash(window.location.hash);
    if (!momentId || feedMoments.length === 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      document.getElementById(travelMomentDomId(momentId))?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 120);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedMoments]);

  const tagOptions = useMemo(() => collectMomentTags(moments), [moments]);

  const handleDelete = useCallback(
    (momentId: string) => {
      if (!window.confirm('确定删除这条旅行瞬间？删除后无法恢复。')) {
        return;
      }
      removeMoment(authorId, momentId);
    },
    [authorId, removeMoment],
  );

  const showEmptyTag = isReady && feedMoments.length === 0 && moments.length > 0;
  const showInitialLoading = moments.length > 0 && !isReady && isLoading;

  return (
    <div className={cn('space-y-4', className)}>
      {isOwnProfile && <TravelMoment authorId={authorId} defaultVisibility={defaultMomentVisibility} />}

      {tagOptions.length > 0 && (
        <TravelMomentTagFilter tags={tagOptions} activeTag={activeTag} onChange={setActiveTag} />
      )}

      {showEmptyTag && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          没有带「{activeTag}」标签的瞬间
        </p>
      )}

      {moments.length === 0 && !isOwnProfile && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
          {SNAIL_GLOBAL_COPY.emptyState}
        </p>
      )}

      {moments.length === 0 && isOwnProfile && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
          {SNAIL_GLOBAL_COPY.emptyState}
        </p>
      )}

      {showInitialLoading && (
        <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#2c6b58]" aria-hidden />
          加载旅行瞬间…
        </p>
      )}

      {feedMoments.length > 0 && (
        <ul className="mx-auto max-w-lg space-y-6">
          {feedMoments.map((moment) => (
            <li key={moment.id} id={travelMomentDomId(moment.id)}>
              <TravelMomentCard
                moment={moment}
                author={cardAuthor}
                showVisibilityBadge={isOwnProfile}
                interactive
                canDelete={isOwnProfile && hasMoment(authorId, moment.id)}
                onDelete={() => handleDelete(moment.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {moments.length > 0 && (
        <TravelMomentsFeedFooter
          sentinelRef={sentinelRef}
          isLoading={isLoading}
          hasMore={hasMore}
          isReady={isReady}
          itemCount={feedMoments.length}
          error={error}
          onRetry={retry}
          className="mx-auto max-w-lg"
        />
      )}
    </div>
  );
}
