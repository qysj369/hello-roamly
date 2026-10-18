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
      className={cn('holo-ai-snail__option', selected && 'is-selected')}
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
      <div className="holo-ai-snail__footer flex items-center justify-center gap-2 px-4 py-5 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        AI蜗牛正在生成结构化漫行攻略…
      </div>
    );
  }

  if (step === 'editor' || step === 'published') {
    return null;
  }

  if (hasDraft && onOpenEditor) {
    return (
      <div className="holo-ai-snail__footer px-4 py-4">
        <button type="button" onClick={onOpenEditor} className="holo-ai-snail__primary-btn w-full">
          打开攻略发布编辑器
        </button>
      </div>
    );
  }

  return (
    <div className="holo-ai-snail__footer px-4 py-4">
      {step === 'destination' && (
        <form onSubmit={handleDestinationSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={destinationDraft}
            onChange={(event) => setDestinationDraft(event.target.value)}
            placeholder="例如：济南、大理、厦门"
            aria-label="目的地"
            className="holo-ai-snail__input min-w-0 flex-1"
          />
          <button
            type="submit"
            disabled={!destinationDraft.trim()}
            className="holo-ai-snail__primary-btn disabled:opacity-50"
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
              className="holo-ai-snail__input min-w-0 flex-1"
            />
            <button
              type="submit"
              disabled={!customDays}
              className="holo-ai-snail__secondary-btn disabled:opacity-50"
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
            className="holo-ai-snail__primary-btn w-full disabled:opacity-50"
          >
            开始生成攻略
          </button>
        </div>
      )}
    </div>
  );
}
