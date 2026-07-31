import {
  GUIDE_PUBLISH_INSIGHT_FIELDS,
  STRUCTURED_GUIDE_FORM_CARDS,
} from '@/lib/guides/structuredGuideFormSchema';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import GuidePublishConstitutionCard from '@/components/features/guides/publish/GuidePublishConstitutionCard';
import { FieldLabel, TextArea } from '@/components/features/guides/publish/guidePublishFields';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
type GuidePublishInsightsCardProps = {
  draft: GuidePublishEditorDraft;
  onUpdateSnailInsights: (
    patch: Partial<GuidePublishEditorDraft['snailInsights']>,
  ) => void;
};

const cardMeta = STRUCTURED_GUIDE_FORM_CARDS[2];
const fields = GUIDE_PUBLISH_INSIGHT_FIELDS;

/** 卡3：蜗牛启示 — 避坑指南 + 宝藏发现 */
export default function GuidePublishInsightsCard({
  draft,
  onUpdateSnailInsights,
}: GuidePublishInsightsCardProps) {
  return (
    <GuidePublishConstitutionCard
      cardNumber={cardMeta.card}
      id={cardMeta.editorId}
      title={cardMeta.title}
      titleSlangId={cardMeta.titleSlangId}
      subtitle={cardMeta.subtitle}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
          <FieldLabel htmlFor="insight-regrets">
            <SnailSlangTerm id={fields.regrets.slangId} />
          </FieldLabel>
          <TextArea
            id="insight-regrets"
            value={draft.snailInsights.regrets}
            onChange={(value) => onUpdateSnailInsights({ regrets: value })}
            rows={6}
            placeholder={SNAIL_UI_COPY.insightRegretsPlaceholder}
          />
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
          <FieldLabel htmlFor="insight-recommendations">
            <SnailSlangTerm id={fields.recommendations.slangId} />
          </FieldLabel>
          <TextArea
            id="insight-recommendations"
            value={draft.snailInsights.recommendations}
            onChange={(value) => onUpdateSnailInsights({ recommendations: value })}
            rows={6}
            placeholder={SNAIL_UI_COPY.insightTreasurePlaceholder}
          />        </div>
      </div>
    </GuidePublishConstitutionCard>
  );
}
