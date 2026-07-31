import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

type MotionNavLinkProps = {
  to: string;
  end?: boolean;
  children: ReactNode;
};

export default function MotionNavLink({ to, end, children }: MotionNavLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <NavLink to={to} end={end} className="relative flex-1">
      {({ isActive }) => (
        <motion.span
          className={cn(
            'relative z-10 block rounded-lg px-3 py-2 text-center text-sm font-medium',
            isActive ? 'text-white' : 'text-slate-600',
          )}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          {children}
          {isActive && (
            <motion.span
              layoutId="main-nav-pill"
              className="absolute inset-0 z-0 rounded-lg bg-brand-600 shadow-sm"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </motion.span>
      )}
    </NavLink>
  );
}
