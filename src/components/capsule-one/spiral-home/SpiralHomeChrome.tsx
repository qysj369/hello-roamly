import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SnailBrandLogo from '@/components/brand/SnailBrandLogo';
import { paths } from '@/router/paths';
import '@/styles/snail-brand-logo.css';

export const SPIRAL_HOME_TITLE = '身未动，心已远';
export const SPIRAL_HOME_SUBTITLE = '低空飞越真实大地，让风景灵感直接生成行程';
export const SPIRAL_HOME_CTA = '开启低空漫游 >';

export const SPIRAL_HOME_NAV = [
  { label: '首页', to: paths.home, end: true },
  { label: '探索品牌', to: paths.about },
  { label: '蜗牛旅行', to: paths.inspire },
  { label: '旅人故事', to: paths.contact },
  { label: '深度漫游', to: paths.cities },
  { label: '帮助中心', to: paths.feedback },
] as const;

type SpiralHomeChromeProps = {
  onLaunch: () => void;
  onSearch: () => void;
  onExploreRoutes: () => void;
};

export default function SpiralHomeChrome({
  onLaunch,
  onSearch,
  onExploreRoutes,
}: SpiralHomeChromeProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="spiral-home__chrome">
      <header className="spiral-home__nav">
        <Link to={paths.home} className="spiral-home__brand" aria-label="蜗牛旅行首页">
          <SnailBrandLogo size={34} variant="compact" />
        </Link>

        <nav className="spiral-home__menu" aria-label="主导航">
          {SPIRAL_HOME_NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={'end' in item ? item.end : false}
              className="spiral-home__menu-link"
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" className="spiral-home__menu-link" onClick={onExploreRoutes}>
            探索航线
          </button>
        </nav>

        <div className="spiral-home__tools">
          <button type="button" className="spiral-home__search" aria-label="搜索" onClick={onSearch}>
            <Search size={16} strokeWidth={2.2} />
          </button>
          <button type="button" className="spiral-home__soms" onClick={onSearch}>
            UI SOMIS
          </button>
        </div>

        <button
          type="button"
          className="spiral-home__burger"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {menuOpen ? (
        <div className="spiral-home__drawer" role="dialog" aria-label="站点菜单">
          {SPIRAL_HOME_NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={'end' in item ? item.end : false}
              className="spiral-home__drawer-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="spiral-home__drawer-link"
            onClick={() => {
              setMenuOpen(false);
              onExploreRoutes();
            }}
          >
            探索航线
          </button>
          <button
            type="button"
            className="spiral-home__drawer-link"
            onClick={() => {
              setMenuOpen(false);
              onSearch();
            }}
          >
            搜索
          </button>
        </div>
      ) : null}

      <section className="spiral-home__hero">
        <h1 className="spiral-home__title">{SPIRAL_HOME_TITLE}</h1>
        <p className="spiral-home__subtitle">{SPIRAL_HOME_SUBTITLE}</p>
        <button type="button" className="spiral-home__cta" onClick={onLaunch}>
          {SPIRAL_HOME_CTA}
        </button>
      </section>
    </div>
  );
}
