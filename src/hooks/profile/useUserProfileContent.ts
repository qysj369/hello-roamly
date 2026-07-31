import { useMemo } from 'react';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import type { User } from '@/types/domain/user/user';
import { useGeneratedPlansStore } from '@/stores/generatedPlans/store';
import { usePlanInteractions } from '@/hooks/api/usePlanInteractions';
import {
  getUserProfileFavoritePlans,
  getUserProfileFollowers,
  getUserProfileFollowing,
  getUserProfileMoments,
  getUserProfilePlans,
} from '@/utils/userProfileContent';

export function useUserProfileContent(user: User | undefined, isOwnProfile: boolean) {
  const generatedPlans = useGeneratedPlansStore((state) => state.plans);
  const { data: planInteractions } = usePlanInteractions(isOwnProfile);
  const favoritedPlanIds = planInteractions?.favorited ?? [];

  return useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      plans: getUserProfilePlans(user.id, generatedPlans),
      moments: getUserProfileMoments(user, {
        isOwnProfile,
        viewerId: DEMO_CURRENT_USER_ID,
      }),
      favorites: getUserProfileFavoritePlans(
        user.id,
        favoritedPlanIds,
        generatedPlans,
        isOwnProfile,
      ),
      following: getUserProfileFollowing(user.id),
      followers: getUserProfileFollowers(user.id),
    };
  }, [user, generatedPlans, favoritedPlanIds, isOwnProfile]);
}
