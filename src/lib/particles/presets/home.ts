import type { ISourceOptions } from '@tsparticles/engine';
import { BRAND_COLORS } from '@/lib/config/brand';
import { clampHomeParticleCount } from '@/lib/particles/config';

export type ParticlePresetOptions = {
  particleCount: number;
};

const { primary, secondary } = BRAND_COLORS;

/** 首页轻量粒子：无连线、无交互，降低 GPU 占用 */
export function createHomeParticlePreset({ particleCount }: ParticlePresetOptions): ISourceOptions {
  const count = clampHomeParticleCount(particleCount);

  return {
    fullScreen: {
      enable: false,
    },
    fpsLimit: 30,
    detectRetina: false,
    smooth: false,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    background: {
      color: {
        value: 'transparent',
      },
    },
    particles: {
      number: {
        value: count,
        density: {
          enable: false,
        },
      },
      color: {
        value: [primary, '#60A5FA', secondary],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: { min: 0.12, max: 0.45 },
        animation: {
          enable: false,
        },
      },
      size: {
        value: { min: 1, max: 2.5 },
      },
      move: {
        enable: true,
        speed: { min: 0.03, max: 0.18 },
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
      links: {
        enable: false,
      },
    },
    interactivity: {
      detectsOn: 'canvas',
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
      },
    },
  };
}

/** 按视口宽度分档（数量下调以减轻卡顿） */
export function getHomeParticleCount(): number {
  if (typeof window === 'undefined') {
    return 24;
  }

  const width = window.innerWidth;

  if (width < 640) {
    return 16;
  }
  if (width < 1024) {
    return 24;
  }
  if (width < 1440) {
    return 32;
  }
  return 40;
}
