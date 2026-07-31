import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { findUserById, getCurrentDemoUser } from '@/data/findUserById';
import { useDemoUserProfileStore } from '@/stores/demoUserProfile/store';
import { useTravelMomentsStore } from '@/stores/travelMoments/store';
import type { User } from '@/types/domain/user/user';
import type { TravelMoment } from '@/types/interfaces/user';
import { normalizeTravelMoment } from '@/utils/travelMomentDisplay';

const EMPTY_PUBLISHED_MOMENTS: TravelMoment[] = [];

export type UseUserProfileResult = {
  user: User | undefined;
  isOwnProfile: boolean;
  isLoading: false;
};

/**
 * @param routeUserId 来自 /users/:userId；省略时使用当前演示用户
 */
export function useUserProfile(routeUserId?: string): UseUserProfileResult {
  const params = useParams<{ userId?: string }>();
  const resolvedId = routeUserId ?? params.userId;
  const profilePatch = useDemoUserProfileStore((state) => state.patch);
  const hydrateMoments = useTravelMomentsStore((state) => state.hydrate);
  const publishedMoments = useTravelMomentsStore(
    (state) => state.byUser[DEMO_CURRENT_USER_ID] ?? EMPTY_PUBLISHED_MOMENTS,
  );

  useEffect(() => {
    hydrateMoments();
  }, [hydrateMoments]);

  const user = useMemo(() => {
    const base =
      !resolvedId || resolvedId === 'me' ? getCurrentDemoUser() : findUserById(resolvedId);
    if (!base) {
      return undefined;
    }

    let merged = base;

    if (base.id === DEMO_CURRENT_USER_ID) {
      const seen = new Set<string>();
      const travelMoments = [...publishedMoments, ...base.travelMoments]
        .map((moment) => normalizeTravelMoment(moment))
        .filter((moment) => {
          if (seen.has(moment.id)) {
            return false;
          }
          seen.add(moment.id);
          return true;
        })
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      merged = {
        ...base,
        ...profilePatch,
        travelMoments,
        updatedAt: new Date().toISOString(),
      };
    }

    return merged;
  }, [resolvedId, profilePatch, publishedMoments]);

  const isOwnProfile = user?.id === DEMO_CURRENT_USER_ID;

  return {
    user,
    isOwnProfile,
    isLoading: false,
  };
}
