import { useCallback, useEffect, useRef, type RefObject } from 'react';

const DRAG_THRESHOLD_PX = 5;

function isInteractivePointerTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest('button, a, input, textarea, select, label, [role="button"]'));
}

export type HorizontalScrollController = {
  ref: RefObject<HTMLDivElement>;
  scrollBy: (delta: number) => void;
};

/** 横向列表：鼠标拖拽 + 滚轮转横向 + 触摸滑动 */
export function useHorizontalDragScroll(): HorizontalScrollController {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const scrollBy = useCallback((delta: number) => {
    ref.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const canScroll = () => el.scrollWidth > el.clientWidth + 1;

    const finishDrag = (pointerId: number) => {
      const drag = dragRef.current;
      if (!drag.active) {
        return;
      }
      drag.active = false;
      el.classList.remove('is-dragging');
      try {
        if (el.hasPointerCapture(pointerId)) {
          el.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore release errors
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !canScroll() || isInteractivePointerTarget(event.target)) {
        return;
      }
      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: el.scrollLeft,
        moved: false,
      };
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) {
        return;
      }

      const delta = event.clientX - drag.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
        el.classList.add('is-dragging');
      }

      if (drag.moved) {
        event.preventDefault();
        el.scrollLeft = drag.scrollLeft - delta;
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      finishDrag(event.pointerId);
    };

    const onClickCapture = (event: MouseEvent) => {
      if (dragRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.moved = false;
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!canScroll()) {
        return;
      }
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) {
        return;
      }
      event.preventDefault();
      el.scrollLeft += delta;
    };

    const moveOptions: AddEventListenerOptions = { passive: false };
    const capture = true;

    el.addEventListener('pointerdown', onPointerDown, capture);
    el.addEventListener('pointermove', onPointerMove, moveOptions);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('click', onClickCapture, capture);
    el.addEventListener('wheel', onWheel, moveOptions);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown, capture);
      el.removeEventListener('pointermove', onPointerMove, moveOptions);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('click', onClickCapture, capture);
      el.removeEventListener('wheel', onWheel, moveOptions);
    };
  }, []);

  return { ref: ref as RefObject<HTMLDivElement>, scrollBy };
}
