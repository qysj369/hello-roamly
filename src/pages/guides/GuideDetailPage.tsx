import { ArrowLeft, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StructuredGuideAuthorMeta from '@/components/features/guides/structured/StructuredGuideAuthorMeta';
import StructuredGuideViewer from '@/components/features/guides/structured/StructuredGuideViewer';
import GuideShareControls from '@/components/features/guides/GuideShareControls';
import GuideTravelBuddyFab from '@/components/features/travelBuddy/GuideTravelBuddyFab';
import MotionLink from '@/components/motion/MotionLink';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useGuideDetail } from '@/hooks';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useShareLandingTracking } from '@/hooks/share/useShareLandingTracking';
import { APP_NAME } from '@/lib/config/brand';
import { guideDetailPageSeo } from '@/lib/seo';
import UserFacingErrorAlert from '@/components/error/UserFacingErrorAlert';
import { paths } from '@/router/paths';

function isStructuredGuideDetail(
  guide: NonNullable<ReturnType<typeof useGuideDetail>['data']>,
): boolean {
  return guide.kind === 'structured' && Boolean(guide.structured);
}

export default function GuideDetailPage() {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const { data: guide, isPending, isError, error, refetch } = useGuideDetail(guideId);

  const isStructured = guide ? isStructuredGuideDetail(guide) : false;
  const structured = guide?.structured;

  const pageSeo = guide && guideId
    ? guideDetailPageSeo(guide.city, guide.title, guideId, {
        budget: guide.budget,
        days: guide.days,
      })
    : {
        title: `攻略详情 — ${APP_NAME}`,
        path: guideId ? `${paths.guides}/${encodeURIComponent(guideId)}` : paths.guides,
      };

  usePageSeo(pageSeo);
  useShareLandingTracking({ contentKind: 'guide', contentId: guideId });

  return (
    <MotionPage className="holo-guide-detail relative flex flex-col gap-4">
      <MotionBlock>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回
        </button>
      </MotionBlock>

      {isPending && (
        <MotionBlock>
          <div
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-busy="true"
            aria-label="加载攻略"
          >
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-6 w-3/4 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
          </div>
        </MotionBlock>
      )}

      {isError && !isPending && (
        <MotionBlock>
          <section className="rounded-2xl border border-red-100 bg-red-50/80 p-6 shadow-sm">
            <UserFacingErrorAlert
              error={error}
              context="guide"
              onRetry={() => {
                void refetch();
              }}
            />
            <Link
              to={paths.guides}
              className="mt-4 inline-flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              返回攻略列表
            </Link>
          </section>
        </MotionBlock>
      )}

      {guide && !isPending && isStructured && structured && (
        <>
          <MotionBlock>
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {guide.authorId && guide.publishedAt && (
                <StructuredGuideAuthorMeta
                  authorId={guide.authorId}
                  publishedAt={guide.publishedAt}
                  aiAssisted={guide.aiAssisted}
                  className="mb-5"
                />
              )}
              <StructuredGuideViewer guide={structured} variant="default" />
            </article>
          </MotionBlock>

          {guide.tags.length > 0 && (
            <MotionBlock>
              <ul className="flex flex-wrap gap-2 px-1">
                {guide.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </MotionBlock>
          )}

          <MotionBlock>
            <div className="flex flex-col gap-3">
              <GuideShareControls
                guide={guide}
                variant="primary"
                className="justify-stretch sm:justify-start"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <MotionLink
                  to={paths.home}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  在地图中查看
                </MotionLink>
                <Link
                  to={paths.guides}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  更多攻略
                </Link>
              </div>
            </div>
          </MotionBlock>
        </>
      )}

      {guide && !isPending && !isStructured && (
        <>
          <MotionBlock>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                {guide.city}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-snug text-slate-900">{guide.title}</h2>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">预算参考</dt>
                  <dd className="mt-0.5 font-semibold text-slate-900">{guide.budget}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">行程天数</dt>
                  <dd className="mt-0.5 font-semibold text-slate-900">{guide.days}</dd>
                </div>
              </dl>

              <ul className="mt-4 flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          </MotionBlock>

          <MotionBlock>
            <div className="flex flex-col gap-3">
              <GuideShareControls
                guide={guide}
                variant="primary"
                className="justify-stretch sm:justify-start"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <MotionLink
                  to={paths.home}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <MapPin className="h-4 w-4" aria-hidden />
                  在地图中查看
                </MotionLink>
                <Link
                  to={paths.guides}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  更多攻略
                </Link>
              </div>
            </div>
          </MotionBlock>
        </>
      )}

      {guide && !isPending && (
        <GuideTravelBuddyFab destination={guide.city || guide.title} />
      )}
    </MotionPage>
  );
}
