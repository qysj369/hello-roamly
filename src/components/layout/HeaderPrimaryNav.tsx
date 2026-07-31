import { NavLink } from 'react-router-dom';
import PrimaryNavIcon from '@/components/layout/PrimaryNavIcon';
import { useSiteChatStore } from '@/stores/siteChat/store';
import { headerNavItems, paths, type PrimaryNavItem } from '@/router/paths';
import { getRoutePrefetchHandlers } from '@/router/routePrefetch';
import { TOUCH_MENU_ITEM } from '@/lib/layout/touchTargets';
import { cn } from '@/utils/cn';

type HeaderPrimaryNavProps = {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
  /** 默认顶栏（无首页）；底栏场景传 bottomNavItems */
  items?: readonly PrimaryNavItem[];
};

/** 主导航：桌面横排 / 移动抽屉纵排 */
export default function HeaderPrimaryNav({
  className,
  orientation = 'horizontal',
  onNavigate,
  items = headerNavItems,
}: HeaderPrimaryNavProps) {
  const unreadTotal = useSiteChatStore((state) => state.getTotalUnread());
  const isVertical = orientation === 'vertical';

  return (
    <nav
      className={cn(
        isVertical ? 'flex flex-col' : 'flex flex-nowrap items-center gap-0.5',
        className,
      )}
      aria-label="主导航"
    >
      {items.map((item) => {
        const showUnread = item.to === paths.messages && unreadTotal > 0;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            {...getRoutePrefetchHandlers(item.to)}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                isVertical
                  ? cn(
                      TOUCH_MENU_ITEM,
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-50',
                    )
                  : cn(
                      'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    ),
              )
            }
          >
            <span className="relative">
              <PrimaryNavIcon to={item.to} className={isVertical ? 'h-5 w-5' : 'h-4 w-4'} />
              {showUnread && (
                <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-violet-600 px-0.5 text-[8px] font-bold leading-none text-white">
                  {unreadTotal > 9 ? '9+' : unreadTotal}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
