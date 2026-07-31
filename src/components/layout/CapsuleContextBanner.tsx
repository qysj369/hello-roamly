import { Compass, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '@/router/paths';

type CapsuleContextBannerProps = {
  destination?: string;
  dream?: string;
  source?: 'capsule_one' | 'home_map' | 'plan_result' | 'direct';
  variant?: 'discover' | 'guides' | 'about';
};

/** 从 Capsule / AI 带入目的地时，在内容页展示延续横幅 */
export default function CapsuleContextBanner({
  destination,
  dream,
  source,
  variant = 'discover',
}: CapsuleContextBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const label = destination?.trim() || dream?.trim();

  if (dismissed || !label) {
    return null;
  }

  const fromCapsule = source === 'capsule_one';

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${
        fromCapsule
          ? 'border-cyan-400/35 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-cyan-50'
          : 'border-cyan-400/40 bg-gradient-to-r from-cyan-50 to-violet-50 text-slate-800'
      }`}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className={`absolute right-3 top-3 rounded-lg p-1 ${
          fromCapsule
            ? 'text-cyan-300/60 hover:bg-white/10 hover:text-cyan-100'
            : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
        }`}
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <p
        className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
          fromCapsule ? 'text-cyan-300/80' : 'text-cyan-700'
        }`}
      >
        <Compass className="h-3.5 w-3.5" aria-hidden />
        {fromCapsule ? 'Capsule One 注入' : 'AI 规划上下文'}
      </p>

      <p className={`mt-2 pr-8 text-sm ${fromCapsule ? 'text-cyan-50/90' : 'text-slate-800'}`}>
        {variant === 'about' ? (
          <>
            你刚从 <span className="font-medium text-cyan-300">Capsule One</span> 驾驶舱出发，
            正在探索 <span className="font-medium text-cyan-300">{label}</span> 相关灵感。
          </>
        ) : (
          <>
            已带入目的地
            <span className={`font-medium ${fromCapsule ? 'text-cyan-200' : 'text-violet-700'}`}>
              「{label}」
            </span>
            ，下方内容已为你聚焦相关攻略与瞬间。
          </>
        )}
      </p>

      {dream && destination && dream !== destination ? (
        <p className={`mt-1 text-xs ${fromCapsule ? 'text-cyan-200/70' : 'text-slate-600'}`}>
          旅程构想：{dream}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {variant !== 'discover' ? (
          <Link
            to={paths.discover}
            state={{ destination: label, fromCapsule }}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              fromCapsule
                ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/30 hover:bg-cyan-500/30'
                : 'bg-white text-cyan-800 ring-1 ring-cyan-200 hover:bg-cyan-50'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            去发现页看看
          </Link>
        ) : null}
        {variant !== 'guides' ? (
          <Link
            to={paths.guides}
            state={{ aiDream: dream ?? label, aiPlan: destination ? { destination, days: 5, budget: '灵活' } : undefined }}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              fromCapsule
                ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/30 hover:bg-cyan-500/30'
                : 'bg-white text-violet-800 ring-1 ring-violet-200 hover:bg-violet-50'
            }`}
          >
            查看攻略库
          </Link>
        ) : null}
        {fromCapsule ? (
          <Link
            to={paths.home}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-cyan-200/80 ring-1 ring-cyan-400/20 hover:bg-white/5"
          >
            返回驾驶舱
          </Link>
        ) : null}
      </div>
    </section>
  );
}
