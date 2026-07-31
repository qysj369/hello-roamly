import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/router/paths';
import type { TravelBuddyNewPageState } from '@/types/router-state';
import { cn } from '@/utils/cn';

type GuideTravelBuddyFabProps = {
  destination: string;
  className?: string;
};

export default function GuideTravelBuddyFab({ destination, className }: GuideTravelBuddyFabProps) {
  const state: TravelBuddyNewPageState = { destination };

  return (
    <Link
      to={paths.travelBuddyNew}
      state={state}
      className={cn(
        'fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full',
        'border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg',
        'hover:bg-emerald-50 sm:bottom-6',
        className,
      )}
      aria-label={`寻找同路蜗友：${destination}`}
    >
      <Users className="h-4 w-4" aria-hidden />
      寻找同路蜗友
    </Link>
  );
}
