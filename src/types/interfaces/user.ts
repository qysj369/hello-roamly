import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { MapCoordinates } from '@/types/interfaces/travelPlan';
import type { UserAccountStatus, UserAuthBinding } from '@/types/domain/user/userAuth';
import type { UserCompanionPreferences } from '@/types/domain/user/userCompanion';
import type { UserId } from '@/types/domain/user/userId';
import type { TravelPersonality } from '@/types/domain/user/userTravel';

/** 用户基础信息（PATCH /users/:id 可更新字段子集） */
export interface UserBasicInfo {
  id: UserId;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

/** 旅行动态可见范围 */
export type TravelMomentVisibility = 'public' | 'followers' | 'private';

/** 用户发布的旅行动态 */
export interface TravelMoment {
  id: string;
  authorId: UserId;
  description: string;
  content: string;
  title?: string;
  tags: string[];
  imageUrls?: string[];
  videoUrl?: string;
  location?: string;
  coordinates?: MapCoordinates;
  countryCode?: string;
  planId?: string;
  visibility: TravelMomentVisibility;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 用户社交信息块 */
export interface UserSocialInfo {
  followersCount: number;
  followingCount: number;
  travelMoments: TravelMoment[];
}

export type VisitedCountryCode = string;

/** 用户旅行画像 */
export interface UserTravelInfo {
  travelPersonality: TravelPersonality;
  visitedCountries: VisitedCountryCode[];
  interests: TravelInterest[];
}

/** 资料与动态的隐私设置 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'followers' | 'private';
  showVisitedCountries: boolean;
  showEmail: boolean;
  allowCompanionRequests: boolean;
  defaultMomentVisibility: TravelMomentVisibility;
}

/** 通知偏好 */
export interface NotificationPreferences {
  companionMatch: boolean;
  planReminder: boolean;
  newFollower: boolean;
  momentEngagement: boolean;
  marketing: boolean;
  emailDigest: boolean;
  pushEnabled: boolean;
}

export interface UserSettings {
  privacySettings: PrivacySettings;
  notificationPreferences: NotificationPreferences;
}

/** 内容与互动统计 */
export interface UserStats {
  publishedPlanCount: number;
  receivedLikeCount: number;
  favoriteCount: number;
  companionPostCount: number;
}

/** 用户对旅行计划的互动（localStorage / PUT /users/:id/plan-interactions） */
export interface UserPlanInteractions {
  userId: UserId;
  likedPlanIds: string[];
  favoritedPlanIds: string[];
  recentlyViewedPlanIds?: string[];
  updatedAt: string;
}

export type UserRole = 'guest' | 'member' | 'creator' | 'admin';

/** 用户徽章 */
export interface UserBadge {
  id: string;
  label: string;
  kind: 'verified' | 'creator' | 'companion' | 'explorer' | 'custom';
  description?: string;
  earnedAt?: string;
}

/**
 * 用户资料聚合根（GET /me、登录响应中的 `user` 字段）。
 * 审查清单中的 `UserProfile` 与本接口同构，保留别名见 `UserProfile`。
 */
export interface User extends UserBasicInfo, UserTravelInfo, UserSocialInfo, UserSettings {
  stats: UserStats;
  badges: UserBadge[];
  role?: UserRole;
  accountStatus?: UserAccountStatus;
  auth?: UserAuthBinding;
  companionPreferences?: UserCompanionPreferences;
  /** 社区贡献分（发布攻略、收到撒盐/收进壳里） */
  contributionScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 用户资料（与 `User` 同构，便于按审查命名导入） */
export interface UserProfile extends User {}

/** 他人可见的公开资料（受 privacySettings 约束） */
export interface UserPublicProfile {
  id: UserId;
  username: string;
  avatar?: string;
  travelPersonality: TravelPersonality;
  visitedCountries: VisitedCountryCode[];
  interests: TravelInterest[];
  followersCount: number;
  followingCount: number;
  travelMoments: TravelMoment[];
}
