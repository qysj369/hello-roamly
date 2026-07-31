import { MapPin } from 'lucide-react';

/** 纯 CSS 轨道视觉，暗示地图 / LBS 能力 */
export default function HomeOrbitVisual() {
  return (
    <div className="pointer-events-none relative mx-auto mt-2 h-36 w-36 shrink-0" aria-hidden>
      <div className="home-orbit-ring absolute inset-0 rounded-full border border-cyan-400/25" />
      <div className="home-orbit-ring-delayed absolute inset-3 rounded-full border border-violet-400/20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
          <MapPin className="h-6 w-6 text-cyan-300" />
        </div>
      </div>
      <span className="home-orbit-dot home-orbit-dot-1 absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
      <span className="home-orbit-dot home-orbit-dot-2 absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-violet-300" />
      <span className="home-orbit-dot home-orbit-dot-3 absolute bottom-3 left-4 h-1.5 w-1.5 rounded-full bg-emerald-300" />
    </div>
  );
}
