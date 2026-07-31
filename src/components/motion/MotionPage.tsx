import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { motionTransition, staggerContainer, staggerItem } from '@/lib/motion';

type MotionPageProps = {
  children: ReactNode;
  className?: string;
};

/** 页面内多块内容依次入场 */
export default function MotionPage({ children, className = '' }: MotionPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      transition={motionTransition(reduceMotion)}
    >
      {children}
    </motion.div>
  );
}

export function MotionBlock({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}
