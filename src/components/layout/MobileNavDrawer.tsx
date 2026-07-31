import { Dialog, DialogPanel } from '@headlessui/react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeaderPrimaryNav from '@/components/layout/HeaderPrimaryNav';
import { drawerMoreItems } from '@/lib/layout/appMoreNav';
import { getRoutePrefetchHandlers } from '@/router/routePrefetch';
import { TOUCH_MENU_ITEM } from '@/lib/layout/touchTargets';
import { cn } from '@/utils/cn';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/** 移动端汉堡菜单：主导航 + 补充「更多」 */
export default function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60] lg:hidden">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          id="mobile-nav-drawer"
          className="flex h-full w-full max-w-sm flex-col border-l border-slate-200/90 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">菜单</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="关闭菜单"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <HeaderPrimaryNav
              orientation="vertical"
              className="flex flex-col gap-1"
              onNavigate={onClose}
            />

            <p className="mb-2 mt-6 px-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              更多
            </p>
            <ul className="flex flex-col gap-1">
              {drawerMoreItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    {...getRoutePrefetchHandlers(item.to)}
                    onClick={onClose}
                    className={cn(TOUCH_MENU_ITEM, 'text-slate-700 hover:bg-slate-50')}
                  >
                    <span className="text-base" aria-hidden>
                      {item.emoji}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
