import { useMemo } from 'react';
import {
  canShowDevDemoMap,
  getMapProviderLabel,
  getMapProviderMode,
  hasAmapCredentials,
  hasMapboxCredentials,
  resolveMapProvider,
} from '@/lib/map/provider';
import { getActiveCoordinateSystem, getCoordinateSystemLabel } from '@/lib/map/coordinates';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { cn } from '@/utils/cn';

type MapProviderBadgeProps = {
  className?: string;
};

/** 展示当前生效的地图服务商与坐标系（中国版调试/透明化） */
export default function MapProviderBadge({ className }: MapProviderBadgeProps) {
  const provider = useMemo(() => resolveMapProvider(), []);
  const mode = getMapProviderMode();
  const crs = getActiveCoordinateSystem();

  if (!provider) {
    if (canShowDevDemoMap()) {
      return (
        <span
          className={cn(
            'inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800',
            className,
          )}
        >
          开发演示地图
        </span>
      );
    }

    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-medium text-amber-800',
          className,
        )}
      >
        未配置地图 Key
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-0.5 text-[10px] text-slate-600 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <span className="font-semibold text-slate-800">{getMapProviderLabel(provider)}</span>
      <span className="text-slate-400" aria-hidden>
        ·
      </span>
      <span>{getCoordinateSystemLabel(crs)}</span>
      {mode !== 'auto' && (
        <>
          <span className="text-slate-400" aria-hidden>
            ·
          </span>
          <span>强制 {mode}</span>
        </>
      )}
      {isChinaPrimaryMarket() && hasAmapCredentials() && !hasMapboxCredentials() && (
        <span className="rounded bg-emerald-50 px-1 text-emerald-700">中国版</span>
      )}
    </span>
  );
}
