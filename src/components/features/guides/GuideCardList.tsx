import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Guide } from '@/types/domain/guide';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { SNAIL_UI_COPY } from '@/lib/config/snailCommunity';

function isStructuredGuide(guide: Guide): boolean {
  return guide.kind === 'structured' || guide.id.startsWith('user-guide-');
}
import MotionCard from '@/components/motion/MotionCard';
import { formatRelativeZh } from '@/utils/date';
import { motionTransition, staggerContainer } from '@/lib/motion';
import { guideDetailPath, paths } from '@/router/paths';

type GuideCardListProps = {
  guides: Guide[];
  title?: string;
  subtitle?: string;
};

export default function GuideCardList({
  guides,
  title = '推荐攻略',
  subtitle,
}: GuideCardListProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">
        {subtitle ?? `共 ${guides.length} 条，点击卡片查看详情`}
      </p>

      <motion.ul
        key={guides.map((g) => g.id).join(',')}
        className="mt-4 grid gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        transition={motionTransition(reduceMotion)}
      >
        {guides.map((guide) => (
          <li key={guide.id}>
            <MotionCard className="block">
              <Link
                to={guideDetailPath(guide.id)}
                className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                      {guide.city}
                      {isStructuredGuide(guide) && (
                        <span className="ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold normal-case text-emerald-800">
                          {SLIME_TRAIL_PUBLISHER.structuredBadge}
                        </span>
                      )}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900">{guide.title}</h3>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5 text-brand-600">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {guide.budget}
                    </span>
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{guide.days}</span>
                  <span>· 更新 {formatRelativeZh(guide.updatedAt)}</span>
                  {guide.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-brand-50 px-1.5 py-0.5 text-brand-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
              <Link
                to={paths.home}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                在地图中查看
              </Link>
            </MotionCard>
          </li>
        ))}
      </motion.ul>

      {guides.length === 0 && (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-slate-500"
        >
          {SNAIL_UI_COPY.guidesListEmpty}        </motion.p>
      )}
    </section>
  );
}
