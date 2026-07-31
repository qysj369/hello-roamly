import { BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { copy } from '@/content/copy';
import { isShareAnalyticsEnabled } from '@/lib/share/analytics/config';
import {
  clearShareEvents,
  formatShareAction,
  formatShareChannel,
  formatShareContentKind,
  getShareStatsSummary,
} from '@/lib/share/analytics/store';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import type { ShareChannel, ShareStatsSummary } from '@/types/domain/shareAnalytics';
import { formatRelativeZh } from '@/utils/date';

export default function AboutShareAnalyticsSection() {
  const [summary, setSummary] = useState<ShareStatsSummary>(() => getShareStatsSummary());

  const refresh = useCallback(() => {
    setSummary(getShareStatsSummary());
  }, []);

  const handleClear = useCallback(() => {
    if (!window.confirm('确定清空本机分享统计演示数据？')) {
      return;
    }
    clearShareEvents();
    refresh();
  }, [refresh]);

  if (!isChinaPrimaryMarket() || !isShareAnalyticsEnabled()) {
    return null;
  }

  const channelEntries = Object.entries(summary.byChannel).sort((a, b) => b[1] - a[1]);

  return (
    <MotionSection
      className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-white p-6 shadow-sm"
      delay={0.16}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{copy.about.shareStatsTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{copy.about.shareStatsBadge}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            刷新
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            清空
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.shareStatsLead}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {copy.about.shareStatsBullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-sky-600" aria-hidden>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '分享行为', value: summary.shareAttempts },
          { label: '海报保存', value: summary.posterDownloads },
          { label: '链接打开', value: summary.landingViews },
          { label: '事件总数', value: summary.totalEvents },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-sky-100 bg-white/90 px-3 py-3 text-center"
          >
            <p className="text-lg font-bold tabular-nums text-slate-900">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      {channelEntries.length > 0 && (
        <div className="mt-4 rounded-xl border border-sky-100 bg-white/90 p-4">
          <p className="text-xs font-semibold text-slate-800">按渠道</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {channelEntries.map(([channel, count]) => (
              <li
                key={channel}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-900"
              >
                {formatShareChannel(channel as ShareChannel)}{' '}
                <span className="tabular-nums text-sky-700">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-sky-100 bg-white/90 p-4">
        <p className="text-xs font-semibold text-slate-800">最近事件</p>
        {summary.recent.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            暂无数据。去行程/攻略详情点击「分享」或「分享图」后回来刷新。
          </p>
        ) : (
          <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-xs">
            {summary.recent.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-medium text-slate-800">
                  {formatShareAction(event.action)} · {formatShareContentKind(event.contentKind)}
                </span>
                <span className="text-slate-500">
                  {formatShareChannel(event.channel)} · {formatRelativeZh(event.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MotionSection>
  );
}
