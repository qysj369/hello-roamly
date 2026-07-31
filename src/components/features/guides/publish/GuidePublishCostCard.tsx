import { STRUCTURED_GUIDE_FORM_CARDS, GUIDE_PUBLISH_COST_FIELDS } from '@/lib/guides/structuredGuideFormSchema';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import GuidePublishConstitutionCard from '@/components/features/guides/publish/GuidePublishConstitutionCard';
import { TextArea, TextInput } from '@/components/features/guides/publish/guidePublishFields';
import { recalculateCostTotal } from '@/utils/guidePublishDraft';

type GuidePublishCostCardProps = {
  draft: GuidePublishEditorDraft;
  onUpdateCostItem: (
    key: keyof GuidePublishEditorDraft['costBreakdown'],
    patch: Partial<GuidePublishEditorDraft['costBreakdown']['food']>,
  ) => void;
};

const cardMeta = STRUCTURED_GUIDE_FORM_CARDS[0];

/** 卡1：花费清单 — 表格化输入，分项修改后自动加总 */
export default function GuidePublishCostCard({ draft, onUpdateCostItem }: GuidePublishCostCardProps) {
  const autoTotal = recalculateCostTotal(draft);

  return (
    <GuidePublishConstitutionCard
      cardNumber={cardMeta.card}
      id={cardMeta.editorId}
      title={cardMeta.title}
      subtitle={cardMeta.subtitle}
    >
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2.5 font-semibold">分项</th>
              <th className="w-28 px-3 py-2.5 font-semibold">金额（元）</th>
              <th className="px-3 py-2.5 font-semibold">节省技巧（每行一条）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {GUIDE_PUBLISH_COST_FIELDS.map((field) => {
              const item = draft.costBreakdown[field.key];
              return (
                <tr key={field.key} className="align-top">
                  <td className="px-3 py-3 font-medium text-slate-800">{field.label}</td>
                  <td className="px-3 py-3">
                    <TextInput
                      id={`cost-${field.key}-amount`}
                      type="number"
                      value={item.amount}
                      onChange={(value) => onUpdateCostItem(field.key, { amount: value })}
                      placeholder="0"
                      className="min-w-[5rem]"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <TextArea
                      id={`cost-${field.key}-tips`}
                      value={item.savingTips}
                      onChange={(value) => onUpdateCostItem(field.key, { savingTips: value })}
                      rows={2}
                      placeholder="例如：买地铁日票更划算"
                    />
                  </td>
                </tr>
              );
            })}
            <tr className="bg-emerald-50/70 font-semibold">
              <td className="px-3 py-3 text-slate-900">总计</td>
              <td className="px-3 py-3">
                <TextInput
                  id="guide-total"
                  value={draft.costBreakdown.total || autoTotal}
                  readOnly
                  className="font-bold"
                />
              </td>
              <td className="px-3 py-3 text-xs font-normal text-slate-500">
                根据上方分项自动加总 · 预算档位 {draft.budgetLabel || '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </GuidePublishConstitutionCard>
  );
}
