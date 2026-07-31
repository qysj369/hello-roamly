import { Bot, Loader2, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TravelPlanResultDialog from '@/components/features/plans/TravelPlanResultDialog';
import { AsyncFeedback } from '@/components/ui';
import { useGenerateTravelPlan } from '@/hooks/ai/useGenerateTravelPlan';
import { getAiProviderDisplay } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { travelPlanDetailPath } from '@/router/paths';
import { buildHomePlannerTravelRequest } from '@/utils/mapTravelOptions';
import { cn } from '@/utils/cn';

const DAY_OPTIONS = [1, 2, 3, 5, 7] as const;

export default function HomeAiPlanner() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string>('');
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<string>('500');
  const {
    generate,
    retry,
    isGenerating,
    error,
    lastPlan,
    dialogOpen,
    closeDialog,
    clearError,
  } = useGenerateTravelPlan();

  const aiProvider = getAiProviderDisplay();
  const formDisabled = isGenerating;

  const handlePlan = useCallback(() => {
    clearError();
    const { prompt, options } = buildHomePlannerTravelRequest(destination, days, budget);
    generate(prompt, options).catch(() => undefined);
  }, [budget, clearError, days, destination, generate]);

  const handleRetry = useCallback(() => {
    retry().catch(() => undefined);
  }, [retry]);

  return (
    <>
      <section
        className="home-tech-panel relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900/90 p-5 text-white shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl"
        aria-busy={isGenerating}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl"
          aria-hidden
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
            <Bot className="h-3.5 w-3.5" aria-hidden />
            AI Trip Engine
          </p>
          <h3 className="mt-2 text-base font-semibold">一键 AI 穷游行程</h3>
          <p className="mt-1 text-xs text-indigo-100/80">
            {aiProvider === 'deepseek'
              ? '填写目的地与预算，一键生成 AI 旅行计划（上线模式）。'
              : aiProvider === 'unconfigured'
                ? '上线模式：请在 .env.local 配置 VITE_DEEPSEEK_API_KEY 后生成真实计划。'
                : isProductionAppMode()
                  ? '请配置 DeepSeek API Key。'
                  : '填写表单后本地生成演示计划；配置 DeepSeek Key 可启用真实 AI。'}
          </p>

          <div className="mt-4 space-y-3">
            <label className="block" htmlFor="ai-planner-destination">
              <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-100/90">
                Destination
              </span>
              <input
                id="ai-planner-destination"
                type="text"
                value={destination}
                disabled={formDisabled}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="例如：成都、西安"
                className="mt-1 block w-full rounded-xl border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-indigo-200/60 focus:border-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block" htmlFor="ai-planner-days">
                <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-100/90">
                  Days
                </span>
                <select
                  id="ai-planner-days"
                  value={days}
                  disabled={formDisabled}
                  onChange={(event) => setDays(Number(event.target.value))}
                  className="mt-1 block w-full rounded-xl border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {DAY_OPTIONS.map((d) => (
                    <option key={d} value={d} className="bg-slate-900">
                      {d} 天
                    </option>
                  ))}
                </select>
              </label>
              <label className="block" htmlFor="ai-planner-budget">
                <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-100/90">
                  Budget ¥
                </span>
                <input
                  id="ai-planner-budget"
                  type="number"
                  min={0}
                  step={50}
                  value={budget}
                  disabled={formDisabled}
                  onChange={(event) => setBudget(event.target.value)}
                  className="mt-1 block w-full rounded-xl border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:ring-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            </div>
          </div>

          <AsyncFeedback
            className="mt-3"
            variant="dark"
            isLoading={isGenerating}
            loadingMessage="正在生成旅行计划，请稍候…"
            error={error}
            onDismissError={clearError}
            onRetry={handleRetry}
          />

          <button
            type="button"
            onClick={handlePlan}
            disabled={formDisabled}
            className={cn(
              'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl',
              'bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-3 text-sm font-semibold text-slate-950',
              'shadow-[0_0_28px_rgba(34,211,238,0.35)] transition hover:brightness-110',
              'disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {isGenerating ? '正在生成计划…' : '生成穷游方案'}
          </button>
        </div>
      </section>

      <TravelPlanResultDialog
        open={dialogOpen}
        plan={lastPlan}
        onClose={closeDialog}
        confirmLabel="查看完整行程"
        onConfirm={() => {
          if (lastPlan) {
            navigate(travelPlanDetailPath(lastPlan.id));
          }
          closeDialog();
        }}
      />
    </>
  );
}
