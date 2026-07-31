import { AlertCircle, Loader2, RotateCcw, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AsyncFeedbackProps = {
  /** 进行中的提示文案；传入 isLoading 时显示 */
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onDismissError?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  /** 首页深色面板 vs AI 页浅色 */
  variant?: 'light' | 'dark';
};

export default function AsyncFeedback({
  isLoading = false,
  loadingMessage = '处理中…',
  error,
  onDismissError,
  onRetry,
  retryLabel = '重试',
  className,
  variant = 'light',
}: AsyncFeedbackProps) {
  const isDark = variant === 'dark';

  if (!isLoading && !error) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)} aria-live="polite">
      {isLoading && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium',
            isDark
              ? 'border border-cyan-400/30 bg-cyan-950/40 text-cyan-100'
              : 'border border-brand-200/80 bg-brand-50/90 text-brand-800',
          )}
          role="status"
        >
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
          <span>{loadingMessage}</span>
        </div>
      )}

      {error && (
        <div
          className={cn(
            'flex items-start gap-2 rounded-xl px-3 py-2 text-xs',
            isDark
              ? 'border border-rose-400/40 bg-rose-950/50 text-rose-100'
              : 'border border-red-200 bg-red-50 text-red-800',
          )}
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 leading-relaxed">{error}</p>
          <div className="flex shrink-0 items-center gap-1">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-lg px-2 py-1 font-semibold transition',
                  isDark
                    ? 'text-rose-100 hover:bg-rose-900/50'
                    : 'text-red-700 hover:bg-red-100',
                  'disabled:opacity-50',
                )}
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                {retryLabel}
              </button>
            )}
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                className={cn(
                  'rounded-lg p-1 transition',
                  isDark ? 'text-rose-200 hover:bg-rose-900/50' : 'text-red-600 hover:bg-red-100',
                )}
                aria-label="关闭错误提示"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
