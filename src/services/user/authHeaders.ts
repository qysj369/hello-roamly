import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';

/** 开发态用户标识（与 server resolveUserId 对齐） */
export function getCurrentUserIdHeader(): string {
  return DEMO_CURRENT_USER_ID;
}

export function buildUserApiHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-user-id': getCurrentUserIdHeader(),
  };
}
