import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { staggerItem } from '@/lib/motion';

type MotionCardProps = {
  children: ReactNode;
  className?: string;
  as?: 'article' | 'div';
};

export default function MotionCard({ children, className = '', as = 'article' }: MotionCardProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      variants={staggerItem}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.18)',
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        'transition-colors hover:border-brand-200',
        className,
      )}
    >
      {children}
    </Component>
  );
}
