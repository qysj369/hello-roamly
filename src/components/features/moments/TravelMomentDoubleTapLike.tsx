import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';

/** 双击间隔上限（ms），略大于 iOS 系统双击阈值，减少误触 */
const DOUBLE_TAP_MS = 320;
const BURST_DURATION_MS = 900;

type HeartBurst = {
  id: number;
  x: number;
  y: number;
};

export type TravelMomentDoubleTapLikeProps = {
  enabled?: boolean;
  isLiked?: boolean;
  onLike?: () => void;
  children: ReactNode;
  className?: string;
};

function getTapPoint(
  event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
  element: HTMLElement,
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  if ('touches' in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0]!;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  const mouseEvent = event as React.MouseEvent<HTMLElement>;
  return { x: mouseEvent.clientX - rect.left, y: mouseEvent.clientY - rect.top };
}

/** 双击媒体区域点赞 + 心形弹出动画（Instagram 风格） */
export default function TravelMomentDoubleTapLike({
  enabled = false,
  isLiked = false,
  onLike,
  children,
  className,
}: TravelMomentDoubleTapLikeProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ time: number } | null>(null);
  const touchHandledRef = useRef(false);
  const [bursts, setBursts] = useState<HeartBurst[]>([]);

  const spawnHeart = useCallback(
    (x: number, y: number) => {
      if (reduceMotion) {
        return;
      }
      const id = Date.now() + Math.random();
      setBursts((prev) => [...prev, { id, x, y }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((burst) => burst.id !== id));
      }, BURST_DURATION_MS);
    },
    [reduceMotion],
  );

  const handleDoubleTapAt = useCallback(
    (x: number, y: number) => {
      spawnHeart(x, y);
      // 已点赞时仅播动画，不重复调 API
      if (!isLiked) {
        onLike?.();
      }
    },
    [isLiked, onLike, spawnHeart],
  );

  const registerTap = useCallback(
    (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (!enabled || !containerRef.current) {
        return;
      }

      const { x, y } = getTapPoint(event, containerRef.current);
      const now = Date.now();

      if (lastTapRef.current && now - lastTapRef.current.time < DOUBLE_TAP_MS) {
        event.preventDefault();
        lastTapRef.current = null;
        handleDoubleTapAt(x, y);
        return;
      }

      lastTapRef.current = { time: now };
    },
    [enabled, handleDoubleTapAt],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled || !containerRef.current) {
        return;
      }
      const { x, y } = getTapPoint(event, containerRef.current);
      handleDoubleTapAt(x, y);
    },
    [enabled, handleDoubleTapAt],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      // 移动端 touch 后会合成 click，标记已处理避免同一次双击触发两次点赞
      touchHandledRef.current = true;
      registerTap(event);
      window.setTimeout(() => {
        touchHandledRef.current = false;
      }, 400);
    },
    [registerTap],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (touchHandledRef.current) {
        return;
      }
      registerTap(event);
    },
    [registerTap],
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative select-none', enabled && 'cursor-pointer', className)}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
      role={enabled ? 'button' : undefined}
      aria-label={enabled ? SNAIL_GLOBAL_COPY.doubleTapLike : undefined}
    >
      {children}

      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.span
            key={burst.id}
            className="pointer-events-none absolute z-20"
            style={{ left: burst.x, top: burst.y }}
            initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1.15, 1],
              opacity: [0, 1, 0],
            }}
            exit={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            <Heart
              className="h-20 w-20 fill-white text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              strokeWidth={0}
            />
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
