import { Clock, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandSpiritSlogan from '@/components/layout/BrandSpiritSlogan';
import { BRAND_NAME } from '@/lib/config/brand';
import { authLoginNav, homeCockpitMoreItems } from '@/lib/layout/appMoreNav';
import { paths, profileSavedPlansPath } from '@/router/paths';
import { usePlanHistoryUiStore } from '@/stores/planHistory/uiStore';
import { cn } from '@/utils/cn';

const navButtonClass = cn(
  'inline-flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-white transition',
  'drop-shadow-[0_1px_3px_rgba(15,23,42,0.75)] hover:text-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300',
  'sm:flex-row sm:gap-1.5 sm:px-2',
);

/** 首页驾驶舱顶栏 — 品牌 + 历史/我的方案/登录 + 更多 */
export default function HomeCockpitHeader() {
  const openHistory = usePlanHistoryUiStore((state) => state.openHistory);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) {
      return undefined;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [moreOpen]);

  return (
    <header
      className={cn(
        'home-cockpit-header fixed inset-x-0 top-0 z-[80] flex h-24 items-center justify-between gap-3',
        'px-4 text-white sm:px-6',
      )}
    >
      <div className="home-cockpit-header__backdrop" aria-hidden>
        <img
          src="/assets/home-cockpit-header-scape.jpg"
          alt=""
          className="home-cockpit-header__photo"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <Link
        to={paths.home}
        className="flex min-w-0 items-center gap-3 rounded-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-xl shadow-md backdrop-blur-sm"
          aria-hidden
        >
          🐌
        </span>
        <span className="min-w-0 text-left leading-tight">
          <span className="block truncate text-xl font-bold text-white drop-shadow-[0_1px_4px_rgba(15,23,42,0.8)]">{BRAND_NAME}</span>
          <BrandSpiritSlogan variant="cockpit" className="mt-0.5" />
        </span>
      </Link>

      <nav aria-label="首页功能入口" className="flex shrink-0 items-center gap-0.5 sm:gap-2">
        <button type="button" onClick={openHistory} className={navButtonClass} aria-label="规划历史" title="规划历史">
          <Clock className="h-4 w-4" aria-hidden />
          <span className="hidden text-xs font-medium sm:inline sm:text-sm">历史</span>
        </button>

        <Link to={profileSavedPlansPath()} className={navButtonClass}>
          <span className="text-lg leading-none sm:text-base" aria-hidden>
            🗂️
          </span>
          <span className="hidden text-xs font-medium sm:inline sm:text-sm">我的方案</span>
        </Link>

        <Link to={authLoginNav.to} state={authLoginNav.state} className={navButtonClass}>
          <span className="text-lg leading-none sm:text-base" aria-hidden>
            👤
          </span>
          <span className="text-xs font-medium sm:text-sm">
            <span className="sm:hidden">{authLoginNav.shortLabel}</span>
            <span className="hidden sm:inline">{authLoginNav.label}</span>
          </span>
        </Link>

        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen((current) => !current)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className={cn(navButtonClass, moreOpen && 'text-emerald-300')}
          >
            <Menu className="h-4 w-4" aria-hidden />
            <span className="hidden text-xs font-medium sm:inline sm:text-sm">更多</span>
          </button>

          {moreOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+0.35rem)] z-[90] max-h-[min(70dvh,22rem)] min-w-[11rem] overflow-y-auto rounded-xl border border-white/10 bg-slate-950/95 py-1 shadow-xl backdrop-blur-md"
            >
              {homeCockpitMoreItems.map((item) => (
                <Link
                  key={item.to}
                  role="menuitem"
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/10 hover:text-emerald-200"
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
