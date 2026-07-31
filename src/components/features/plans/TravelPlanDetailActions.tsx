import { Copy, FileDown, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { useTravelPlanDetailActions } from '@/hooks/plans/useTravelPlanDetailActions';
import type { PlanActionFeedback } from '@/hooks/plans/useTravelPlanDetailActions';
import { getPlanDestination, getPlanDaysLabel, getPlanTotalCostLabel } from '@/utils/travelPlanView';
import { cn } from '@/utils/cn';

export type TravelPlanDetailActionsProps = {
  plan: TravelPlan;
  className?: string;
  /** 详情页大卡片 vs 弹窗工具栏 */
  variant?: 'panel' | 'toolbar';
};

type ActionButtonProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent';
  feedback?: PlanActionFeedback;
  onClick: () => void;
};

function PanelActionButton({
  label,
  hint,
  icon: Icon,
  variant,
  feedback = 'idle',
  onClick,
}: ActionButtonProps) {
  const isSuccess = feedback === 'success';
  const isError = feedback === 'error';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-2 rounded-xl border px-4 py-3.5 text-left transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        variant === 'primary' &&
          'border-brand-200 bg-brand-600 text-white shadow-sm hover:bg-brand-700',
        variant === 'secondary' &&
          'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
        variant === 'accent' &&
          'border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-slate-900 hover:from-violet-100 hover:to-fuchsia-100',
        isSuccess && variant === 'primary' && 'border-emerald-300 bg-emerald-600 hover:bg-emerald-700',
        isSuccess && variant === 'secondary' && 'border-emerald-200 bg-emerald-50',
        isError && variant === 'primary' && 'border-red-300 bg-red-600 hover:bg-red-700',
        isError && variant === 'secondary' && 'border-red-200 bg-red-50',
      )}
      aria-label={hint}
    >
      <span
        className={cn(
          'inline-flex items-center gap-2 text-sm font-semibold',
          variant === 'primary' && !isError && 'text-white',
          variant === 'secondary' && isError && 'text-red-700',
          variant === 'secondary' && isSuccess && 'text-emerald-800',
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            variant === 'primary' ? 'text-white/90' : 'text-slate-600',
            variant === 'accent' && 'text-violet-600',
          )}
          aria-hidden
        />
        {label}
      </span>
      <span
        className={cn(
          'text-xs leading-relaxed',
          variant === 'primary' ? 'text-white/85' : 'text-slate-500',
        )}
      >
        {hint}
      </span>
    </button>
  );
}

type ToolbarActionButtonProps = {
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: 'brand' | 'slate' | 'violet';
  feedback?: PlanActionFeedback;
  onClick: () => void;
};

function ToolbarActionButton({
  label,
  hint,
  icon: Icon,
  tone,
  feedback = 'idle',
  onClick,
}: ToolbarActionButtonProps) {
  const isSuccess = feedback === 'success';
  const isError = feedback === 'error';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500',
        tone === 'brand' && 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100',
        tone === 'slate' && 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        tone === 'violet' && 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100',
        isSuccess && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        isError && 'border-red-200 bg-red-50 text-red-700',
      )}
      aria-label={hint}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

/** 计划行动：复制行程、导出 PDF、寻找旅伴 */
export default function TravelPlanDetailActions({
  plan,
  className,
  variant = 'panel',
}: TravelPlanDetailActionsProps) {
  const {
    copyFeedback,
    pdfFeedback,
    copyLabel,
    pdfLabel,
    copyShortLabel,
    pdfShortLabel,
    handleCopyClick,
    handlePdf,
    handleCompanion,
  } = useTravelPlanDetailActions(plan);

  if (variant === 'toolbar') {
    return (
      <div className={cn('space-y-2', className)} role="group" aria-label="计划行动">
        <div className="flex gap-2">
          <ToolbarActionButton
            label={copyShortLabel}
            hint="复制完整行程文本"
            icon={Copy}
            tone="brand"
            feedback={copyFeedback}
            onClick={handleCopyClick}
          />
          <ToolbarActionButton
            label={pdfShortLabel}
            hint="导出 PDF（浏览器打印）"
            icon={FileDown}
            tone="slate"
            feedback={pdfFeedback}
            onClick={handlePdf}
          />
          <ToolbarActionButton
            label="旅伴"
            hint="寻找同频旅伴"
            icon={Users}
            tone="violet"
            onClick={handleCompanion}
          />
        </div>
        <p className="text-center text-[10px] text-slate-400">导出 PDF 需允许弹窗</p>
      </div>
    );
  }

  const destination = getPlanDestination(plan);

  return (
    <section
      className={cn(
        'mt-8 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white shadow-sm',
        className,
      )}
      aria-labelledby="travel-plan-actions-title"
    >
      <div className="border-b border-slate-200/80 bg-white/80 px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-600">
          Next step
        </p>
        <h2 id="travel-plan-actions-title" className="mt-1 text-base font-semibold text-slate-900">
          行动
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {destination} · {getPlanDaysLabel(plan)} · {getPlanTotalCostLabel(plan)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
        <PanelActionButton
          label={copyLabel}
          hint="完整文本，可粘贴到备忘录或聊天"
          icon={Copy}
          variant="primary"
          feedback={copyFeedback}
          onClick={handleCopyClick}
        />
        <PanelActionButton
          label={pdfLabel}
          hint="打开打印页，选择「另存为 PDF」"
          icon={FileDown}
          variant="secondary"
          feedback={pdfFeedback}
          onClick={handlePdf}
        />
        <PanelActionButton
          label="寻找旅伴"
          hint="按目的地匹配攻略与同频出行"
          icon={Users}
          variant="accent"
          onClick={handleCompanion}
        />
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-center text-xs text-slate-400 sm:px-6">
        导出 PDF 需允许浏览器弹窗；若被拦截，请在地址栏开启后重试
      </p>
    </section>
  );
}
