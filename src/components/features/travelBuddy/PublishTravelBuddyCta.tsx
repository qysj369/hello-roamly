import { Link } from 'react-router-dom';
import { TRAVEL_BUDDY_BRAND } from '@/lib/config/travelBuddy';
import { paths } from '@/router/paths';

export default function PublishTravelBuddyCta() {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-center">
      <p className="text-sm font-semibold text-slate-900">是否寻找同路旅伴？</p>
      <p className="mt-1 text-xs text-slate-600">
        去「{TRAVEL_BUDDY_BRAND.name}」发布需求，让蜗友主动联系你
      </p>
      <Link
        to={paths.travelBuddyNew}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50"
      >
        去 {TRAVEL_BUDDY_BRAND.name} 发布
      </Link>
    </div>
  );
}
