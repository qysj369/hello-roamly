import { X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import '@/styles/plan-result-scenes.css';

type PlanResultSceneImageProps = {
  src: string;
  alt: string;
  /** cover = 顶部大图；spot = 景点配图 */
  variant?: 'cover' | 'spot';
  className?: string;
};

/** 实景图：圆角 16px、无边框、点击放大；移动端自适应 */
export default function PlanResultSceneImage({
  src,
  alt,
  variant = 'spot',
  className,
}: PlanResultSceneImageProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={cn(
          'plan-result-scene-img group block w-full overflow-hidden rounded-[16px] border-0 p-0 text-left',
          'shadow-[var(--theme-shadow-sm)] transition duration-300 ease-out',
          'hover:shadow-[var(--theme-shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
          className,
        )}
        onClick={() => setOpen(true)}
        aria-label={`查看大图：${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading={variant === 'cover' ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'block w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]',
            variant === 'cover'
              ? 'aspect-[16/9] max-h-[240px] sm:max-h-[280px]'
              : 'aspect-[4/3] max-h-[220px]',
          )}
        />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/72 p-4 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-700 shadow-md"
                aria-label="关闭大图"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <p id={titleId} className="sr-only">
                {alt}
              </p>
              <img
                src={src}
                alt={alt}
                className="max-h-[88vh] max-w-full rounded-[16px] object-contain shadow-[var(--theme-shadow-md)]"
                onClick={(event) => event.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
