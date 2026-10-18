import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TravelBuddyPublishForm from '@/components/features/travelBuddy/TravelBuddyPublishForm';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import {
  useCreateTravelBuddy,
} from '@/hooks/travelBuddy/useTravelBuddyList';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { TRAVEL_BUDDY_BRAND } from '@/lib/config/travelBuddy';
import { paths } from '@/router/paths';
import type { TravelBuddyNewPageState } from '@/types/router-state';
import '@/styles/holo-inner.css';

export default function TravelBuddyNewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as TravelBuddyNewPageState | null) ?? null;
  const createMutation = useCreateTravelBuddy();
  const [published, setPublished] = useState(false);

  usePageSeo({
    title: `${TRAVEL_BUDDY_BRAND.publishTitle} — 蜗牛旅行`,
    path: paths.travelBuddyNew,
  });

  return (
    <MotionPage className="holo-buddies flex flex-col gap-4">
      <MotionBlock>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="holo-buddies__back inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回
        </button>
      </MotionBlock>

      <MotionBlock>
        <header className="holo-buddies__panel rounded-xl border border-[#b7cdc4] bg-[#fffef6] p-5 shadow-none">
          <h1 className="holo-buddies__title text-lg font-bold">{TRAVEL_BUDDY_BRAND.publishTitle}</h1>
          <p className="holo-buddies__subtitle mt-1 text-sm">{TRAVEL_BUDDY_BRAND.tagline}</p>
        </header>
      </MotionBlock>

      {published ? (
        <MotionBlock>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
            <p className="mt-3 text-base font-semibold text-slate-900">需求已发布，状态：寻找中</p>
            <p className="mt-1 text-sm text-slate-600">感兴趣的蜗友会通过站内信联系你</p>
            <Link
              to={paths.travelBuddies}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              查看伸出触角信息流
            </Link>
          </div>
        </MotionBlock>
      ) : (
        <MotionBlock>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TravelBuddyPublishForm
              initialDestination={routeState?.destination ?? ''}
              isSubmitting={createMutation.isPending}
              onSubmit={async (payload) => {
                await createMutation.mutateAsync(payload);
                setPublished(true);
              }}
            />
          </div>
        </MotionBlock>
      )}
    </MotionPage>
  );
}
