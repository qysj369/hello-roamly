import type { SaveUserPlanRequest, UserPlanRecord } from '@/types/api/userPlans';
import { sessionToLegacyPlanRecord } from '@/lib/plan/sessionAdapters';
import type { IncomingMessage } from 'node:http';
import {
  createUserAiSession,
  getUserAiSessionById,
  listUserAiSessions,
  resolveUserId,
  updateUserAiSession,
} from './userAiSessionsController';

function isValidContent(content: unknown): content is SaveUserPlanRequest['content'] {
  if (!content || typeof content !== 'object') {
    return false;
  }
  const record = content as Record<string, unknown>;
  return (
    typeof record.planId === 'string' &&
    typeof record.locationName === 'string' &&
    typeof record.lng === 'number' &&
    typeof record.lat === 'number' &&
    Array.isArray(record.fullHistory)
  );
}

export function isValidSaveUserPlanRequest(body: unknown): body is SaveUserPlanRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    typeof record.isPublic === 'boolean' &&
    isValidContent(record.content)
  );
}

export function isValidPatchUserPlanRequest(body: unknown): body is {
  isPublic?: boolean;
  title?: string;
} {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  const hasIsPublic = typeof record.isPublic === 'boolean';
  const hasTitle = typeof record.title === 'string' && record.title.trim().length > 0;
  return hasIsPublic || hasTitle;
}

/** 兼容层：保存时更新同 sessionId 的 user_ai_sessions 记录 */
export async function createUserPlan(
  req: IncomingMessage,
  rootDir: string,
  body: SaveUserPlanRequest,
): Promise<UserPlanRecord> {
  const sessionId = body.content.planId.trim();
  const patch = {
    title: body.title.trim(),
    isPublic: body.isPublic,
    isSaved: true,
    fullHistory: body.content.fullHistory,
    initialQuery: body.content.initialQuery ?? '',
    location: {
      name: body.content.locationName,
      lng: body.content.lng,
      lat: body.content.lat,
    },
  };

  const existing = await getUserAiSessionById(req, rootDir, sessionId);
  if (existing && existing.userId === resolveUserId(req)) {
    const updated = await updateUserAiSession(req, rootDir, sessionId, patch);
    if (!updated || updated === 'forbidden') {
      throw new Error('保存方案失败');
    }
    return sessionToLegacyPlanRecord(updated);
  }

  await createUserAiSession(req, rootDir, {
    id: sessionId,
    trigger: 'map_click',
    initialQuery: patch.initialQuery,
    location: patch.location,
    fullHistory: patch.fullHistory,
    title: patch.title,
  });
  const saved = await updateUserAiSession(req, rootDir, sessionId, {
    isSaved: true,
    isPublic: body.isPublic,
    title: body.title.trim(),
  });
  if (!saved || saved === 'forbidden') {
    throw new Error('保存方案失败');
  }
  return sessionToLegacyPlanRecord(saved);
}

/** 兼容层：仅返回 is_saved = true 的会话 */
export async function listUserPlans(
  req: IncomingMessage,
  rootDir: string,
  options: { publicOnly?: boolean; userId?: string } = {},
): Promise<UserPlanRecord[]> {
  const sessions = await listUserAiSessions(req, rootDir, {
    savedOnly: !options.publicOnly && !options.userId,
    publicOnly: options.publicOnly,
    userId: options.userId,
  });
  return sessions.filter((session) => session.isSaved).map(sessionToLegacyPlanRecord);
}

export async function getUserPlanById(
  req: IncomingMessage,
  rootDir: string,
  planId: string,
): Promise<UserPlanRecord | null> {
  const session = await getUserAiSessionById(req, rootDir, planId);
  if (!session || !session.isSaved) {
    return null;
  }
  const userId = resolveUserId(req);
  if (session.userId !== userId && !(session.isPublic && session.isSaved)) {
    return null;
  }
  return sessionToLegacyPlanRecord(session);
}

export async function updateUserPlan(
  req: IncomingMessage,
  rootDir: string,
  planId: string,
  patch: { isPublic?: boolean; title?: string },
): Promise<UserPlanRecord | null | 'forbidden'> {
  const result = await updateUserAiSession(req, rootDir, planId, {
    ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
    ...(patch.isPublic !== undefined ? { isPublic: patch.isPublic } : {}),
  });
  if (!result || result === 'forbidden') {
    return result;
  }
  if (!result.isSaved) {
    return null;
  }
  return sessionToLegacyPlanRecord(result);
}

/** 从「我的方案」移除：保留会话历史，仅取消 is_saved */
export async function deleteUserPlan(
  req: IncomingMessage,
  rootDir: string,
  planId: string,
): Promise<true | null | 'forbidden'> {
  const result = await updateUserAiSession(req, rootDir, planId, {
    isSaved: false,
    isPublic: false,
  });
  if (result === 'forbidden') {
    return 'forbidden';
  }
  if (!result) {
    return null;
  }
  return true;
}
