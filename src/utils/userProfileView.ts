import { TRAVEL_INTEREST_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { User } from '@/types/domain/user/user';
import type { PrivacySettings } from '@/types/domain/user/userSettings';
import type { UserBadge } from '@/types/domain/user/userProfile';

const COUNTRY_LABELS: Record<string, string> = {
  CN: '中国',
  JP: '日本',
  TH: '泰国',
  VN: '越南',
  KH: '柬埔寨',
  LA: '老挝',
  IS: '冰岛',
  NO: '挪威',
  KR: '韩国',
  SG: '新加坡',
};

const EMPTY_BIO_PLACEHOLDER = '这个人很懒，还没有写个性签名。';

export type ProfileTravelData = {
  visitedCountryCount: number | null;
  publishedPlanCount: number;
  badgeCount: number;
  badges: UserBadge[];
  countriesHidden: boolean;
};

export function getCountryLabel(code: string): string {
  return COUNTRY_LABELS[code] ?? code;
}

export function getInterestLabel(interest: TravelInterest): string {
  return TRAVEL_INTEREST_OPTIONS.find((item) => item.id === interest)?.label ?? interest;
}

export function formatProfileStatCount(count: number): string {
  if (count >= 10_000) {
    return `${(count / 10_000).toFixed(1)}万`;
  }
  return count.toLocaleString('zh-CN');
}

export function getProfileVisibilityLabel(
  visibility: PrivacySettings['profileVisibility'],
): string {
  const labels: Record<PrivacySettings['profileVisibility'], string> = {
    public: '公开',
    followers: '仅粉丝',
    private: '私密',
  };
  return labels[visibility];
}

export function getProfileBio(user: User, isOwnProfile: boolean): string {
  const bio = user.bio?.trim();
  if (bio) {
    return bio;
  }
  if (isOwnProfile) {
    return EMPTY_BIO_PLACEHOLDER;
  }
  return EMPTY_BIO_PLACEHOLDER;
}

export function hasCustomBio(user: User): boolean {
  return Boolean(user.bio?.trim());
}

export function getProfileTravelData(user: User, isOwnProfile: boolean): ProfileTravelData {
  const countriesHidden = !isOwnProfile && !user.privacySettings.showVisitedCountries;

  return {
    visitedCountryCount: countriesHidden ? null : user.visitedCountries.length,
    publishedPlanCount: user.stats.publishedPlanCount,
    badgeCount: user.badges.length,
    badges: user.badges,
    countriesHidden,
  };
}

export function shouldShowEmail(user: User, isOwnProfile: boolean): boolean {
  if (!user.email?.trim()) {
    return false;
  }
  if (isOwnProfile) {
    return true;
  }
  return user.privacySettings.showEmail;
}
