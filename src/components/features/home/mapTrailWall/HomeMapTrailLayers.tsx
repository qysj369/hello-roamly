import { useMemo } from 'react';
import HomeAmapTrailLayers from '@/components/features/home/mapTrailWall/HomeAmapTrailLayers';
import HomeMapTrailGlLayers from '@/components/features/home/mapTrailWall/HomeMapTrailGlLayers';
import type { HomeMapTrailLayersProps } from '@/components/features/home/mapTrailWall/types';
import { resolveTrailWallMapRuntime } from '@/lib/map/trailWall/runtime';

export type { HomeMapTrailLayersProps } from '@/components/features/home/mapTrailWall/types';

export default function HomeMapTrailLayers(props: HomeMapTrailLayersProps) {
  const runtime = useMemo(() => resolveTrailWallMapRuntime(), []);

  if (runtime.provider === 'amap') {
    return <HomeAmapTrailLayers {...props} />;
  }

  return <HomeMapTrailGlLayers {...props} runtime={runtime} />;
}
