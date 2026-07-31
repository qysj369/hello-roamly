import type { UserPlanRecord } from '@/types/api/userPlans';
import type { UserAiSessionRecord } from '@/types/api/userAiSessions';
import { legacyPlanRecordToSession } from '@/lib/plan/sessionAdapters';

/** 从旧 user_plans 记录迁移为 user_ai_sessions */
export function migrateUserPlanToSession(plan: UserPlanRecord): UserAiSessionRecord {
  return legacyPlanRecordToSession({
    ...plan,
    isSaved: plan.isSaved ?? true,
  });
}

export function migrateUserPlansToSessions(plans: UserPlanRecord[]): UserAiSessionRecord[] {
  const byId = new Map<string, UserAiSessionRecord>();
  for (const plan of plans) {
    const session = migrateUserPlanToSession(plan);
    byId.set(session.id, session);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
