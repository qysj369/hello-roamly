import { useEffect, useRef, useState } from 'react';

export type UseIntersectionInViewOptions = {
  rootMargin?: string;
  threshold?: number;
  /** 为 true 时始终视为在视口内（用于首屏 priority 图） */
  disabled?: boolean;
};

export function useIntersectionInView({
  rootMargin = '240px',
  threshold = 0.01,
  disabled = false,
}: UseIntersectionInViewOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState<boolean>(disabled);

  useEffect(() => {
    if (disabled) {
      setIsInView(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled, rootMargin, threshold]);

  return { ref, isInView };
}
