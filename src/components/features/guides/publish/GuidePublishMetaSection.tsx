import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';
import { FieldLabel, TextInput } from '@/components/features/guides/publish/guidePublishFields';

type GuidePublishMetaSectionProps = {
  draft: GuidePublishEditorDraft;
  onUpdateDraft: (patch: Partial<GuidePublishEditorDraft>) => void;
};

/** 攻略元信息（列表展示用，不属于宪法三卡） */
export default function GuidePublishMetaSection({ draft, onUpdateDraft }: GuidePublishMetaSectionProps) {
  return (
    <section
      id="sg-edit-basic"
      className="scroll-mt-24 rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5"
    >
      <h3 className="text-sm font-bold text-slate-900">攻略元信息</h3>
      <p className="mt-1 text-xs text-slate-500">标题与目的地会显示在攻略列表中</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="guide-title">攻略标题</FieldLabel>
          <TextInput
            id="guide-title"
            value={draft.title}
            onChange={(value) => onUpdateDraft({ title: value })}
            placeholder="例如：济南 3 天穷游攻略"
          />
        </div>
        <div>
          <FieldLabel htmlFor="guide-destination">目的地</FieldLabel>
          <TextInput
            id="guide-destination"
            value={draft.destination}
            onChange={(value) => onUpdateDraft({ destination: value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="guide-days">天数</FieldLabel>
          <TextInput
            id="guide-days"
            value={draft.days}
            onChange={(value) => onUpdateDraft({ days: value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="guide-budget">预算档位</FieldLabel>
          <TextInput
            id="guide-budget"
            value={draft.budgetLabel}
            onChange={(value) => onUpdateDraft({ budgetLabel: value })}
          />
        </div>
        <div>
          <FieldLabel htmlFor="guide-interests">兴趣标签</FieldLabel>
          <TextInput
            id="guide-interests"
            value={draft.interests}
            onChange={(value) => onUpdateDraft({ interests: value })}
            placeholder="美食、打卡、自然风光（用顿号分隔）"
          />
        </div>
      </div>
    </section>
  );
}
