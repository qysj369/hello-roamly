import { ArrowLeft, Loader2, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavedUserPlanListItem from '@/components/features/profile/SavedUserPlanListItem';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useUserPlans } from '@/hooks/api/useUserPlans';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { APP_NAME } from '@/lib/config/brand';
import { paths } from '@/router/paths';

export default function UserSavedPlansPage() {
  usePageSeo({
    title: `我的方案 — ${APP_NAME}`,
    path: paths.profilePlans,
  });

  const { data, isLoading, error } = useUserPlans();
  const items = data?.items ?? [];

  return (
    <MotionPage className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-8">
      <MotionBlock>
        <Link
          to={paths.profile}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回蜗居
        </Link>
      </MotionBlock>

      <MotionBlock>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-bold text-slate-900">我的方案</h1>
              <p className="mt-1 text-sm text-slate-600">
                保存自地图 AI 的漫行方案，含完整追问对话
              </p>
            </div>
          </div>
        </section>
      </MotionBlock>

      <MotionBlock>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            加载中…
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-8 text-center text-sm text-rose-700">
            加载失败，请刷新页面重试
          </p>
        ) : null}

        {!isLoading && !error && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
            <p className="mt-3 text-sm text-slate-600">还没有保存的方案</p>
            <Link
              to={paths.home}
              className="mt-4 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              去地图生成方案
            </Link>
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((plan) => (
              <li key={plan.id}>
                <SavedUserPlanListItem plan={plan} />
              </li>
            ))}
          </ul>
        ) : null}
      </MotionBlock>
    </MotionPage>
  );
}
