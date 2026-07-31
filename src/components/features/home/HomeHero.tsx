import { BookOpen, Sparkles } from 'lucide-react';
import HomeHeroBrandHeader from '@/components/features/home/HomeHeroBrandHeader';
import MotionLink from '@/components/motion/MotionLink';
import { SLIME_TRAIL_PUBLISHER } from '@/lib/guides/slimeTrail';
import { paths } from '@/router/paths';
type HomeHeroProps = {
  guideCount: number;
  structuredCount?: number;
};

/** 首页 Hero — 攻略库入口定位 */
export default function HomeHero({ guideCount, structuredCount = 0 }: HomeHeroProps) {
  return (
    <section
      className="home-tech-hero relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-5 text-white shadow-lg sm:p-8"
      aria-labelledby="home-brand-slogan"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <HomeHeroBrandHeader />

        <div className="w-full max-w-lg space-y-4">
          <p className="text-sm font-medium text-emerald-100/90">真实花费与行程，从这里开始慢旅行</p>
          <dl className="grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <dt className="text-[10px] uppercase tracking-wider text-emerald-200/80">攻略总数</dt>
              <dd className="mt-1 text-2xl font-bold text-white">{guideCount}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <dt className="text-[10px] uppercase tracking-wider text-emerald-200/80">结构化攻略</dt>
              <dd className="mt-1 text-2xl font-bold text-white">{structuredCount}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <MotionLink
              to={paths.guides}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-base font-bold text-white shadow-lg hover:brightness-110 sm:flex-none sm:min-w-[12rem]"
            >
              <BookOpen className="h-5 w-5" aria-hidden />
              查看全部攻略            </MotionLink>
            <MotionLink
              to={paths.aiSnail}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 sm:flex-none"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              AI 生成攻略            </MotionLink>
          </div>

          <p className="text-center text-[11px] text-emerald-100/70">
            或发布你的 {SLIME_TRAIL_PUBLISHER.title} →{' '}
            <MotionLink to={paths.guidesPublish} className="font-semibold underline hover:text-white">
              立即发布
            </MotionLink>
          </p>
        </div>
      </div>
    </section>
  );
}
