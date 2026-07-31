import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { EARTH_SPIN_SPEED } from '@/components/capsule-one/earthMotion';

const DRAG_SENSITIVITY = 0.0046;
const VELOCITY_SMOOTH = 0.35;
const INERTIA_DAMPING = 5.2;
const IDLE_AUTO_DELAY_MS = 3500;

type UseEarthGlazeDragOptions = {
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enabled?: boolean;
  canAutoRotate?: () => boolean;
};

export function useEarthGlazeDrag(
  groupRef: RefObject<THREE.Group | null>,
  {
    autoRotate = true,
    autoRotateSpeed = EARTH_SPIN_SPEED * 0.45,
    enabled = true,
    canAutoRotate = () => true,
  }: UseEarthGlazeDragOptions = {},
) {
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastMoveAtRef = useRef(0);
  const velocityRef = useRef(0);
  const idleAfterRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const applyDragDelta = useCallback(
    (clientX: number) => {
      if (!groupRef.current || !enabled || !draggingRef.current) {
        return;
      }

      const deltaX = clientX - lastPointerXRef.current;
      if (Math.abs(deltaX) < 0.01) {
        return;
      }

      const now = performance.now();
      const dtSeconds = Math.max((now - lastMoveAtRef.current) / 1000, 0.001);
      const deltaRot = deltaX * DRAG_SENSITIVITY;

      groupRef.current.rotation.y += deltaRot;
      lastPointerXRef.current = clientX;
      lastMoveAtRef.current = now;

      if (Math.abs(deltaX) > 0.8) {
        movedRef.current = true;
      }

      const instantVelocity = deltaRot / dtSeconds;
      velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, instantVelocity, VELOCITY_SMOOTH);
      idleAfterRef.current = performance.now() + IDLE_AUTO_DELAY_MS;
    },
    [enabled, groupRef],
  );

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    pointerIdRef.current = null;
  }, []);

  useEffect(() => {
    const onWindowPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      applyDragDelta(event.clientX);
    };

    const onWindowPointerUp = (event: PointerEvent) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) {
        return;
      }
      stopDrag();
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [applyDragDelta, stopDrag]);

  const onPointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!enabled) {
        return;
      }

      event.stopPropagation();
      draggingRef.current = true;
      movedRef.current = false;
      pointerIdRef.current = event.pointerId;
      lastPointerXRef.current = event.clientX;
      lastMoveAtRef.current = performance.now();
      velocityRef.current = 0;
      idleAfterRef.current = performance.now() + IDLE_AUTO_DELAY_MS;
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!draggingRef.current || pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.stopPropagation();
      applyDragDelta(event.clientX);
    },
    [applyDragDelta],
  );

  const endDrag = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.stopPropagation();
      stopDrag();
    },
    [stopDrag],
  );

  const shouldSkipClick = useCallback(() => movedRef.current, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !enabled) {
      return;
    }

    if (!draggingRef.current && Math.abs(velocityRef.current) > 0.00004) {
      groupRef.current.rotation.y += velocityRef.current * delta;
      velocityRef.current *= Math.exp(-INERTIA_DAMPING * delta);
      idleAfterRef.current = performance.now() + IDLE_AUTO_DELAY_MS;
    } else if (
      autoRotate &&
      !draggingRef.current &&
      canAutoRotate() &&
      performance.now() > idleAfterRef.current
    ) {
      groupRef.current.rotation.y += delta * autoRotateSpeed;
    }
  });

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerLeave: endDrag,
    shouldSkipClick,
    isDragging: draggingRef,
  };
}
