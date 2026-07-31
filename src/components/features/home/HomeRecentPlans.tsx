import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { TravelPlanCard } from '@/components/features/plans';
import { getRecentTravelPlans } from '@/data/recentTravelPlans';
import { motionTransition, staggerContainer, staggerItem } from '@/lib/motion';
import { useGeneratedPlansStore } from '@/stores/generatedPlans/store';

function mergeRecentPlans(generated: ReturnType<typeof useGeneratedPlansStore.getState>['plans']) {
  const demo = getRecentTravelPlans(3);
  const seen = new Set<string>();
  return [...generated, ...demo]
    .filter((plan) => {
      if (seen.has(plan.id)) {
        return false;
      }
      seen.add(plan.id);
      return true;
    })
    .slice(0, 6);
}

/** 最近生成的旅行计划：横向滚动动画 */
export default function HomeRecentPlans() {
  const reduceMotion = useReducedMotion();
  const generated = useGeneratedPlansStore((state) => state.plans);
  const plans = useMemo(() => mergeRecentPlans(generated), [generated]);
  const loopPlans = useMemo(() => [...plans, ...plans], [plans]);

  return (
    <motion.section
      id="home-recent-plans"
      className="home-recent-plans"
      aria-labelledby="home-recent-plans-title"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={motionTransition(reduceMotion)}
    >
      <motion.div
        variants={staggerItem}
        className="mb-4 flex items-end justify-between gap-2 px-0.5"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-600">
            Live Feed
          </p>
          <h3 id="home-recent-plans-title" className="mt-1 text-base font-semibold text-slate-900">
            最近生成的旅行计划
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {generated.length > 0
              ? '含你刚生成的方案，与示例计划一起滚动展示'
              : 'AI 完成的方案将出现在此处；下方可一键生成'}
          </p>
        </div>
      </motion.div>

      {reduceMotion ? (
        <ul className="flex flex-col gap-3">
          {plans.map((plan) => (
            <li key={plan.id}>
              <TravelPlanCard plan={plan} />
            </li>
          ))}
        </ul>
      ) : (
        <motion.div variants={staggerItem} className="home-plans-marquee -mx-1 py-1">
          <div className="home-plans-track flex gap-4 px-1">
            {loopPlans.map((plan, index) => (
              <TravelPlanCard
                key={index < plans.length ? plan.id : `${plan.id}-marquee-clone`}
                plan={plan}
                className="w-[min(88vw,17.5rem)] shrink-0 snap-center"
                duplicateLabel={index >= plans.length ? '循环展示' : undefined}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
