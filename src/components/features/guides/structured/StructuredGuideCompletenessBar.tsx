import { CheckCircle2, Circle } from 'lucide-react';
import type { StructuredGuideCompleteness } from '@/utils/structuredGuideCompleteness';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';
type StructuredGuideCompletenessBarProps = {
  completeness: StructuredGuideCompleteness;
  className?: string;
  /** 点击未完成项时跳转到对应编辑字段 */
  onItemClick?: (itemId: string) => void;
};

export default function StructuredGuideCompletenessBar({
  completeness,
  className,
  onItemClick,
}: StructuredGuideCompletenessBarProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">{SNAIL_UI_COPY.publishChecklist}</p>
        <p className="text-xs text-slate-500">
          {completeness.requiredDone}/{completeness.requiredTotal} 必填项 ·{' '}
          {completeness.progress}%
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            completeness.ready
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-emerald-400',
          )}
          style={{ width: `${completeness.progress}%` }}
        />
      </div>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {completeness.items.map((item) => {
          const canJump = Boolean(onItemClick && !item.done);
          const content = (
            <>
              {item.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span>
                {item.label}
                {item.required && !item.done && (
                  <span className="ml-1 text-amber-600">（必填）</span>
                )}
                {canJump && <span className="ml-1 text-emerald-600">→ 去填写</span>}
              </span>
            </>
          );

          return (
            <li key={item.id}>
              {canJump ? (
                <button
                  type="button"
                  onClick={() => onItemClick?.(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-left text-xs transition hover:bg-emerald-50',
                    'text-slate-600',
                  )}
                >
                  {content}
                </button>
              ) : (
                <div
                  className={cn(
                    'flex items-center gap-2 text-xs',
                    item.done ? 'text-emerald-800' : 'text-slate-500',
                  )}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
