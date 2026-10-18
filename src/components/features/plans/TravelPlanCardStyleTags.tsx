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
    'border-[#b7cdc4] bg-emerald-50/80 text-[#2c6b58] hover:border-[#2c6b58] hover:bg-emerald-50',
  violet:
    'border-[#b7cdc4] bg-emerald-50/80 text-[#2c6b58] hover:border-[#2c6b58] hover:bg-emerald-50',
  amber:
    'border-[#b7cdc4] bg-[#fffef6] text-[#54786c] hover:border-[#2c6b58] hover:bg-emerald-50',
  emerald:
    'border-[#b7cdc4] bg-emerald-50/80 text-[#2c6b58] hover:border-[#2c6b58] hover:bg-emerald-50',
  rose: 'border-[#b7cdc4] bg-[#fffef6] text-[#54786c] hover:border-[#2c6b58] hover:bg-emerald-50',
  cyan: 'border-[#b7cdc4] bg-[#fffef6] text-[#54786c] hover:border-[#2c6b58] hover:bg-emerald-50',
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
