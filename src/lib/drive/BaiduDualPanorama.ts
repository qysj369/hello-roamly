import { headingDelta } from '@/lib/drive/pickForwardLink';

export type DualPanoramaEngine = {
  getActive: () => BMapPanoramaInstance | null;
  getFrontSlot: () => HTMLElement;
  getLinks: () => BMapPanoramaLink[];
  getPovHeading: () => number;
  /** 当前画面缓慢前推（模拟开车往前走） */
  creepForward: (peakScale: number, durationMs: number) => Promise<void>;
  resetCreep: () => void;
  /** 后台预载下一全景点，再交叉淡入 */
  advanceTo: (link: BMapPanoramaLink, crossfadeMs: number) => Promise<boolean>;
  destroy: () => void;
};

type CreateDualPanoramaOptions = {
  BMapNS: typeof BMap;
  slotA: HTMLElement;
  slotB: HTMLElement;
  initial: BMapPanoramaLocationResult;
  linksControl?: boolean;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitLoaded(pano: BMapPanoramaInstance, minHoldMs: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    let eventSeen = false;
    let done = false;

    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      pano.removeEventListener('position_changed', onEvent);
      pano.removeEventListener('links_changed', onEvent);
      window.clearInterval(poll);
      resolve();
    };

    const tick = () => {
      if (eventSeen && performance.now() - started >= minHoldMs) {
        finish();
      }
      if (performance.now() - started >= timeoutMs) {
        finish();
      }
    };

    const onEvent = () => {
      eventSeen = true;
      tick();
    };

    pano.addEventListener('position_changed', onEvent);
    pano.addEventListener('links_changed', onEvent);
    const poll = window.setInterval(tick, 60);
  });
}

function createPano(
  BMapNS: typeof BMap,
  container: HTMLElement,
  linksControl: boolean,
): BMapPanoramaInstance {
  const pano = new BMapNS.Panorama(container, {
    linksControl,
    navigationControl: false,
    albumsControl: false,
    indoorSceneSwitchControl: false,
  });
  pano.disableScrollWheelZoom?.();
  return pano;
}

/** 双缓冲百度全景 + 前推蠕动 */
export function createDualPanoramaEngine({
  BMapNS,
  slotA,
  slotB,
  initial,
  linksControl = false,
}: CreateDualPanoramaOptions): DualPanoramaEngine {
  const slots = [slotA, slotB];
  const panos = [
    createPano(BMapNS, slotA, linksControl),
    createPano(BMapNS, slotB, linksControl),
  ];

  let front = 0;
  let busy = false;
  let destroyed = false;

  const showFront = () => {
    slots[front].classList.add('is-front');
    slots[front].classList.remove('is-back');
    slots[1 - front].classList.add('is-back');
    slots[1 - front].classList.remove('is-front');
  };

  const resetSlotTransform = (slot: HTMLElement) => {
    slot.style.transition = 'none';
    slot.style.transform = 'scale(1)';
    // 强制回流，便于下一段重新开启动画
    void slot.offsetWidth;
  };

  showFront();
  resetSlotTransform(slotA);
  resetSlotTransform(slotB);

  if (initial.position) {
    panos[front].setPosition(new BMapNS.Point(initial.position.lng, initial.position.lat));
  } else {
    panos[front].setId(initial.id);
  }
  panos[front].setPov({
    heading: initial.tiles?.centerHeading ?? 0,
    pitch: 0,
  });

  return {
    getActive: () => (destroyed ? null : panos[front]),
    getFrontSlot: () => slots[front],
    getLinks: () => (destroyed ? [] : panos[front].getLinks?.() ?? []),
    getPovHeading: () => panos[front].getPov?.()?.heading ?? 0,

    async creepForward(peakScale, durationMs) {
      if (destroyed) {
        return;
      }
      const slot = slots[front];
      resetSlotTransform(slot);
      slot.style.transition = `transform ${Math.max(800, durationMs)}ms cubic-bezier(0.22, 0.12, 0.25, 1)`;
      slot.style.transform = `scale(${peakScale})`;
      await wait(Math.max(800, durationMs));
    },

    resetCreep() {
      if (destroyed) {
        return;
      }
      resetSlotTransform(slots[front]);
      resetSlotTransform(slots[1 - front]);
    },

    async advanceTo(link, crossfadeMs) {
      if (destroyed || busy || !link?.id) {
        return false;
      }
      busy = true;
      const back = 1 - front;
      const backPano = panos[back];
      const backSlot = slots[back];
      const frontSlot = slots[front];

      try {
        resetSlotTransform(backSlot);

        const heading = panos[front].getPov?.()?.heading ?? 0;
        if (headingDelta(heading, link.heading) >= 12) {
          backPano.setPov({ heading: link.heading, pitch: 0 });
        } else {
          backPano.setPov({ heading, pitch: 0 });
        }

        backPano.setId(link.id);
        await waitLoaded(backPano, 700, 4200);
        if (destroyed) {
          return false;
        }

        const fadeMs = Math.max(500, crossfadeMs);
        backSlot.style.transitionDuration = `${fadeMs}ms`;
        frontSlot.style.transitionDuration = `${fadeMs}ms`;
        // 叠化时同时把前层从放大态收回，后层从 1 淡入，减轻跳切感
        frontSlot.style.transition = `opacity ${fadeMs}ms ease, transform ${fadeMs}ms ease`;
        backSlot.style.transition = `opacity ${fadeMs}ms ease, transform ${fadeMs}ms ease`;
        backSlot.style.transform = 'scale(1)';
        frontSlot.style.transform = 'scale(1.02)';

        backSlot.classList.add('is-fading-in');
        frontSlot.classList.add('is-fading-out');
        await wait(fadeMs + 40);
        if (destroyed) {
          return false;
        }

        front = back;
        showFront();
        slots[0].classList.remove('is-fading-in', 'is-fading-out');
        slots[1].classList.remove('is-fading-in', 'is-fading-out');
        resetSlotTransform(slots[0]);
        resetSlotTransform(slots[1]);
        return true;
      } catch {
        return false;
      } finally {
        busy = false;
      }
    },

    destroy() {
      destroyed = true;
      slots.forEach((slot) => {
        slot.classList.remove('is-front', 'is-back', 'is-fading-in', 'is-fading-out');
        slot.style.transition = '';
        slot.style.transform = '';
        slot.innerHTML = '';
      });
    },
  };
}
