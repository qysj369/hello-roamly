import { FormEvent, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Navigation, Search, Target, X } from 'lucide-react';
import type { GeoBlockReason, OriginSource, OriginStatus } from '@/hooks/map/useUserMapOrigin';
import { cn } from '@/utils/cn';

type HomeMapOriginChipProps = {
  label: string | null;
  status: OriginStatus;
  source: OriginSource;
  geoBlockReason?: GeoBlockReason;
  pickMode: boolean;
  onRefresh: () => void;
  onStartPickOnMap: () => void;
  onCancelPick: () => void;
  onUseDemoOrigin?: () => void;
  onApproximateByIp?: () => void;
  onSearchOrigin?: (address: string) => Promise<boolean>;
  placement?: 'header' | 'overlay';
};

function sourceHint(
  source: OriginSource,
  status: OriginStatus,
  geoBlockReason: GeoBlockReason,
): string {
  if (status === 'loading') {
    return '正在获取你的位置…';
  }
  if (status === 'fallback') {
    return '默认出发地（中林路绿城百合花园）';
  }
  if (source === 'ip') {
    return '网络近似定位（城市级）';
  }
  if (source === 'manual') {
    return '已手动校正';
  }
  if (status === 'insecure' || geoBlockReason === 'insecure') {
    return '当前地址无法使用 GPS（需 localhost 或 HTTPS）';
  }
  if (status === 'denied' || geoBlockReason === 'denied') {
    return '浏览器已禁止定位';
  }
  if (geoBlockReason === 'no_popup') {
    return '未弹出授权窗（需手动开权限）';
  }
  if (geoBlockReason === 'system_off') {
    return '系统 GPS 未开（不影响使用）';
  }
  if (geoBlockReason === 'timeout') {
    return 'GPS 超时';
  }
  if (geoBlockReason === 'low_accuracy') {
    return 'GPS 精度低（电脑常见），请地址校正';
  }
  if (status === 'unsupported') {
    return '本浏览器不支持定位';
  }
  if (status === 'error') {
    return geoBlockReason === 'address_failed' ? '地址解析失败' : 'GPS 定位失败';
  }
  if (status === 'idle') {
    return '请用下方「确认出发地」设置出发地（比 GPS 更准）';
  }
  return 'GPS 定位';
}

function actionHint(
  geoBlockReason: GeoBlockReason,
  status: OriginStatus,
  source: OriginSource,
): string {
  if (status === 'fallback') {
    return '随便说想去哪即可；演示点仅用于本地试 UI。';
  }
  if (geoBlockReason === 'insecure') {
    return '请用 http://localhost:5173/ 打开本站；用局域网 IP 时浏览器不会给定位。';
  }
  if (geoBlockReason === 'system_off') {
    return 'GPS 未开也没关系：输入地址后点「地址校正」即可，不必开系统定位。';
  }
  if (geoBlockReason === 'denied') {
    return '浏览器未允许 GPS 也没关系：请用下方「地址校正」或「地图选出发地」。';
  }
  if (geoBlockReason === 'no_popup') {
    return '请用系统 Chrome/Edge 打开 http://localhost:5173/（不要用 Cursor 内嵌预览）；再点重新定位。';
  }
  if (geoBlockReason === 'timeout') {
    return 'GPS 超时：可点「网络定位」试城市级位置，或「地图选出发地」精确选点。';
  }
  if (geoBlockReason === 'address_failed') {
    return '地址未解析成功：请点「地图选出发地」，或检查网络后重试地址校正。';
  }
  if (geoBlockReason === 'low_accuracy' || source === 'gps') {
    return '电脑 GPS 误差可达数公里；请在下方输入小区名后点「地址校正」（比重新定位更准）。';
  }
  if (status === 'idle') {
    return '电脑不必开 GPS：输入小区名 → 点「确认出发地」→ 看到「已手动校正」即可规划。';
  }
  return '随便说想去哪（如「成都火锅三天」）；先确认出发地，系统会自动判断是否从家出发。';
}

