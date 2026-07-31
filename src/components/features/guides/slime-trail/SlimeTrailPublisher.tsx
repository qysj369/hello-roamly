import StructuredGuidePublishStudio from '@/components/features/guides/structured/StructuredGuidePublishStudio';
import { useGuidePublishEditor } from '@/hooks/guides/useGuidePublishEditor';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft, PublishedGuideRecord } from '@/types/domain/guidePublish';
import { Link } from 'react-router-dom';
import { guideDetailPath, paths } from '@/router/paths';

export type SlimeTrailPublisherProps = {
  initialDraft: GuidePublishEditorDraft;
  /** AI 蜗牛生成结果；传入时自动填入并与预览/发布格式对齐 */
  aiGeneratedContent?: AiSnailGuideResult | null;
  sourceGuideId?: string;
  publishedGuideId?: string | null;
  isPublished?: boolean;
  onPublished?: (record: PublishedGuideRecord) => void;
  className?: string;
};

/**
 * 「留下黏液轨迹」发布器 — 承接 AI 生成草稿，编辑后与前台 StructuredGuideViewer 完全同构
 */
export default function SlimeTrailPublisher({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  publishedGuideId = null,
  isPublished = false,
  onPublished,
  className,
}: SlimeTrailPublisherProps) {
  const editor = useGuidePublishEditor({
    initialDraft,
    aiGeneratedContent,
    sourceGuideId,
    onPublished,
  });

  return (
    <div className={className}>
      {isPublished && publishedGuideId && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">{SLIME_TRAIL_PUBLISHER.publishedTitle}</p>
          <p className="mt-1 text-xs">
            {SLIME_TRAIL_PUBLISHER.publishedHint}
            <Link
              to={guideDetailPath(publishedGuideId)}
              className="ml-1 font-semibold underline hover:text-emerald-700"
            >
              查看前台展示
            </Link>
            {' · '}
            <Link to={paths.guides} className="font-semibold underline hover:text-emerald-700">
              攻略列表
            </Link>
          </p>
        </div>
      )}

      <StructuredGuidePublishStudio
        draft={editor.draft}
        filledFromAi={editor.filledFromAi}
        isPublishing={editor.isPublishing}
        error={editor.error}
        previewSourceId={sourceGuideId}
        onUpdateDraft={editor.updateDraft}
        onUpdateCostItem={editor.updateCostItem}
        onUpdateDailyJournal={editor.updateDailyJournal}
        onUpdateDailyExpense={editor.updateDailyExpense}
        onAddDailyExpense={editor.addDailyExpense}
        onRemoveDailyExpense={editor.removeDailyExpense}
        onUpdateSnailInsights={editor.updateSnailInsights}
        onPublish={() => {
          void editor.publish();
        }}
      />
    </div>
  );
}
