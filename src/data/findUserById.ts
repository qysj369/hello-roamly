import { DEMO_CURRENT_USER_ID, DEMO_USERS } from '@/data/demoUsers';
import type { User } from '@/types/domain/user/user';
import type { UserId } from '@/types/domain/user/userId';
import { toUserPublicProfile } from '@/types/domain/user/userProfile';

export function findUserById(userId: string | undefined): User | undefined {
  if (!userId?.trim()) {
    return undefined;
  }
  // TODO: GET /users/:id（或从 auth session），替换静态 DEMO_USERS
  return DEMO_USERS.find((item) => item.id === userId);
}

export function getCurrentDemoUser(): User {
  // TODO: 从登录态 / JWT 解析当前用户，删除 DEMO_CURRENT_USER_ID 硬编码
  return findUserById(DEMO_CURRENT_USER_ID) ?? DEMO_USERS[0]!;
}

export function getDemoUserIds(): UserId[] {
  return DEMO_USERS.map((user) => user.id);
}

export function findUserPublicById(userId: string | undefined) {
  const user = findUserById(userId);
  if (!user) {
    return undefined;
  }
  return toUserPublicProfile(user);
}
