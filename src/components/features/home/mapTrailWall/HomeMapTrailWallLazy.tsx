import { lazy, Suspense } from 'react';
import HomeMapTrailWallSkeleton from '@/components/features/home/mapTrailWall/HomeMapTrailWallSkeleton';
import type { HomeMapTrailWallProps } from '@/components/features/home/mapTrailWall/HomeMapTrailWall';

const HomeMapTrailWall = lazy(
  () => import('@/components/features/home/mapTrailWall/HomeMapTrailWall'),
);

/** 首页地图墙 — 异步分包加载 mapbox / 规划逻辑，首屏先出骨架 */
export default function HomeMapTrailWallLazy(props: HomeMapTrailWallProps) {
  return (
    <Suspense fallback={<HomeMapTrailWallSkeleton />}>
      <HomeMapTrailWall {...props} />
    </Suspense>
  );
}
