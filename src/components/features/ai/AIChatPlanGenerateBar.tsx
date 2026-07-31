import { Loader2, Sparkles } from 'lucide-react';
import { isProductionAppMode } from '@/lib/config/appMode';
import { cn } from '@/utils/cn';

type AIChatPlanGenerateBarProps = {
  destination?: string;
  isBusy: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
};

export default function AIChatPlanGenerateBar({
  destination,
  isBusy,
  isGenerating,
  onGenerate,
}: AIChatPlanGenerateBarProps) {
  return (
    <div className="border-t border-slate-200/80 bg-white/95 px-3 py-2">
      <p className="mb-2 text-[11px] text-slate-600">
        {destination
          ? `目的地：${destination} · 点下面按钮生成完整行程卡片（可滑动查看）`
          : '点下面按钮生成完整行程卡片（弹窗可上下滑动）'}
      </p>
      <button
        type="button"
        onClick={onGenerate}
        disabled={isBusy}
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white',
          'bg-gradient-to-r from-brand-500 to-violet-600 shadow-sm hover:brightness-110',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        {isGenerating ? '正在生成计划…' : '生成计划卡片'}
      </button>
    </div>
  );
}
