import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUpVariants, motionTransition } from '@/lib/motion';

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function MotionSection({ children, className = '', delay = 0 }: MotionSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={className}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{ ...motionTransition(reduceMotion), delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.section>
  );
}
