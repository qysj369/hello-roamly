import { useApiErrorStore } from '@/stores/apiErrorStore';
import UserFacingErrorAlert from '@/components/error/UserFacingErrorAlert';

/**
 * 全局 API 错误条（主要由 mutation 失败触发）。
 */
export default function ApiErrorBanner() {
  const message = useApiErrorStore((state) => state.message);
  const dismiss = useApiErrorStore((state) => state.dismiss);

  return (
    <UserFacingErrorAlert
      className="mb-3"
      error={message}
      context="mutation"
      onDismiss={dismiss}
    />
  );
}
