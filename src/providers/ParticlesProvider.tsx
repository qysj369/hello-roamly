import { ParticlesProvider as TsParticlesProvider } from '@tsparticles/react';
import type { ReactNode } from 'react';
import { initParticlesEngine } from '@/lib/particles/init';

type ParticlesProviderProps = {
  children: ReactNode;
};

/** 全局初始化 tsParticles 引擎（仅一次） */
export default function ParticlesProvider({ children }: ParticlesProviderProps) {
  return <TsParticlesProvider init={initParticlesEngine}>{children}</TsParticlesProvider>;
}
