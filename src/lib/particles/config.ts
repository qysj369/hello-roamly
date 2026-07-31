/** 首页粒子数量上下限（性能预算，偏保守） */
export const HOME_PARTICLE_LIMITS = {
  min: 16,
  max: 40,
} as const;

export function clampHomeParticleCount(count: number): number {
  const rounded = Math.round(count);
  return Math.min(
    HOME_PARTICLE_LIMITS.max,
    Math.max(HOME_PARTICLE_LIMITS.min, rounded),
  );
}

/** 是否启用首页粒子（.env：VITE_HOME_PARTICLES=0 可关闭） */
export function isHomeParticlesEnabled(): boolean {
  const flag = import.meta.env.VITE_HOME_PARTICLES;
  if (flag === '0' || flag === 'false') {
    return false;
  }
  return true;
}
