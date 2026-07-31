import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { homeCockpitMoreItems } from '@/lib/layout/appMoreNav';
import { getRoutePrefetchHandlers } from '@/router/routePrefetch';
import { cn } from '@/utils/cn';

/** Capsule One 右上角 — 站点功能入口 */
export default function CapsuleNavMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="capsule-nav-menu">
      <button
        type="button"
        className={cn('capsule-hud-btn', open && 'capsule-hud-btn--on')}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? '关闭菜单' : '打开站点菜单'}
        title="站点菜单"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open ? (
        <div className="capsule-nav-menu__panel" role="menu" aria-label="站点导航">
          <p className="capsule-nav-menu__title">站点导航</p>
          <ul className="capsule-nav-menu__list">
            {homeCockpitMoreItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  role="menuitem"
                  {...getRoutePrefetchHandlers(item.to)}
                  onClick={() => setOpen(false)}
                  className="capsule-nav-menu__link"
                >
                  <span className="capsule-nav-menu__emoji" aria-hidden>
                    {item.emoji}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
