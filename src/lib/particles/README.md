# lib/particles — tsParticles 粒子系统

基于 [@tsparticles/react](https://particles.js.org) v4 + `@tsparticles/slim`。

## 结构

| 路径 | 说明 |
|------|------|
| `init.ts` | `initParticlesEngine` → `loadSlim` |
| `config.ts` | 粒子数量上下限（50–100）与 `clampHomeParticleCount` |
| `presets/home.ts` | 首页粒子预设（品牌色 `#3B82F6` / `#8B5CF6`） |
| `components/particles/ParticlesLayer.tsx` | 画布 + 可选遮罩 |
| `providers/ParticlesProvider.tsx` | 根级 `ParticlesProvider`（在 `AppProviders` 中） |

## 使用

```tsx
import { useMemo } from 'react';
import { ParticlesLayer } from '@/components/particles';
import { createHomeParticlePreset, getHomeParticleCount } from '@/lib/particles';

const options = useMemo(
  () => createHomeParticlePreset({ particleCount: getHomeParticleCount() }),
  [],
);

<ParticlesLayer
  id="my-particles"
  options={options}
  overlayClassName="home-immersive-gradient-overlay"
/>;
```

## 性能

- 首页粒子数固定在 **50–100**（`getHomeParticleCount` 按视口分档；`createHomeParticlePreset` 内二次 clamp）
- 已关闭 `number.density`，避免大屏密度叠加导致粒子超标

## 新增预设

在 `presets/` 下添加文件并导出 `createXxxParticlePreset`，通过 `ParticlesLayer` 传入 `options` 即可。
