import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_MAP_TRAIL } from '@/lib/config/homeMapTrail';
import { paths } from '@/router/paths';

export default function HomeMapTrailFallback() {
  return (
    <div className="flex h-full min-h-[28rem] flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 text-center">
      <MapPin className="h-10 w-10 text-emerald-500/80" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-white">{HOME_MAP_TRAIL.noTokenTitle}</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{HOME_MAP_TRAIL.noTokenHint}</p>
      <p className="mt-1 font-mono text-xs text-slate-600">VITE_MAPBOX_TOKEN=pk.…</p>
      <Link
        to={paths.guides}
        className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        先浏览攻略库
      </Link>
    </div>
  );
}
