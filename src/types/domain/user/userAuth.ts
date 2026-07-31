import type { UserId } from '@/types/domain/user/userId';

/** 登录方式（与关于页「手机号 / 微信」规划一致） */
export type AuthProvider = 'phone' | 'wechat' | 'email' | 'guest' | 'dev_token';

export type UserAccountStatus = 'active' | 'pending_verification' | 'suspended' | 'deleted';

/** 第三方或本地账号绑定 */
export type UserAuthBinding = {
  provider: AuthProvider;
  /** 业务侧用户 ID */
  userId: UserId;
  /** 手机号脱敏展示，如 138****8000 */
  phoneMasked?: string;
  /** 微信 openId / unionId 等，仅存后端，前端可选占位 */
  externalId?: string;
  /** 是否已完成实名 / 手机验证 */
  verified: boolean;
  /** 最近一次登录时间 ISO 8601 */
  lastLoginAt?: string;
};

/** 客户端会话（对应 Bearer Token 与 localStorage） */
export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  /** 访问令牌过期时间 ISO 8601 */
  expiresAt?: string;
  userId: UserId;
  provider: AuthProvider;
  /** 会话创建时间 ISO 8601 */
  issuedAt: string;
};

/** 手机号登录请求体（API 预留） */
export type PhoneLoginPayload = {
  phone: string;
  verificationCode: string;
  countryCode?: string;
};

/** 微信 OAuth 回调载荷（API 预留） */
export type WechatLoginPayload = {
  code: string;
  state?: string;
};

export type LoginPayload = PhoneLoginPayload | WechatLoginPayload;

/** 当前客户端认证态（游客 / 已登录） */
export type AuthState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; session: AuthSession; binding: UserAuthBinding };
