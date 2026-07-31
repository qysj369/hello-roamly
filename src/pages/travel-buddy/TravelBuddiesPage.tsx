import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TravelBuddyCard from '@/components/features/travelBuddy/TravelBuddyCard';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useTravelBuddyList } from '@/hooks/travelBuddy/useTravelBuddyList';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { TRAVEL_BUDDY_BRAND } from '@/lib/config/travelBuddy';
import { paths } from '@/router/paths';
import type { TravelBuddyPost } from '@/types/domain/travelBuddy';
import { openTravelBuddyInterestChat } from '@/utils/travelBuddyChat';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';

export default function TravelBuddiesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTravelBuddyList();

  usePageSeo({
    title: `${TRAVEL_BUDDY_BRAND.name} — 蜗牛旅行`,
    description: TRAVEL_BUDDY_BRAND.tagline,
    path: paths.travelBuddies,
  });

  const handleInterest = useCallback(
    (post: TravelBuddyPost) => {
      openTravelBuddyInterestChat(post, navigate);
    },
    [navigate],
  );

  const items = data?.items ?? [];

  return (
    <MotionPage className="flex flex-col gap-4">
      <MotionBlock>
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{TRAVEL_BUDDY_BRAND.feedTitle}</h1>
            <p className="mt-1 text-sm text-slate-600">{TRAVEL_BUDDY_BRAND.feedSubtitle}</p>
          </div>
          <Link
            to={paths.travelBuddyNew}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            发布
          </Link>
        </header>
      </MotionBlock>

      {isLoading && (
        <MotionBlock>
          <p className="text-sm text-slate-500">加载结伴需求中…</p>
        </MotionBlock>
      )}

      {isError && (
        <MotionBlock>
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            加载失败
            <button
              type="button"
              onClick={() => void refetch()}
              className="ml-2 font-semibold underline"
            >
              重试
            </button>
          </div>
        </MotionBlock>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <MotionBlock>
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            {SNAIL_GLOBAL_COPY.emptyState.replace('轨迹', '结伴需求')}
          </p>
        </MotionBlock>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((post) => (
          <MotionBlock key={post.id}>
            <TravelBuddyCard post={post} onInterest={handleInterest} />
          </MotionBlock>
        ))}
      </div>
    </MotionPage>
  );
}
