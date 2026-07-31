import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Guide } from '@/types/domain/guide';
import { HOME_CONSTITUTION } from '@/lib/config/homeConstitution';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';
import { formatRelativeZh } from '@/utils/date';
import { guideDetailPath, paths } from '@/router/paths';

type HomeFeaturedGuidesProps = {
  guides: Guide[];
};

function isStructuredGuide(guide: Guide): boolean {
  return guide.kind === 'structured' || guide.id.startsWith('user-guide-');
}

export default function HomeFeaturedGuides({ guides }: HomeFeaturedGuidesProps) {
  return (
    <section
      className="home-tech-panel rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md"
      aria-labelledby="home-featured-guides-title"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-emerald-700">
            {HOME_CONSTITUTION.role}
          </p>
          <h3 id="home-featured-guides-title" className="mt-0.5 text-base font-bold text-slate-900">
            精选结构化攻略
          </h3>
          <p className="mt-1 text-xs text-slate-500">花费清单 · 行程流水账 · 蜗牛启示</p>
        </div>
        <Link
          to={paths.guides}
          className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
        >
          查看全部攻略
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide, index) => (
          <li key={guide.id} className="min-w-0">
            <Link
              to={guideDetailPath(guide.id)}
              className={cn(
                'group relative block overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-white px-4 py-3',
                'transition-all hover:border-emerald-300/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]',
              )}
            >
              <span
                className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-500 opacity-80"
                aria-hidden
              />
              <span className="absolute right-3 top-3 font-mono text-[10px] text-slate-300">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="pr-8 font-mono text-[10px] uppercase tracking-wider text-emerald-700">
                {guide.city}
                {isStructuredGuide(guide) && (
                  <span className="ml-1.5 rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold normal-case text-emerald-800">
                    {SLIME_TRAIL_PUBLISHER.structuredBadge}
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-emerald-800">
                {guide.title}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                  {guide.budget}
                </span>
                <span>{guide.days}</span>
                <span className="text-slate-400">· {formatRelativeZh(guide.updatedAt)}</span>
              </p>
            </Link>
          </li>
        ))}
        {guides.length === 0 && (
          <li className="col-span-full rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            {SNAIL_GLOBAL_COPY.emptyState}
            <Link to={paths.guidesPublish} className="ml-1 font-semibold text-emerald-700 hover:underline">
              发布第一条黏液轨迹
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
