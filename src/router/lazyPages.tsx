import { lazy, type ComponentType } from 'react';
import { withRouteSuspense } from '@/router/withRouteSuspense';

/** 与路由懒加载共用的动态 import，供 prefetch 复用 */
export const routeLoaders = {
  discover: () => import('@/pages/discover/DiscoverPage'),
  ai: () => import('@/pages/ai/AiChatPage'),
  aiSnail: () => import('@/pages/ai-snail/AiSnailGuidePage'),
  guides: () => import('@/pages/guides/GuidesPage'),
  guideDetail: () => import('@/pages/guides/GuideDetailPage'),
  publishGuide: () => import('@/pages/guides/PublishGuidePage'),
  travelPlanDetail: () => import('@/pages/plans/TravelPlanDetailPage'),
  savedUserPlanDetail: () => import('@/pages/plans/SavedUserPlanDetailPage'),
  userSavedPlans: () => import('@/pages/profile/UserSavedPlansPage'),
  userProfile: () => import('@/pages/profile/UserProfilePage'),
  messages: () => import('@/pages/messages/MessagesPage'),
  travelBuddies: () => import('@/pages/travel-buddy/TravelBuddiesPage'),
  travelBuddyNew: () => import('@/pages/travel-buddy/TravelBuddyNewPage'),
  about: () => import('@/pages/about/AboutPage'),
  snailCulture: () => import('@/pages/community/SnailCulturePage'),
  drivePanorama: () => import('@/pages/drive/DrivePanoramaPage'),
  notFound: () => import('@/pages/error/NotFoundPage'),
} as const;

export type RouteChunkKey = keyof typeof routeLoaders;

function lazyPage(factory: () => Promise<{ default: ComponentType<object> }>) {
  return withRouteSuspense(lazy(factory));
}

/** 首页保持同步加载，优化首屏 LCP */
export { default as HomePage } from '@/pages/home/HomePage';

export const DiscoverPage = lazyPage(routeLoaders.discover);
export const AiChatPage = lazyPage(routeLoaders.ai);
export const AiSnailGuidePage = lazyPage(routeLoaders.aiSnail);
export const GuidesPage = lazyPage(routeLoaders.guides);
export const GuideDetailPage = lazyPage(routeLoaders.guideDetail);
export const PublishGuidePage = lazyPage(routeLoaders.publishGuide);
export const TravelPlanDetailPage = lazyPage(routeLoaders.travelPlanDetail);
export const SavedUserPlanDetailPage = lazyPage(routeLoaders.savedUserPlanDetail);
export const UserSavedPlansPage = lazyPage(routeLoaders.userSavedPlans);
export const UserProfilePage = lazyPage(routeLoaders.userProfile);
export const MessagesPage = lazyPage(routeLoaders.messages);
export const TravelBuddiesPage = lazyPage(routeLoaders.travelBuddies);
export const TravelBuddyNewPage = lazyPage(routeLoaders.travelBuddyNew);
export const AboutPage = lazyPage(routeLoaders.about);
export const SnailCulturePage = lazyPage(routeLoaders.snailCulture);
export const DrivePanoramaPage = lazyPage(routeLoaders.drivePanorama);
export const NotFoundPage = lazyPage(routeLoaders.notFound);
