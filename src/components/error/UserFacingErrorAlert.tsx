import AsyncFeedback from '@/components/ui/AsyncFeedback';
import {
  getUserFacingErrorMessage,
  resolveUserFacingError,
  type UserErrorContext,
} from '@/lib/errors/userFacingMessage';
import { cn } from '@/utils/cn';

export type UserFacingErrorAlertProps = {
  error: unknown;
  context?: UserErrorContext;
  className?: string;
  variant?: 'light' | 'dark';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  /** 覆盖自动解析的标题 */
  title?: string;
  fallbackMessage?: string;
};

/**
 * 用户友好错误提示：统一标题 + 文案 + 重试/关闭。
 * 传入 React Query 的 `error` 对象或字符串均可。
 */
export default function UserFacingErrorAlert({
  error,
  context = 'default',
  className,
  variant = 'light',
  onRetry,
  onDismiss,
  retryLabel = '重试',
  title,
  fallbackMessage,
}: UserFacingErrorAlertProps) {
  if (!error) {
    return null;
  }

  const resolved =
    typeof error === 'string'
      ? {
          title: title ?? resolveUserFacingError(new Error(error), context).title,
          message: error.trim() || getUserFacingErrorMessage(error, context, { fallback: fallbackMessage }),
          canRetry: Boolean(onRetry),
        }
      : resolveUserFacingError(error, context, { fallback: fallbackMessage });

  const displayTitle = title ?? resolved.title;
  const showRetry = resolved.canRetry && Boolean(onRetry);

  return (
    <div className={cn('space-y-2', className)} role="alert" aria-live="polite">
      {displayTitle ? (
        <p
          className={cn(
            'text-sm font-semibold',
            variant === 'dark' ? 'text-rose-100' : 'text-slate-900',
          )}
        >
          {displayTitle}
        </p>
      ) : null}
      <AsyncFeedback
        variant={variant}
        error={resolved.message}
        onDismissError={onDismiss}
        onRetry={showRetry ? onRetry : undefined}
        retryLabel={retryLabel}
      />
      {resolved.hint ? (
        <p className={cn('text-xs', variant === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
          {resolved.hint}
        </p>
      ) : null}
    </div>
  );
}