export default function HomeMapOriginChip({
  label,
  status,
  source,
  geoBlockReason = null,
  pickMode,
  onRefresh,
  onStartPickOnMap,
  onCancelPick,
  onUseDemoOrigin,
  onApproximateByIp,
  onSearchOrigin,
  placement = 'overlay',
}: HomeMapOriginChipProps) {
  const isHeader = placement === 'header';
  const busy = status === 'loading';
  const [addressQuery, setAddressQuery] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchOk, setSearchOk] = useState(false);
  const userEditedRef = useRef(false);
  const prefilledRef = useRef(false);
  const defaultAddressHint = '济南市历下区中林路绿城百合花园';

  const resolveSubmitAddress = (): string => {
    const trimmed = addressQuery.trim();
    if (trimmed) {
      return trimmed;
    }
    if (label?.trim()) {
      return label.trim();
    }
    return defaultAddressHint;
  };

  /** 预填：手动校正地址或默认出发地，避免 placeholder 看似有字其实为空 */
  useEffect(() => {
    if (prefilledRef.current || userEditedRef.current) {
      return;
    }
    prefilledRef.current = true;

    if ((source === 'manual' || source === 'fallback') && label?.trim()) {
      setAddressQuery(label.trim());
      return;
    }

    try {
      const raw = localStorage.getItem('hello-roamly-manual-origin-v2')
        ?? localStorage.getItem('hello-roamly-manual-origin-v1');
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { label?: string };
      if (parsed.label?.trim()) {
        setAddressQuery(parsed.label.trim());
      }
    } catch {
      /* ignore */
    }
  }, [label, source]);

  const gpsUnavailable =
    geoBlockReason === 'system_off' ||
    geoBlockReason === 'denied' ||
    geoBlockReason === 'no_popup' ||
    geoBlockReason === 'insecure' ||
    status === 'idle';

  const needsAddressFix =
    !label?.trim() ||
    source === 'gps' ||
    geoBlockReason === 'low_accuracy' ||
    (status === 'idle' && source !== 'fallback');

  const applyAddressCorrection = () => {
    const submitAddress = resolveSubmitAddress();
    if (!onSearchOrigin || searchBusy) {
      return;
    }
    if (!submitAddress.trim()) {
      setSearchError('请先输入地址，或点「地图选出发地」');
      return;
    }
    if (!addressQuery.trim() && submitAddress !== addressQuery) {
      setAddressQuery(submitAddress);
    }
    setSearchBusy(true);
    setSearchError(null);
    setSearchOk(false);
    void onSearchOrigin(submitAddress)
      .then((ok) => {
        setSearchBusy(false);
        if (!ok) {
          setSearchOk(false);
          setSearchError('未找到该地址：请检查关键字，或点「地图选出发地」');
        } else {
          setSearchError(null);
          setSearchOk(true);
          userEditedRef.current = false;
        }
      })
      .catch(() => {
        setSearchBusy(false);
        setSearchOk(false);
        setSearchError('地址解析失败：请检查网络，或点「地图选出发地」');
      });
  };

  const handleAddressSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    applyAddressCorrection();
  };

  const handleClearAddress = () => {
    userEditedRef.current = true;
    setAddressQuery('');
    setSearchError(null);
    setSearchOk(false);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-[11px]',
        isHeader
          ? 'border-slate-200/90 bg-slate-50/95 text-slate-600'
          : 'border-slate-600/50 bg-slate-900/90 text-slate-300',
        needsAddressFix &&
          (isHeader ? 'border-amber-300/90 ring-1 ring-amber-200/80' : 'border-amber-500/50'),
      )}
    >
      <div className="flex items-start gap-1.5">
        {busy ? (
          <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-emerald-500" aria-hidden />
        ) : (
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">
            出发地：{label?.trim() || '未识别'}
          </p>
          <p className={cn('mt-0.5 leading-snug', isHeader ? 'text-slate-500' : 'text-slate-400')}>
            {sourceHint(source, status, geoBlockReason)}
            {pickMode ? ' · 请点击地图设出发地' : null}
          </p>
        </div>
      </div>
      {onSearchOrigin ? (
        <form onSubmit={handleAddressSubmit} className="flex flex-col gap-1">
          <div className="flex gap-1">
            <div className="relative min-w-0 flex-1">
              <input
                type="text"
                value={addressQuery}
                onChange={(event) => {
                  userEditedRef.current = true;
                  setAddressQuery(event.target.value);
                  if (searchError) {
                    setSearchError(null);
                  }
                  if (searchOk) {
                    setSearchOk(false);
                  }
                }}
                placeholder="济南市历下区中林路绿城百合花园"
                className={cn(
                  'w-full rounded-md border py-1 pl-2 pr-7 text-[11px] outline-none focus:ring-1 focus:ring-emerald-400/60',
                  isHeader
                    ? 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400'
                    : 'border-slate-500/60 bg-slate-800/80 text-slate-100 placeholder:text-slate-500',
                )}
              />
              {addressQuery ? (
                <button
                  type="button"
                  onClick={handleClearAddress}
                  aria-label="清空地址"
                  className={cn(
                    'absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5',
                    isHeader
                      ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                  )}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={applyAddressCorrection}
              disabled={searchBusy}
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-medium disabled:opacity-50',
                isHeader
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                  : 'border-emerald-400/60 bg-emerald-900/70 text-emerald-100 hover:bg-emerald-800/80',
              )}
            >
              {searchBusy ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                <Search className="h-3 w-3" aria-hidden />
              )}
              确认出发地
            </button>
          </div>
          {searchError ? (
            <p className={cn('leading-snug', isHeader ? 'text-rose-600' : 'text-rose-300')}>
              {searchError}
            </p>
          ) : searchOk ? (
            <p className={cn('leading-snug', isHeader ? 'text-emerald-700' : 'text-emerald-300')}>
              出发地已校正，可以一键规划了
            </p>
          ) : needsAddressFix ? (
            <p className={cn('leading-snug font-medium', isHeader ? 'text-amber-700' : 'text-amber-200')}>
              填好地址后点绿色「确认出发地」（不要点下面的一键规划）
            </p>
          ) : null}
        </form>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {pickMode ? (
          <button
            type="button"
            onClick={onCancelPick}
            className={cn(
              'rounded-md border px-2 py-0.5 font-medium',
              isHeader
                ? 'border-slate-200 bg-white text-slate-600'
                : 'border-slate-500/60 text-slate-300',
            )}
          >
            取消
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartPickOnMap}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium transition',
              isHeader
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-emerald-500/50 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/50',
            )}
          >
            <Target className="h-3 w-3" aria-hidden />
            地图选出发地
          </button>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className={cn(
            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium transition',
            busy && 'opacity-80',
            isHeader
              ? 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
              : 'border-slate-500/60 bg-slate-800/80 text-slate-400 hover:bg-slate-700/80',
          )}
        >
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <Navigation className="h-3 w-3" aria-hidden />
          )}
          {busy ? '定位中…' : source === 'manual' ? 'GPS（会覆盖已确认地址）' : 'GPS（可选）'}
        </button>
        {onApproximateByIp ? (
          <button
            type="button"
            onClick={onApproximateByIp}
            className={cn(
              'rounded-md border px-2 py-0.5 font-medium',
              isHeader
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : 'border-sky-500/40 text-sky-200',
            )}
          >
            网络定位
          </button>
        ) : null}
        {import.meta.env.DEV && onUseDemoOrigin && status !== 'fallback' ? (
          <button
            type="button"
            onClick={onUseDemoOrigin}
            className={cn(
              'rounded-md border px-2 py-0.5 font-medium',
              isHeader
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-amber-500/40 text-amber-200',
            )}
          >
            演示定位
          </button>
        ) : null}
      </div>
      <p className={cn('leading-snug', isHeader ? 'text-slate-500' : 'text-slate-500')}>
        {actionHint(geoBlockReason, status, source)}
      </p>
    </div>
  );
}
