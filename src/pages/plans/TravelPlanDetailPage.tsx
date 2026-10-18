import { ArrowLeft } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import TravelPlanDetailHeader from '@/components/features/plans/TravelPlanDetailHeader';
import TravelPlanDetailNav from '@/components/features/plans/TravelPlanDetailNav';
import TravelPlanItineraryTimeline from '@/components/features/plans/TravelPlanItineraryTimeline';
import TravelPlanDetailActions from '@/components/features/plans/TravelPlanDetailActions';
import TravelPlanPracticalInfo from '@/components/features/plans/TravelPlanPracticalInfo';
import TravelPlanOverview from '@/components/features/plans/TravelPlanOverview';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useTravelPlan } from '@/hooks';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useShareLandingTracking } from '@/hooks/share/useShareLandingTracking';
import { useTravelPlanJsonLd } from '@/hooks/browser/useTravelPlanJsonLd';
import { APP_NAME } from '@/lib/config/brand';
import { getAiProviderDisplay } from '@/lib/config/ai';
import { travelPlanPageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';

const TravelPlanRouteMap = lazy(
  () => import('@/components/features/plans/TravelPlanRouteMap'),
);

function PlanMapFallback() {
  return (
    <div
      className="mt-6 flex min-h-56 animate-pulse items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500"
      aria-busy="true"
      aria-label="地图加载中"
    >
      地图加载中…
    </div>
  );
}

export default function TravelPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const plan = useTravelPlan(planId);

  const pageSeo = useMemo(() => {
    if (plan && planId) {
      return travelPlanPageSeo(plan.title, planId, plan.tags[0]);
    }
    return {
      title: `旅行计划 — ${APP_NAME}`,
      path: planId ? `${paths.plans}/${encodeURIComponent(planId)}` : paths.plans,
    };
  }, [plan, planId]);

  usePageSeo(pageSeo);
  useTravelPlanJsonLd(plan, planId);
  useShareLandingTracking({ contentKind: 'travel_plan', contentId: planId });

  return (
    <MotionPage className="holo-plan-detail flex flex-col gap-4">
      <MotionBlock>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-base font-medium text-brand-600 hover:bg-brand-50 hover:text-brand-700 sm:min-h-0 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回
        </button>
      </MotionBlock>

      {!plan && (
        <MotionBlock>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">未找到该旅行计划</h2>
            <p className="mt-2 text-sm text-slate-600">计划可能已过期，或链接不正确。</p>
            <Link
              to={paths.home}
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              返回首页
            </Link>
          </section>
        </MotionBlock>
      )}

      {plan && (
        <MotionBlock>
          <article className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
              <div className="min-w-0">
                <TravelPlanDetailHeader plan={plan} />

                <TravelPlanDetailNav className="mt-4 lg:hidden" />

                <p className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 lg:text-base">
                  {plan.summary}
                </p>

                {getAiProviderDisplay() === 'mock' && (
                  <p className="mt-3 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    当前为<strong className="font-semibold">演示模式</strong>
                    生成的行程要点（已针对部分城市如济南优化）。在 `.env.local` 配置{' '}
                    <code className="rounded bg-white/80 px-1">VITE_DEEPSEEK_API_KEY</code>{' '}
                    并重新生成，可获得更细的 AI 逐条攻略。
                  </p>
                )}

                <TravelPlanOverview plan={plan} />

                <Suspense fallback={<PlanMapFallback />}>
                  <TravelPlanRouteMap plan={plan} />
                </Suspense>

                <TravelPlanItineraryTimeline plan={plan} expandFirstActivity />

                <TravelPlanPracticalInfo plan={plan} />
              </div>

              <aside className="mt-6 min-w-0 lg:mt-0 lg:sticky lg:top-[calc(var(--app-header-offset)+0.75rem)] lg:self-start">
                <TravelPlanDetailNav className="mt-0 hidden lg:flex" />
                <TravelPlanDetailActions plan={plan} className="mt-4" />
              </aside>
            </div>
          </article>
        </MotionBlock>
      )}
    </MotionPage>
  );
}
