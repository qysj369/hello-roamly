import { motion, useReducedMotion } from 'framer-motion';

import { Menu } from 'lucide-react';

import { useEffect, useState } from 'react';

import { NavLink, useMatch } from 'react-router-dom';

import HomeMapTrailControlPanel from '@/components/features/home/mapTrailWall/HomeMapTrailControlPanel';

import BrandSpiritSlogan from '@/components/layout/BrandSpiritSlogan';

import BrandDomainLabel from '@/components/layout/BrandDomainLabel';

import HeaderPrimaryNav from '@/components/layout/HeaderPrimaryNav';

import MobileNavDrawer from '@/components/layout/MobileNavDrawer';

import { useHomeMapPlanningBarStore } from '@/stores/homeMapPlanningBar/store';

import { useSiteChatStore } from '@/stores/siteChat/store';

import { BRAND_NAME } from '@/lib/config/brand';

import { motionTransition } from '@/lib/motion';

import { getRoutePrefetchHandlers } from '@/router/routePrefetch';

import { paths } from '@/router/paths';

import { PAGE_CONTAINER_PADDING_MATCHED } from '@/lib/layout/pageLayout';

import { TOUCH_TARGET_MIN } from '@/lib/layout/touchTargets';

import { cn } from '@/utils/cn';



/** 顶栏：蜗牛旅行 Logo + 精神口号；桌面横排导航 */

export default function PageHeader() {

  const reduceMotion = useReducedMotion();

  const [menuOpen, setMenuOpen] = useState(false);

  const hydrate = useSiteChatStore((state) => state.hydrate);

  const isHome = Boolean(useMatch({ path: paths.home, end: true }));

  const homeMapBar = useHomeMapPlanningBarStore((state) => state.bar);

  const showHeaderSearch = isHome && homeMapBar;



  useEffect(() => {

    hydrate();

  }, [hydrate]);



  useEffect(() => {

    if (!menuOpen) {

      return undefined;

    }

    const previous = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {

      document.body.style.overflow = previous;

    };

  }, [menuOpen]);



  function renderBrandMark() {

    return (

      <>

        <motion.span

          className={cn(

            'brand-logo__icon flex shrink-0 items-center justify-center text-lg shadow-sm',

            showHeaderSearch

              ? 'h-9 w-9 rounded-full border border-white/25 bg-white/15 text-xl backdrop-blur-sm sm:h-9 sm:w-9'

              : 'h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 sm:h-9 sm:w-9',

          )}

          whileHover={reduceMotion ? undefined : { scale: 1.04 }}

          whileTap={reduceMotion ? undefined : { scale: 0.96 }}

          aria-hidden

        >

          🐌

        </motion.span>

        <span className="min-w-0 text-left leading-tight">

          <span

            className={cn(

              'brand-logo__name block truncate text-sm font-bold tracking-tight sm:text-lg',

              showHeaderSearch
                ? 'text-white drop-shadow-[0_1px_4px_rgba(15,23,42,0.8)] max-sm:sr-only'
                : 'text-slate-900',

            )}

          >

            {BRAND_NAME}

          </span>

          <BrandSpiritSlogan
            variant={showHeaderSearch ? 'cockpit' : 'default'}
            className={cn(
              'mt-0.5',
              showHeaderSearch ? 'hidden md:block' : 'hidden sm:block',
            )}
          />
          {showHeaderSearch ? (
            <BrandDomainLabel className="mt-0.5 hidden text-slate-300 lg:block" />
          ) : (
            <BrandDomainLabel className="mt-0.5 sm:block" />
          )}
        </span>

      </>

    );

  }



  return (

    <>

      <motion.header

        className={cn(

          'sticky top-0 z-50 backdrop-blur-md',

          showHeaderSearch ? 'home-page-header--scenic-pad mb-0 py-0' : 'mb-4 border-b border-slate-200/90 py-2.5 sm:mb-5 sm:py-3',

          showHeaderSearch

            ? 'home-page-header--with-search home-page-header--scenic'

            : cn('bg-white shadow-sm', PAGE_CONTAINER_PADDING_MATCHED),

        )}

        initial={reduceMotion ? false : { opacity: 0, y: -8 }}

        animate={{ opacity: 1, y: 0 }}

        transition={motionTransition(reduceMotion)}

      >

        {showHeaderSearch ? (

          <div className="home-page-header__scenic-bg home-cockpit-header__backdrop" aria-hidden>

            <img

              src="/assets/home-cockpit-header-scape.jpg"

              alt=""

              className="home-cockpit-header__photo"

              decoding="async"
              fetchpriority="high"

            />

          </div>

        ) : null}

        <div
          className={cn(
            'home-page-header__row min-w-0 items-center gap-2 sm:gap-3',
            showHeaderSearch
              ? 'home-page-header__row--scenic grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 lg:gap-4'
              : 'flex',
          )}
        >
          {showHeaderSearch ? (
            <>
              <NavLink
                to={paths.home}
                {...getRoutePrefetchHandlers(paths.home)}
                aria-label={BRAND_NAME}
                className="brand-logo group flex shrink-0 items-center gap-2 self-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:gap-2.5"
              >
                {renderBrandMark()}
              </NavLink>
              <div className="home-page-header__toolkit-zone flex min-w-0 items-center justify-end justify-self-stretch self-center">
                <div className="home-page-header__toolkit flex max-w-full shrink-0 items-center gap-1 p-1 sm:gap-1.5 sm:p-1.5">
                  {homeMapBar ? (
                    <HomeMapTrailControlPanel placement="header" {...homeMapBar} />
                  ) : null}
                  <HeaderPrimaryNav className="home-page-header__nav hidden shrink-0 items-center lg:flex" />
                  <button
                    type="button"
                    className="home-page-header__menu-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white shadow-sm hover:bg-white/15 lg:hidden"
                    aria-expanded={menuOpen}
                    aria-controls="mobile-nav-drawer"
                    aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
                    onClick={() => setMenuOpen((open) => !open)}
                  >
                    <Menu className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to={paths.home}
                {...getRoutePrefetchHandlers(paths.home)}
                className="brand-logo group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 lg:flex-none"
              >
                {renderBrandMark()}
              </NavLink>
              <HeaderPrimaryNav className="hidden min-w-0 flex-1 justify-center lg:flex" />
              <button
                type="button"
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300/90 bg-white text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden',
                  TOUCH_TARGET_MIN,
                )}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
            </>
          )}
        </div>

      </motion.header>



      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

    </>

  );

}


