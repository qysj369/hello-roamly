import { getAmapKey, getAmapSecurityCode } from '@/lib/map/amap';
import { maskMapCredential } from '@/lib/map/credentials';
import { getMapboxToken } from '@/lib/map/mapbox';
import {
  canShowDevDemoMap,
  getMapProviderLabel,
  hasDisplayableMap,
  hasMapService,
  resolveMapProvider,
} from '@/lib/map/provider';
import { cn } from '@/utils/cn';

function StatusRow({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex flex-col gap-0.5 text-xs">
      <span className={cn('font-medium', ok ? 'text-emerald-700' : 'text-amber-800')}>
        {ok ? '✓' : '○'} {label}
      </span>
      {detail ? <span className="text-slate-500">{detail}</span> : null}
    </li>
  );
}

/** 开发环境地图配置自检（不展示完整 Key） */
export default function MapDevStatusPanel() {
  if (!import.meta.env.DEV) {
    return null;
  }

  const provider = resolveMapProvider();
  const amapKey = getAmapKey();
  const amapSecurity = getAmapSecurityCode();
  const mapbox = getMapboxToken();
  const displayable = hasDisplayableMap();

  return (
    <section
      className="rounded-xl border border-dashed border-slate-300 bg-slate-50/90 px-3 py-3 text-slate-700"
      aria-label="地图配置自检"
    >
      <p className="text-xs font-semibold text-slate-800">站内自检（仅开发环境）</p>
      <ul className="mt-2 space-y-2">
        <StatusRow
          ok={Boolean(amapKey)}
          label="高德 Key"
          detail={maskMapCredential(amapKey)}
        />
        <StatusRow
          ok={Boolean(amapSecurity)}
          label="高德安全密钥"
          detail={maskMapCredential(amapSecurity)}
        />
        <StatusRow
          ok={hasMapService()}
          label="地图服务已就绪"
          detail={
            provider
              ? `当前：${getMapProviderLabel(provider)}`
              : canShowDevDemoMap()
                ? '未检测到 Key，使用演示地图'
                : '请在 .env.local 配置 Key 后重启 pnpm dev'
          }
        />
        <StatusRow
          ok={displayable}
          label="地图区域可渲染"
          detail={displayable ? '可点「全屏」测试' : '仅显示配置说明占位'}
        />
        {mapbox ? (
          <StatusRow ok label="Mapbox Token（备选）" detail={maskMapCredential(mapbox)} />
        ) : null}
      </ul>
      <p className="mt-2 text-[10px] text-slate-500">
        改 .env.local 后必须在终端 Ctrl+C 再执行 pnpm dev。变量名须为 VITE_AMAP_KEY（不是 VIT_AMAP_KEY）。
      </p>
    </section>
  );
}
