import type { ISourceOptions } from '@tsparticles/engine';
import Particles from '@tsparticles/react';
import { useReducedMotion } from 'framer-motion';
import { useDocumentVisible } from '@/hooks/browser/useDocumentVisible';
import { cn } from '@/utils/cn';

type ParticlesLayerProps = {
  id: string;
  options: ISourceOptions;
  className?: string;
  overlayClassName?: string;
  fallbackClassName?: string;
};

/**
 * @tsparticles/react 画布层（需在根级 ParticlesProvider 内使用）
 * 标签页隐藏或「减少动态效果」时使用静态渐变，避免后台占 GPU。
 */
export default function ParticlesLayer({
  id,
  options,
  className,
  overlayClassName,
  fallbackClassName = 'home-immersive-bg',
}: ParticlesLayerProps) {
  const reduceMotion = useReducedMotion();
  const documentVisible = useDocumentVisible();
  const useStaticBackground = reduceMotion || !documentVisible;

  if (useStaticBackground) {
    return (
      <div
        className={cn('pointer-events-none absolute inset-0', fallbackClassName, className)}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden>
      <Particles id={id} className="h-full w-full" options={options} />
      {overlayClassName ? <div className={cn('absolute inset-0', overlayClassName)} /> : null}
    </div>
  );
}
