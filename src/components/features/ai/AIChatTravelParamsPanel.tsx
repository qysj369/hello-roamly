import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { AsyncFeedback } from '@/components/ui';
import type { AiTravelParams, TravelInterest, TravelPace } from '@/types/domain/aiTravelParams';
import {
  BUDGET_RANGE_LIMITS,
  TRAVEL_DAY_OPTIONS,
  TRAVEL_INTEREST_OPTIONS,
  TRAVEL_PACE_OPTIONS,
} from '@/types/domain/aiTravelParams';
import { cn } from '@/utils/cn';

type AIChatTravelParamsPanelProps = {
  params: AiTravelParams;
  isOpen: boolean;
  onToggle: () => void;
  onBudgetMinChange: (value: number) => void;
  onBudgetMaxChange: (value: number) => void;
  onDaysChange: (days: number) => void;
  onPaceChange: (pace: TravelPace) => void;
  onToggleInterest: (interest: TravelInterest) => void;
  onReset: () => void;
  onGeneratePlan?: () => void;
  isGeneratingPlan?: boolean;
  isChatLoading?: boolean;
  planError?: string | null;
  onDismissPlanError?: () => void;
  onRetryPlan?: () => void;
  className?: string;
};

function formatBudget(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(value % 10000 === 0 ? 0 : 1)}万`;
  }
  return `¥${value.toLocaleString('zh-CN')}`;
}

export default function AIChatTravelParamsPanel({
  params,
  isOpen,
  onToggle,
  onBudgetMinChange,
  onBudgetMaxChange,
  onDaysChange,
  onPaceChange,
  onToggleInterest,
  onReset,
  onGeneratePlan,
  isGeneratingPlan = false,
  isChatLoading = false,
  planError,
  onDismissPlanError,
  onRetryPlan,
  className,
}: AIChatTravelParamsPanelProps) {
  const panelBusy = isGeneratingPlan || isChatLoading;
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('relative flex shrink-0', className)}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'absolute -left-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-700 lg:hidden',
        )}
        aria-expanded={isOpen}
        aria-controls="ai-travel-params-panel"
        aria-label={isOpen ? '收起旅行参数' : '展开旅行参数'}
      >
        <ChevronRight
          className={cn('h-4 w-4 transition', isOpen && 'rotate-180')}
          aria-hidden
        />
      </button>

      <motion.aside
        id="ai-travel-params-panel"
        className={cn(
          'flex min-h-0 flex-col overflow-hidden border-slate-200/90 bg-white/90',
          'border-t lg:border-l lg:border-t-0',
          isOpen ? 'w-full lg:w-72' : 'w-0 border-0 lg:w-0',
        )}
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.22 }}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <div className="flex h-full min-h-0 w-full flex-col lg:w-72">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Params
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">旅行参数</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle}
                className="hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:inline-flex"
                aria-label="收起面板"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
              <section>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800">预算范围</p>
                  <span className="font-mono text-[10px] text-brand-700">
                    {formatBudget(params.budgetMin)} – {formatBudget(params.budgetMax)}
                  </span>
                </div>
                <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <div role="group" aria-labelledby="budget-min-label">
                    <p id="budget-min-label" className="text-[10px] font-medium text-slate-500">
                      最低预算
                    </p>
                    <input
                      type="range"
                      aria-labelledby="budget-min-label"
                      min={BUDGET_RANGE_LIMITS.min}
                      max={BUDGET_RANGE_LIMITS.max}
                      step={BUDGET_RANGE_LIMITS.step}
                      value={params.budgetMin}
                      onChange={(event) => onBudgetMinChange(Number(event.target.value))}
                      className="mt-1.5 block h-1.5 w-full cursor-pointer accent-brand-600"
                    />
                  </div>
                  <div role="group" aria-labelledby="budget-max-label">
                    <p id="budget-max-label" className="text-[10px] font-medium text-slate-500">
                      最高预算
                    </p>
                    <input
                      type="range"
                      aria-labelledby="budget-max-label"
                      min={BUDGET_RANGE_LIMITS.min}
                      max={BUDGET_RANGE_LIMITS.max}
                      step={BUDGET_RANGE_LIMITS.step}
                      value={params.budgetMax}
                      onChange={(event) => onBudgetMaxChange(Number(event.target.value))}
                      className="mt-1.5 block h-1.5 w-full cursor-pointer accent-violet-600"
                    />
                  </div>
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold text-slate-800">旅行天数</p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="旅行天数">
                  {TRAVEL_DAY_OPTIONS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onDaysChange(day)}
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                        params.days === day
                          ? 'border-brand-300 bg-brand-50 text-brand-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200',
                      )}
                      aria-pressed={params.days === day}
                    >
                      {day} 天
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold text-slate-800">兴趣标签</p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="兴趣标签多选">
                  {TRAVEL_INTEREST_OPTIONS.map((option) => {
                    const selected = params.interests.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onToggleInterest(option.id)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                          selected
                            ? 'border-violet-300 bg-violet-50 text-violet-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
                        )}
                        aria-pressed={selected}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold text-slate-800">旅行节奏</p>
                <div className="space-y-1.5" role="radiogroup" aria-label="旅行节奏">
                  {TRAVEL_PACE_OPTIONS.map((option) => {
                    const inputId = `travel-pace-${option.id}`;
                    return (
                      <label
                        key={option.id}
                        htmlFor={inputId}
                        className={cn(
                          'flex cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2 transition',
                          params.pace === option.id
                            ? 'border-brand-300 bg-brand-50/80'
                            : 'border-slate-200 bg-white hover:border-brand-200',
                        )}
                      >
                        <input
                          id={inputId}
                          type="radio"
                          name="travel-pace"
                          value={option.id}
                          checked={params.pace === option.id}
                          onChange={() => onPaceChange(option.id)}
                          className="mt-0.5 border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-800">
                            {option.label}
                          </span>
                          <span className="block text-[10px] text-slate-500">{option.hint}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="shrink-0 space-y-2 border-t border-slate-200/80 p-3">
              <AsyncFeedback
                isLoading={isGeneratingPlan}
                loadingMessage="正在生成计划卡片…"
                error={planError}
                onDismissError={onDismissPlanError}
                onRetry={onRetryPlan}
              />
              {onGeneratePlan && (
                <button
                  type="button"
                  onClick={onGeneratePlan}
                  disabled={panelBusy}
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white',
                    'bg-gradient-to-r from-brand-500 to-violet-600 shadow-sm transition hover:brightness-110',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  )}
                >
                  {isGeneratingPlan ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {isGeneratingPlan ? '生成中…' : '生成计划卡片'}
                </button>
              )}
              <button
                type="button"
                onClick={onReset}
                disabled={panelBusy}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                恢复默认参数
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    </div>
  );
}
