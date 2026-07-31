import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SNAIL_COMMUNITY_CREED } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

const QUICK_ACTIONS = [
  { label: '去发现', to: paths.discover },
  { label: '找搭子', to: paths.travelBuddies },
  { label: '发轨迹', to: paths.guidesPublish },
] as const;

/** 首页社区 pulse — 公约提示 + 快捷入口 */
export default function HomeCommunityPulse() {
  const tip = useMemo(() => {
    const dayIndex = new Date().getDate() % SNAIL_COMMUNITY_CREED.length;
    return SNAIL_COMMUNITY_CREED[dayIndex] ?? SNAIL_COMMUNITY_CREED[0];
  }, []);

  return (
    <aside
      className="home-community-pulse rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 to-teal-50/60 px-4 py-3.5 sm:px-5"
      aria-label="蜗牛社区"
    >
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-800">🐌 蜗牛公约 · 今日一句</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{tip}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="inline-flex min-h-8 items-center rounded-full border border-emerald-200/80 bg-white/80 px-3 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              {action.label}
            </Link>
          ))}
          <Link
            to={paths.snailCulture}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            蜗牛黑话 →
          </Link>
        </div>
      </div>
    </aside>
  );
}
