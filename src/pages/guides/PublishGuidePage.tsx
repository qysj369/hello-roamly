import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandValueWhisper from '@/components/brand/BrandValueWhisper';
import SlimeTrailPublisher from '@/components/features/guides/slime-trail/SlimeTrailPublisher';
import PublishTravelBuddyCta from '@/components/features/travelBuddy/PublishTravelBuddyCta';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { guideDetailPath, paths } from '@/router/paths';
import type { PublishGuidePageState } from '@/types/router-state';
import {
  aiSnailGuideToEditorDraft,
  createEmptyGuidePublishDraft,
} from '@/utils/guidePublishDraft';
import '@/styles/brand-whisper.css';

export default function PublishGuidePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as PublishGuidePageState | null) ?? null;
  const [publishedGuideId, setPublishedGuideId] = useState<string | null>(null);

  const initialDraft = useMemo(() => {
    if (routeState?.editorDraft) {
      return routeState.editorDraft;
    }
    if (routeState?.aiGeneratedContent) {
      return aiSnailGuideToEditorDraft(routeState.aiGeneratedContent);
    }
    const days = routeState?.days ?? 3;
    const draft = createEmptyGuidePublishDraft(days);
    if (routeState?.destination) {
      return {
        ...draft,
        destination: routeState.destination,
        title: routeState.destination ? `${routeState.destination} 漫行攻略` : draft.title,
        days: String(routeState.days ?? days),
      };
    }
    return draft;
  }, [routeState]);

  usePageSeo({
    title: `发布攻略 — ${SLIME_TRAIL_PUBLISHER.title}`,
    path: paths.guidesPublish,
  });

  return (
    <MotionPage className="holo-guide-publish flex flex-col gap-4">
      <MotionBlock>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            返回
          </button>
          <Link
            to={paths.aiSnail}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            用 AI蜗牛 生成草稿
          </Link>
        </div>
      </MotionBlock>

      <MotionBlock>
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">{SLIME_TRAIL_PUBLISHER.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{SLIME_TRAIL_PUBLISHER.subtitle}</p>
          <p className="mt-2 text-xs text-slate-500">
            按宪法三卡填写：花费清单 · 行程流水账 · 蜗牛启示。支持从 AI 生成结果填入后审阅发布。
          </p>
        </header>
      </MotionBlock>

      <MotionBlock>
        <SlimeTrailPublisher
          initialDraft={initialDraft}
          aiGeneratedContent={routeState?.aiGeneratedContent ?? null}
          sourceGuideId={routeState?.sourceGuideId ?? routeState?.aiGeneratedContent?.id}
          publishedGuideId={publishedGuideId}
          isPublished={Boolean(publishedGuideId)}
          onPublished={(record) => {
            setPublishedGuideId(record.id);
          }}
        />
      </MotionBlock>

      {publishedGuideId && (
        <MotionBlock className="flex flex-col gap-3">
          <Link
            to={guideDetailPath(publishedGuideId)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            查看已发布攻略详情
          </Link>
          <PublishTravelBuddyCta />
        </MotionBlock>
      )}

      <MotionBlock>
        <BrandValueWhisper />
      </MotionBlock>
    </MotionPage>
  );
}
