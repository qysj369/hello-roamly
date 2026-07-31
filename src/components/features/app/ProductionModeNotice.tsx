import { getAiProviderDisplay, isDeepSeekConfigured } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { hasMapService } from '@/lib/map/provider';
import { cn } from '@/utils/cn';

type ProductionModeNoticeProps = {
  className?: string;
};

/** 上线模式：展示真实服务就绪状态或缺失的环境变量 */
export default function ProductionModeNotice({ className }: ProductionModeNoticeProps) {
  if (!isProductionAppMode()) {
    return null;
  }

  const aiReady = isDeepSeekConfigured();
  const mapReady = hasMapService();
  const allReady = aiReady && mapReady;

  if (allReady) {
    return (
      <p
        className={cn(
          'rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-xs leading-relaxed text-emerald-900',
          className,
        )}
        role="status"
      >
        <strong className="font-semibold">上线模式</strong>：已启用 DeepSeek 对话/行程生成
        {mapReady ? '与高德地图' : ''}。演示地图与 Mock 行程已关闭。
      </p>
    );
  }

  const missing: string[] = [];
  if (!aiReady) {
    missing.push('VITE_DEEPSEEK_API_KEY');
  }
  if (!mapReady) {
    missing.push('VITE_AMAP_KEY + VITE_AMAP_SECURITY_CODE');
  }

  return (
    <p
      className={cn(
        'rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950',
        className,
      )}
      role="alert"
    >
      <strong className="font-semibold">上线模式</strong>（{getAiProviderDisplay() === 'unconfigured' ? 'AI 未配置' : '配置不完整'}
      ）：请在本机 <code className="rounded bg-white/80 px-1">.env.local</code> 填写{' '}
      {missing.join('、')}，保存后 <strong className="font-semibold">重启 pnpm dev</strong>。
      未配置前无法生成真实 AI 行程。
    </p>
  );
}
