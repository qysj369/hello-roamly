const SECTION_SELECTOR = [
  '#main-content section',
  '#main-content .ft-fade-block',
].join(', ');

const HERO_SELECTOR = [
  '#main-content .hero',
  '#main-content .banner',
  '#main-content section[class*="hero"]',
  '#main-content section.rounded-2xl.bg-gradient-to-br',
  '#main-content .home-map-trail-hero-stack',
].join(', ');

const ACTIVE_CLASS = 'ft-active';
const IGNORE_ATTR = 'data-ft-ignore';

function shouldSkipElement(el: HTMLElement) {
  if (el.closest('.capsule-app-shell')) {
    return true;
  }
  if (el.hasAttribute(IGNORE_ATTR)) {
    return true;
  }
  if (el.classList.contains('sticky') || el.classList.contains('fixed')) {
    return true;
  }
  /* 首页地图 hero：首屏必须可见，不走滚动渐入 */
  if (
    el.classList.contains('home-map-trail-wall') ||
    el.getAttribute('aria-label') === '地图一键规划'
  ) {
    return true;
  }
  return false;
}

function collectSections() {
  return Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter(
    (el) => !shouldSkipElement(el),
  );
}

function findHero() {
  return document.querySelector<HTMLElement>(HERO_SELECTOR);
}

/** 路由切换后重扫 — 供 hook 在 observer 建立前预热首屏 */
export function runFutureTravelScrollFadeIn() {
  collectSections().forEach((el, index) => {
    if (el.classList.contains(ACTIVE_CLASS)) {
      return;
    }
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.72) {
      window.setTimeout(() => {
        el.classList.add(ACTIVE_CLASS);
      }, index * 90);
    }
  });
}

export function bindFutureTravelMotion(options?: { parallax?: boolean }) {
  const enableParallax = options?.parallax ?? window.innerWidth > 768;
  let heroEl = findHero();
  let observer: IntersectionObserver | null = null;
  let revealIndex = 0;

  const observeSections = () => {
    observer?.disconnect();
    revealIndex = 0;
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const el = entry.target as HTMLElement;
          const delay = revealIndex * 90;
          revealIndex += 1;
          window.setTimeout(() => {
            el.classList.add(ACTIVE_CLASS);
          }, delay);
          observer?.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    collectSections().forEach((el) => {
      if (!el.classList.contains(ACTIVE_CLASS)) {
        observer?.observe(el);
      }
    });
  };

  const onMouseMove = (event: MouseEvent) => {
    if (!enableParallax || window.innerWidth <= 768) {
      return;
    }
    heroEl ??= findHero();
    if (!heroEl) {
      return;
    }
    const x = (event.clientX - window.innerWidth / 2) / 60;
    const y = (event.clientY - window.innerHeight / 2) / 60;
    heroEl.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onResize = () => {
    heroEl = findHero();
    observeSections();
  };

  observeSections();

  window.addEventListener('resize', onResize, { passive: true });

  if (enableParallax) {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  return () => {
    observer?.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);
    if (heroEl) {
      heroEl.style.transform = '';
    }
  };
}
