import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import PrimaryNavIcon from '@/components/layout/PrimaryNavIcon';
import { useI18n } from '@/i18n/useI18n';
import { useSiteChatStore } from '@/stores/siteChat/store';
import { PAGE_CONTAINER_MAX_WIDTH } from '@/lib/layout/pageLayout';
import { cn } from '@/utils/cn';
import { getRoutePrefetchHandlers } from '@/router/routePrefetch';
import { bottomNavItems, paths } from '@/router/paths';

export default function BottomNav() {
  const { messages: t } = useI18n();
  const hydrate = useSiteChatStore((state) => state.hydrate);
  const unreadTotal = useSiteChatStore((state) => state.getTotalUnread());

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const labelByPath = useMemo(
    () =>
      ({
        [paths.home]: t.tabs.home,
        [paths.ai]: t.tabs.advisor,
        [paths.profile]: t.tabs.me,
      }) as Record<string, string>,
    [t],
  );

  return (
    <nav
      aria-label={t.heroExtra.bottomNav}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div
        className={cn(
          'mx-auto flex items-stretch justify-around px-0.5 pt-1',
          PAGE_CONTAINER_MAX_WIDTH,
        )}
      >
        {bottomNavItems.map((item) => {
          const showUnread = item.to === paths.messages && unreadTotal > 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              {...getRoutePrefetchHandlers(item.to)}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors sm:min-h-0 sm:px-2 sm:text-[11px]',
                  isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800',
                )
              }
            >
              <span className="relative">
                <PrimaryNavIcon to={item.to} />
                {showUnread && (
                  <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-violet-600 px-0.5 text-[8px] font-bold leading-none text-white">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </span>
              <span className="truncate">{labelByPath[item.to] ?? item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
