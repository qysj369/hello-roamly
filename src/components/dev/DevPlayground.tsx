import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useGithubZen } from '@/hooks';
import { formatRelativeZh } from '@/utils/date';
import { getHttpErrorMessage } from '@/lib/api/http';
import { getClientEnvSnapshot } from '@/lib/config/envSchema';
import { getMapProviderLabel } from '@/lib/map/provider';
import { useUiStore } from '@/stores';

/** 开发环境：Zustand / React Query 演示 */
export default function DevPlayground() {
  const reduceMotion = useReducedMotion();
  const tapCount = useUiStore((state) => state.tapCount);
  const incrementTap = useUiStore((state) => state.incrementTap);

  const env = getClientEnvSnapshot();

  const {
    data: zenQuote,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useGithubZen();

  return (
    <section className="mt-6 space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-800">开发面板 · 状态演示</h3>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-800">环境与地图（中国版）</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-slate-600">
          <dt className="text-slate-400">市场</dt>
          <dd>{env.market === 'CN' ? '中国版 (CN)' : '全球 (GLOBAL)'}</dd>
          <dt className="text-slate-400">地图模式</dt>
          <dd>{env.mapProviderMode}</dd>
          <dt className="text-slate-400">当前服务商</dt>
          <dd>
            {env.activeMapProvider
              ? getMapProviderLabel(env.activeMapProvider as 'amap' | 'mapbox')
              : '未配置'}
          </dd>
          <dt className="text-slate-400">坐标系</dt>
          <dd>{env.activeCoordinateSystem.toUpperCase()}</dd>
          <dt className="text-slate-400">高德 Key</dt>
          <dd>{env.hasAmapKey ? '已配置' : '—'}</dd>
          <dt className="text-slate-400">高德安全码</dt>
          <dd>{env.hasAmapSecurityCode ? '已配置' : '—'}</dd>
          <dt className="text-slate-400">Mapbox</dt>
          <dd>{env.hasMapboxToken ? '已配置' : '—'}</dd>
          <dt className="text-slate-400">支付 UI</dt>
          <dd>{env.paymentUiEnabled ? '已开启' : '—'}</dd>
          <dt className="text-slate-400">支付宝</dt>
          <dd>{env.paymentAlipayEnabled ? '已开启' : '—'}</dd>
          <dt className="text-slate-400">微信支付</dt>
          <dd>{env.paymentWechatEnabled ? '已开启' : '—'}</dd>
          <dt className="text-slate-400">内容审核</dt>
          <dd>{env.contentModerationEnabled ? '已开启' : '—'}</dd>
          <dt className="text-slate-400">审核严格</dt>
          <dd>{env.contentModerationStrict ? '是' : '否'}</dd>
          <dt className="text-slate-400">云审后端</dt>
          <dd>{env.hasModerationBackend ? '已配置' : '—'}</dd>
          <dt className="text-slate-400">静态 CDN</dt>
          <dd>{env.hasAssetCdn ? env.assetCdnBase : '—'}</dd>
          <dt className="text-slate-400">图片 CDN</dt>
          <dd>{env.hasImageCdn ? '已配置' : '—'}</dd>
          <dt className="text-slate-400">中国 CDN 策略</dt>
          <dd>{env.preferChinaCdn ? '是' : '否'}</dd>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Zustand 计数</p>
        <motion.button
          type="button"
          onClick={incrementTap}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {tapCount}
        </motion.button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-800">React Query + axios</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-3 w-3" aria-hidden />
            )}
            刷新
          </button>
        </div>
        {isPending && <p className="mt-2 text-xs text-slate-500">加载中…</p>}
        {isError && <p className="mt-2 text-xs text-red-600">{getHttpErrorMessage(error)}</p>}
        {zenQuote && !isPending && (
          <p className="mt-2 text-sm italic text-slate-600">「{zenQuote}」</p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          GitHub Zen · {dataUpdatedAt ? formatRelativeZh(dataUpdatedAt) : '—'}
        </p>
      </div>
    </section>
  );
}
