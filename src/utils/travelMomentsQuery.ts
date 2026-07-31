import type { TravelMoment } from '@/types/domain/user/userSocial';

/** 用于 React Query key：瞬间列表变化时重新拉取分页 */
export function travelMomentsFingerprint(moments: TravelMoment[]): string {
  if (moments.length === 0) {
    return '0';
  }
  const first = moments[0]?.id ?? '';
  const last = moments[moments.length - 1]?.id ?? '';
  return `${moments.length}:${first}:${last}`;
}
