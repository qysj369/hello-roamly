import { lazy, Suspense } from 'react';
import { ParticlesProvider as TsParticlesProvider } from '@tsparticles/react';
import { createHomeParticlePreset } from '@/lib/particles/presets/home';
import { initParticlesEngine } from '@/lib/particles/init';
import { isHomeParticlesEnabled } from '@/lib/particles/config';

const ParticlesLayer = lazy(() => import('@/components/particles/ParticlesLayer'));

/** 首页背景：轻量粒子或纯 CSS 渐变（VITE_HOME_PARTICLES=0 关闭粒子） */
export default function HomeParticleBackground() {
  const particlesOn = isHomeParticlesEnabled();

  if (!particlesOn) {
    return (
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/40 via-slate-950/20 to-transparent"
        aria-hidden
      />
    );
  }

  return (
    <TsParticlesProvider init={initParticlesEngine}>
      <Suspense fallback={null}>
        <ParticlesLayer
          id="home-tsparticles"
          className="pointer-events-none absolute inset-0 -z-10"
          options={createHomeParticlePreset()}
          overlayClassName="bg-gradient-to-b from-violet-950/30 via-transparent to-transparent"
        />
      </Suspense>
    </TsParticlesProvider>
  );
}
