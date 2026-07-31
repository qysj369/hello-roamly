import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import type { TravelPlanStyleTag } from '@/types/domain/travelPlanStyleTag';
import { motionTransition, staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/utils/cn';

type TravelPlanCardStyleTagsProps = {
  tags: TravelPlanStyleTag[];
  className?: string;
};

const TONE_CLASS: Record<NonNullable<TravelPlanStyleTag['tone']>, string> = {
  brand:
    'border-brand-200/80 bg-brand-50/80 text-brand-800 hover:border-brand-300 hover:bg-brand-100/90 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  violet:
    'border-violet-200/80 bg-violet-50/80 text-violet-800 hover:border-violet-300 hover:bg-violet-100/90 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]',
  amber:
    'border-amber-200/80 bg-amber-50/80 text-amber-900 hover:border-amber-300 hover:bg-amber-100/90 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]',
  emerald:
    'border-emerald-200/80 bg-emerald-50/80 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100/90 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  rose: 'border-rose-200/80 bg-rose-50/80 text-rose-800 hover:border-rose-300 hover:bg-rose-100/90 hover:shadow-[0_0_12px_rgba(244,63,94,0.12)]',
  cyan: 'border-cyan-200/80 bg-cyan-50/80 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100/90 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]',
};

function getToneClass(tone: TravelPlanStyleTag['tone']): string {
  return TONE_CLASS[tone ?? 'brand'];
}

function TravelPlanCardStyleTags({ tags, className }: TravelPlanCardStyleTagsProps) {
  const reduceMotion = useReducedMotion();

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-500">
        旅行风格
      </p>
      <motion.ul
        className="flex flex-wrap gap-1.5"
        role="list"
        aria-label="旅行风格标签"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        transition={motionTransition(reduceMotion)}
      >
        {tags.map((tag) => (
          <motion.li
            key={tag.id}
            variants={staggerItem}
            whileHover={
              reduceMotion
                ? undefined
                : { scale: 1.05, y: -2, transition: { duration: 0.18 } }
            }
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className={cn(
              'cursor-default rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide backdrop-blur-[2px] transition-[box-shadow,border-color,background-color] duration-200',
              getToneClass(tag.tone),
            )}
          >
            {tag.label}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default memo(
  TravelPlanCardStyleTags,
  (prev, next) => prev.tags === next.tags && prev.className === next.className,
);
