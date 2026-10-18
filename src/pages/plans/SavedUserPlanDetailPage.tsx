import { ArrowLeft, Globe, Loader2, Lock, MapPin, Sparkles } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import UserFacingErrorAlert from '@/components/error/UserFacingErrorAlert';
import SavedUserPlanManagePanel from '@/components/features/profile/SavedUserPlanManagePanel';
import SavedUserPlanShareItinerary from '@/components/features/profile/SavedUserPlanShareItinerary';
import SavedUserPlanShareControls from '@/components/features/profile/SavedUserPlanShareControls';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { useUserPlanDetail } from '@/hooks/api/useUserPlans';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useShareLandingTracking } from '@/hooks/share/useShareLandingTracking';
import { sharePlanHeaderMeta } from '@/lib/home/sharePlanOutline';
import { searchPlanFromUserPlan, searchPlanGuideText } from '@/lib/home/searchPlanSession';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { FetchUserPlanDetailApiError } from '@/services/user/api/fetchUserPlanById';
import { SHARE_LINK_PARAMS } from '@/lib/share/analytics/shareLink';
import { paths, profileSavedPlansPath } from '@/router/paths';
import { cn } from '@/utils/cn';

export default function SavedUserPlanDetailPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const [searchParams] = useSearchParams();
  const { data, isLoading, error, refetch } = useUserPlanDetail(planId);
  const plan = data?.item;
  const structuredPlan = plan ? searchPlanFromUserPlan(plan) : null;
  const startRemix = useTravelAgentStore((state) => state.startRemix);
  const guideText = plan ? searchPlanGuideText(plan) : '';
  const isShareLanding = searchParams.get(SHARE_LINK_PARAMS.from) === SHARE_LINK_PARAMS.fromShare;
  const isOwner = Boolean(plan?.userId === DEMO_CURRENT_USER_ID && !isShareLanding);
  const notFound = error instanceof FetchUserPlanDetailApiError && error.status === 404;

  usePageSeo({
    title: plan ? `${plan.title} — 漫行方案` : '漫行方案',
    path: planId ? `${paths.savedPlans}/${planId}` : paths.savedPlans,
  });

  useShareLandingTracking({
    contentKind: 'saved_user_plan',
    contentId: planId,
  });

  const backHref = isOwner ? profileSavedPlansPath() : paths.discover;
  const backLabel = isShareLanding ? '返回首页' : isOwner ? '返回我的方案' : '返回发现';

  return (
    <div className="holo-plan-detail mx-auto flex w-full max-w-xl flex-col gap-4 pb-10">
      <Link
        to={isShareLanding ? paths.home : backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </Link>

      {isLoading && !plan ? (
        <div className="holo-plan-detail__loading" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>正在加载完整行程…</span>
          <div className="holo-plan-detail__skeleton" aria-hidden>
            <div className="holo-plan-detail__skeleton-card holo-plan-detail__skeleton-card--title" />
            <div className="holo-plan-detail__skeleton-card" />
            <div className="holo-plan-detail__skeleton-card" />
            <div className="holo-plan-detail__skeleton-card" />
          </div>
        </div>
      ) : null}

      {error && !plan ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-8">
          {notFound ? (
            <p className="text-center text-sm text-rose-700">方案不存在或无权查看</p>
          ) : (
            <UserFacingErrorAlert
              error={error}
              title="行程加载失败"
              fallbackMessage="网络异常，完整攻略暂时没打开。请检查网络后重试。"
              retryLabel="重新加载"
              onRetry={() => {
                void refetch();
              }}
            />
          )}
        </div>
      ) : null}

      {!isLoading && !error && !plan ? (
        <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-10 text-center text-sm text-rose-700">
          方案不存在或无权查看
        </p>
      ) : null}

      {plan ? (
        <>
          <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50/80 to-[#fffef6] p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-brand-700">
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wide">行程攻略</span>
                </div>
                <h1 className="mt-1 text-xl font-bold text-slate-900">{plan.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                  <span>
                    {structuredPlan ? sharePlanHeaderMeta(structuredPlan) : plan.content.locationName}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                    plan.isPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {plan.isPublic ? (
                    <>
                      <Globe className="h-3.5 w-3.5" aria-hidden />
                      公开
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                      私密
                    </>
                  )}
                </span>
                {(isOwner || plan.isPublic) && (
                  <SavedUserPlanShareControls
                    plan={plan}
                    variant="compact"
                    hideInbox={isShareLanding}
                  />
                )}
                {structuredPlan ? (
                  <button
                    type="button"
                    className="travel-agent-remix"
                    onClick={() => startRemix(structuredPlan, plan.title)}
                  >
                    用AI改成我的
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          {structuredPlan ? (
            <SavedUserPlanShareItinerary plan={structuredPlan} />
          ) : guideText ? (
            <article className="holo-plan-detail__guide" aria-label="行程攻略">
              <h2 className="holo-plan-detail__guide-title">行程攻略</h2>
              <pre className="holo-plan-detail__guide-body">{guideText}</pre>
            </article>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-600">
              这份方案还没有行程正文。请让分享的人重新打开分享图后再扫一次。
            </p>
          )}

          {isOwner ? <SavedUserPlanManagePanel plan={plan} /> : null}
        </>
      ) : null}
    </div>
  );
}
