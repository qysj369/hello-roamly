import { Loader2 } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import {
  AI_SNAIL_BUDGET_OPTIONS,
  AI_SNAIL_DAY_OPTIONS,
  AI_SNAIL_PREFERENCE_OPTIONS,
  type AiSnailBudgetRangeId,
  type AiSnailGuideStep,
  type AiSnailPreferenceId,
} from '@/types/domain/aiSnailGuide';
import { cn } from '@/utils/cn';

type AiSnailGuideStepPanelProps = {
  step: AiSnailGuideStep;
  preferences: AiSnailPreferenceId[];
  isGenerating: boolean;
  onSubmitDestination: (value: string) => void;
  onSubmitDays: (value: number) => void;
  onSubmitBudget: (value: AiSnailBudgetRangeId) => void;
  onTogglePreference: (id: AiSnailPreferenceId) => void;
  onGenerate: (preferences: AiSnailPreferenceId[]) => void;
  onReset: () => void;
  onOpenEditor?: () => void;
  hasDraft?: boolean;
};

function OptionButton({
  children,
  selected,
  onClick,
  disabled,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-xl border px-3 py-2 text-sm font-medium transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50',
      )}
    >
      {children}
    </button>
  );
}

export default function AiSnailGuideStepPanel({
  step,
  preferences,
  isGenerating,
  onSubmitDestination,
  onSubmitDays,
  onSubmitBudget,
  onTogglePreference,
  onGenerate,
  onOpenEditor,
  hasDraft,
}: AiSnailGuideStepPanelProps) {
  const [destinationDraft, setDestinationDraft] = useState('');
  const [customDays, setCustomDays] = useState('');

  function handleDestinationSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmitDestination(destinationDraft);
    setDestinationDraft('');
  }

  function handleCustomDaysSubmit(event: FormEvent) {
    event.preventDefault();
    const value = Number(customDays);
    if (Number.isFinite(value)) {
      onSubmitDays(value);
      setCustomDays('');
    }
  }

  if (step === 'generating') {
    return (
      <div className="flex items-center justify-center gap-2 border-t border-slate-200/80 bg-white px-4 py-5 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" aria-hidden />
        AI蜗牛正在生成结构化穷游攻略…
      </div>
    );
  }

  if (step === 'editor' || step === 'published') {
    return null;
  }

  if (hasDraft && onOpenEditor) {
    return (
      <div className="border-t border-slate-200/80 bg-white px-4 py-4">
        <button
          type="button"
          onClick={onOpenEditor}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        >
          打开攻略发布编辑器
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200/80 bg-white px-4 py-4">
      {step === 'destination' && (
        <form onSubmit={handleDestinationSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={destinationDraft}
            onChange={(event) => setDestinationDraft(event.target.value)}
            placeholder="例如：济南、大理、厦门"
            aria-label="目的地"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            type="submit"
            disabled={!destinationDraft.trim()}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            下一步
          </button>
        </form>
      )}

      {step === 'days' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {AI_SNAIL_DAY_OPTIONS.map((day) => (
              <OptionButton key={day} onClick={() => onSubmitDays(day)}>
                {day} 天
              </OptionButton>
            ))}
          </div>
          <form onSubmit={handleCustomDaysSubmit} className="flex gap-2">
            <input
              type="number"
              min={1}
              max={30}
              value={customDays}
              onChange={(event) => setCustomDays(event.target.value)}
              placeholder="自定义天数"
              aria-label="自定义天数"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={!customDays}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 disabled:opacity-50"
            >
              确定
            </button>
          </form>
        </div>
      )}

      {step === 'budget' && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AI_SNAIL_BUDGET_OPTIONS.map((option) => (
            <OptionButton key={option.id} onClick={() => onSubmitBudget(option.id)}>
              {option.label}
            </OptionButton>
          ))}
        </div>
      )}

      {step === 'preferences' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {AI_SNAIL_PREFERENCE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                selected={preferences.includes(option.id)}
                onClick={() => onTogglePreference(option.id)}
                disabled={isGenerating}
              >
                {option.label}
              </OptionButton>
            ))}
          </div>
          <button
            type="button"
            disabled={preferences.length === 0 || isGenerating}
            onClick={() => onGenerate(preferences)}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition hover:brightness-105 disabled:opacity-50"
          >
            开始生成攻略
          </button>
        </div>
      )}
    </div>
  );
}
