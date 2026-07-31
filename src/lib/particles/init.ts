import type { Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

/** 加载 slim 预设（移动、连线、基础交互） */
export async function initParticlesEngine(engine: Engine): Promise<void> {
  await loadSlim(engine);
}
