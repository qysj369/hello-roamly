/**
 * 核心领域接口（审查清单推荐从 `@/types` 导入）。
 * 实现位于 `src/types/interfaces/`，`domain/` 与 `api/` 与之对齐。
 */
export type {
  EnrichedTravelPlan,
  Guide,
  MapCoordinates,
  TravelPlan,
  TravelPlanActivity,
  TravelPlanCreator,
  TravelPlanDay,
  TravelPlanPresentation,
  User,
  UserBasicInfo,
  UserProfile,
  UserPublicProfile,
} from '@/types/interfaces';

export type {
  ClaimInviteRewardRequest,
  ClaimInviteRewardResponse,
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  CreateTravelPlanResponse,
  DeepSeekChatCompletionResponse,
  DeepSeekChatMessage,
  GetTravelPlanResponse,
  IngestShareEventsRequest,
  InviteSummaryResponse,
  ListGuidesParams,
  ListGuidesResponse,
  ListTravelPlansResponse,
  ModerationCheckRequest,
  ModerationCheckResponse,
  RedeemInviteCodeRequest,
  RedeemInviteCodeResponse,
  UpdateTravelPlanRequest,
  UpdateTravelPlanResponse,
} from '@/types/api';
export type { AboutPageState, AiChatPageState, GuidesPageState } from '@/types/router-state';
export type {
  DiscoverFilters,
  DiscoverSortMode,
  RecommendedDiscoverItem,
} from '@/types/domain/discover';
export type {
  InviteReward,
  InviteSummary,
  RedeemInviteResult,
} from '@/types/domain/invite';
export type {
  CreatePaymentOrderInput,
  PaymentChannelId,
  PaymentOrder,
} from '@/types/domain/payment';
export type {
  ModerateContentInput,
  ModerationDecision,
  ModerationResult,
} from '@/types/domain/contentModeration';
export type {
  ShareAction,
  ShareChannel,
  ShareContentKind,
  ShareStatsSummary,
  ShareTrackEvent,
  ShareTrackingContext,
} from '@/types/domain/shareAnalytics';
export type { AiChatContext, AiChatMessage, AiChatRole } from '@/types/domain/aiChat';
export type {
  AiTravelParams,
  TravelInterest,
  TravelPace,
} from '@/types/domain/aiTravelParams';
export type {
  AuthProvider,
  AuthSession,
  AuthState,
  CompanionSeekingStatus,
  GuestSessionId,
  GuestUser,
  LoginPayload,
  NotificationPreferences,
  PhoneLoginPayload,
  PrivacySettings,
  RegisteredUser,
  TravelMoment,
  TravelPersonality,
  TravelPersonalityId,
  UserAuthBinding,
  UserCompanionIntent,
  UserCompanionPreferences,
  UserId,
  UserPlanInteractions,
  UserPlanOwnership,
  UserRole,
  UserSettings,
  UserSocialInfo,
  UserStats,
  UserSubjectId,
  UserTravelInfo,
  UserTravelPreferences,
  VisitedCountryCode,
  WechatLoginPayload,
} from '@/types/domain/user';
export {
  createDefaultUser,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_USER_SETTINGS,
  DEFAULT_USER_TRAVEL_INFO,
  DEFAULT_USER_TRAVEL_PREFERENCES,
  EMPTY_USER_PLAN_INTERACTIONS,
  EMPTY_USER_SOCIAL_INFO,
  EMPTY_USER_STATS,
  fromTravelPlanCreator,
  isGuestUser,
  isRegisteredUser,
  toTravelPlanCreator,
  toUserPublicProfile,
  TRAVEL_PERSONALITY_OPTIONS,
  TRAVEL_PERSONALITY_PRESETS,
  TravelPersonalityKind,
  getTravelPersonalityPreset,
  isTravelPersonalityKind,
  travelPreferencesFromUser,
} from '@/types/domain/user';
export type {
  GetCurrentUserResponse,
  GetUserPlanInteractionsResponse,
  GetUserPublicProfileResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  SyncUserPlanInteractionsRequest,
  UpdateNotificationPreferencesRequest,
  UpdateNotificationPreferencesResponse,
  UpdatePrivacySettingsRequest,
  UpdatePrivacySettingsResponse,
  UpdateUserBasicInfoRequest,
  UpdateUserBasicInfoResponse,
  UpdateUserTravelInfoRequest,
  UpdateUserTravelInfoResponse,
} from '@/types/api/user';
export type { TravelPlanPracticalInfo } from '@/types/domain/travelPlanPracticalInfo';
export { isEnrichedTravelPlan } from '@/types/domain/travelPlan';
export type { TravelOptions, TravelOptionsBudget } from '@/types/domain/travelOptions';
export {
  DEFAULT_TRAVEL_OPTIONS,
  DEFAULT_TRAVEL_OPTIONS_BUDGET,
  resolveTravelOptionsBudget,
} from '@/types/domain/travelOptions';
export type { TravelPlanStyleTag } from '@/types/domain/travelPlanStyleTag';
