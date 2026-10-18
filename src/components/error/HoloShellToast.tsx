import { useEffect } from 'react';
import { useApiErrorStore } from '@/stores/apiErrorStore';

/** 首页 / 内页壳层浮动提示：不占文档流，避免挤开锁版布局 */
export default function HoloShellToast() {
  const message = useApiErrorStore((state) => state.message);
  const dismiss = useApiErrorStore((state) => state.dismiss);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => dismiss(), 5200);
    return () => window.clearTimeout(timer);
  }, [dismiss, message]);

  if (!message) return null;

  return (
    <div className="holo-app-shell__toast" role="alert">
      <p>{message}</p>
      <button type="button" className="holo-app-shell__toast-close" onClick={dismiss} aria-label="关闭">
        ×
      </button>
    </div>
  );
}
