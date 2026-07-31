import type { Transition, Variants } from 'framer-motion';

export const easeOut: Transition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { ...easeOut, duration: 0.28 } },
};

/** 卡片悬停：轻微上浮（配合 shadow 类名） */
export const cardHoverMotion = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.01, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
} as const;

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { ...easeOut, duration: 0.3 } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.18 } },
};

/** 尊重系统「减少动态效果」时的过渡 */
export function motionTransition(reduceMotion: boolean | null): Transition {
  if (reduceMotion) {
    return { duration: 0 };
  }
  return easeOut;
}
