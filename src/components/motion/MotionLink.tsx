import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

type MotionLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  replace?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export default function MotionLink({
  to,
  children,
  className = '',
  replace = false,
  onClick,
}: MotionLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="flex w-full min-w-0"
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      <Link to={to} replace={replace} className={cn('w-full', className)} onClick={onClick}>
        {children}
      </Link>
    </motion.span>
  );
}
