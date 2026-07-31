import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { getMapProviderMode, hasAmapCredentials, hasMapboxCredentials } from '@/lib/map/provider';
import { cn } from '@/utils/cn';

type MapServicePlaceholderProps = {
  className?: string;
  compact?: boolean;
};

export default function MapServicePlaceholder({ className, compact = false }: MapServicePlaceholderProps) {
  const mode = getMapProviderMode();
  const chinaFirst = isChinaPrimaryMarket();
  const showAmap = mode === 'auto' || mode === 'amap';
  const showMapbox =
    (mode === 'auto' || mode === 'mapbox') &&
    (!chinaFirst || mode === 'mapbox' || hasMapboxCredentials());

  return (
    <div
      className={cn(
        'flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-600',
        className,
      )}
    >
      <p className="font-medium text-slate-800">未配置地图服务</p>
      <p className="text-xs text-slate-500">
        中国版推荐高德；海外或备选可配置 Mapbox。复制{' '}
        <code className="rounded bg-white px-1">.env.local.example</code> 为{' '}
        <code className="rounded bg-white px-1">.env.local</code> 并填入 Key，保存后{' '}
        <strong className="font-medium text-slate-700">重启</strong> <code className="rounded bg-white px-1">pnpm dev</code>
        （Vite 仅在启动时读取环境变量）。
      </p>

      {!compact && (
        <div className="w-full max-w-md space-y-3 text-left text-xs">
          {showAmap && (
            <div className="rounded-lg border border-white bg-white/80 p-3 shadow-sm">
              <p className="font-semibold text-slate-800">高德地图（推荐）</p>
              <p className="mt-1 text-slate-500">
                <a
                  className="text-brand-600 underline"
                  href="https://console.amap.com/dev/key/app"
                  target="_blank"
                  rel="noreferrer"
                >
                  高德开放平台
                </a>{' '}
                创建 Web 端 Key + 安全密钥
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] leading-relaxed text-slate-700">
{`VITE_AMAP_KEY=你的Key
VITE_AMAP_SECURITY_CODE=安全密钥`}
              </pre>
              {hasAmapCredentials() && (
                <p className="mt-1 text-emerald-600">已检测到高德 Key</p>
              )}
            </div>
          )}

          {showMapbox && (
            <div className="rounded-lg border border-white bg-white/80 p-3 shadow-sm">
              <p className="font-semibold text-slate-800">Mapbox（备选）</p>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[10px] text-slate-700">
                VITE_MAPBOX_TOKEN=pk.你的token
              </pre>
              {hasMapboxCredentials() && (
                <p className="mt-1 text-emerald-600">已检测到 Mapbox Token</p>
              )}
            </div>
          )}

          <p className="text-center text-[10px] text-slate-400">
            强制指定服务商：VITE_MAP_PROVIDER=amap 或 mapbox
          </p>
        </div>
      )}
    </div>
  );
}
