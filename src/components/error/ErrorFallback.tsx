import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { shouldShowErrorDetails } from '@/lib/errors';
import { getUserFacingErrorMessage } from '@/lib/errors/userFacingMessage';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

export type ErrorFallbackProps = {
  error: Error;
  onReset?: () => void;
  title?: string;
  description?: string;
  className?: string;
  /** 区块级 fallback 时使用紧凑布局 */
  compact?: boolean;
};

/**
 * ErrorBoundary 默认 UI：友好提示 + 重试 / 回首页。
 */
export default function ErrorFallback({
  error,
  onReset,
  title = '页面暂时无法显示',
  description,
  className,
  compact = false,
}: ErrorFallbackProps) {
  const message = description ? undefined : getUserFacingErrorMessage(error, 'default');
  const showDetails = shouldShowErrorDetails();

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        compact ? 'gap-4 py-8' : 'gap-6 py-12',
        className,
      )}
      role="alert"
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600',
          compact ? 'h-12 w-12' : 'h-14 w-14',
        )}
        aria-hidden
      >
        <AlertTriangle className={compact ? 'h-6 w-6' : 'h-7 w-7'} />
      </span>

      <div className="max-w-sm space-y-2">
        <h1 className={cn('font-semibold text-slate-900', compact ? 'text-base' : 'text-lg')}>
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {description ?? message ?? '暂时无法完成操作，请稍后再试'}
        </p>
        {showDetails && error.stack && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-[10px] leading-relaxed text-slate-700">
            {error.stack}
          </pre>
        )}
      </div>

      <div className={cn('flex w-full max-w-xs flex-col gap-2', !compact && 'sm:flex-row sm:justify-center')}>
        {onReset && (
          <Button type="button" variant="primary" fullWidth onClick={onReset}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            重试
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          fullWidth={!compact}
          onClick={() => {
            window.location.assign(paths.home);
          }}
        >
          <Home className="h-4 w-4" aria-hidden />
          返回首页
        </Button>
      </div>
    </div>
  );
}
