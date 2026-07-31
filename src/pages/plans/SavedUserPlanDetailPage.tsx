import { ArrowLeft, Globe, Loader2, Lock, MapPin, Sparkles, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';
import SavedUserPlanManagePanel from '@/components/features/profile/SavedUserPlanManagePanel';
import SavedUserPlanShareControls from '@/components/features/profile/SavedUserPlanShareControls';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { useUserPlanDetail } from '@/hooks/api/useUserPlans';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useShareLandingTracking } from '@/hooks/share/useShareLandingTracking';
import { paths, profileSavedPlansPath } from '@/router/paths';
import { userPlanToConversationTurns } from '@/utils/userPlanView';
import { cn } from '@/utils/cn';

export default function SavedUserPlanDetailPage() {
  const { planId = '' } = useParams<{ planId: string }>();
  const { data, isLoading, error } = useUserPlanDetail(planId);
  const plan = data?.item;
  const turns = plan ? userPlanToConversationTurns(plan) : [];
  const isOwner = plan?.userId === DEMO_CURRENT_USER_ID;

  usePageSeo({
    title: plan ? `${plan.title} — 穷游方案` : '穷游方案',
    path: planId ? `${paths.savedPlans}/${planId}` : paths.savedPlans,
  });

  useShareLandingTracking({
    contentKind: 'saved_user_plan',
    contentId: planId,
  });

  const backHref = isOwner ? profileSavedPlansPath() : paths.discover;
  const backLabel = isOwner ? '返回我的方案' : '返回发现';

  return (
    <MotionPage className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-10">
      <MotionBlock>
        <Link
          to={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
      </MotionBlock>

      {isLoading ? (
        <MotionBlock>
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            加载方案中…
          </div>
        </MotionBlock>
      ) : null}

      {error || (!isLoading && !plan) ? (
        <MotionBlock>
          <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-10 text-center text-sm text-rose-700">
            方案不存在或无权查看
          </p>
        </MotionBlock>
      ) : null}

      {plan ? (
        <>
          <MotionBlock>
            <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-brand-50/80 to-violet-50/60 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-brand-700">
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wide">穷游方案</span>
                  </div>
                  <h1 className="mt-1 text-xl font-bold text-slate-900">{plan.title}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden />
                    <span>{plan.content.locationName}</span>
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
                    <SavedUserPlanShareControls plan={plan} variant="compact" />
                  )}
                </div>
              </div>
            </header>
          </MotionBlock>

          {isOwner ? (
            <MotionBlock>
              <SavedUserPlanManagePanel plan={plan} />
            </MotionBlock>
          ) : null}

          <MotionBlock>
            <div className="space-y-4">
              {turns.map((turn, index) => {
                const isUser = turn.role === 'user';
                return (
                  <section
                    key={turn.id}
                    className={cn(
                      'rounded-2xl border px-4 py-3 sm:px-5',
                      isUser
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-brand-100 bg-white shadow-sm',
                    )}
                  >
                    <p
                      className={cn(
                        'mb-2 flex items-center gap-1.5 text-xs font-semibold',
                        isUser ? 'text-slate-600' : 'text-brand-700',
                      )}
                    >
                      {isUser ? (
                        <>
                          <User className="h-3.5 w-3.5" aria-hidden />
                          追问
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                          {index === 0 ? '初版方案' : 'AI 更新方案'}
                        </>
                      )}
                    </p>
                    <AiChatMarkdown content={turn.content} className="text-[15px] leading-relaxed" />
                  </section>
                );
              })}
            </div>
          </MotionBlock>
        </>
      ) : null}
    </MotionPage>
  );
}
