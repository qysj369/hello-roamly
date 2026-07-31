import SlimeTrailPublisher from '@/components/features/guides/slime-trail/SlimeTrailPublisher';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';

type AiSnailGuidePublishSectionProps = {
  initialDraft: GuidePublishEditorDraft;
  aiGeneratedContent?: AiSnailGuideResult | null;
  sourceGuideId?: string;
  publishedGuideId: string | null;
  isPublished: boolean;
  onPublished: (guideId: string) => void;
};

/** @deprecated 使用 SlimeTrailPublisher */
export default function AiSnailGuidePublishSection({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  publishedGuideId,
  isPublished,
  onPublished,
}: AiSnailGuidePublishSectionProps) {
  return (
    <SlimeTrailPublisher
      initialDraft={initialDraft}
      aiGeneratedContent={aiGeneratedContent}
      sourceGuideId={sourceGuideId}
      publishedGuideId={publishedGuideId}
      isPublished={isPublished}
      onPublished={(record) => onPublished(record.id)}
      className="space-y-3"
    />
  );
}
