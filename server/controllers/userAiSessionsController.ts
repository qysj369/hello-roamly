import type {
  CreateUserAiSessionRequest,
  UpdateUserAiSessionRequest,
  UserAiSessionRecord,
} from '@/types/api/userAiSessions';
import type { PlanHistoryTrigger } from '@/types/domain/planHistory';
import type { PlanChatHistoryItem } from '@/types/api/planContinueChat';
import { newId, readDevDb, writeDevDb } from '../db/devStore';
import type { IncomingMessage } from 'node:http';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';

export function resolveUserId(req: IncomingMessage): string {
  const header = req.headers['x-user-id'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim();
  }
  return DEMO_CURRENT_USER_ID;
}

const VALID_TRIGGERS: PlanHistoryTrigger[] = ['map_click', 'card_click', 'search', 'advisor'];

function isValidLocation(value: unknown): value is UserAiSessionRecord['location'] {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === 'string' &&
    typeof record.lng === 'number' &&
    typeof record.lat === 'number'
  );
}

function isValidHistory(value: unknown): value is PlanChatHistoryItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string',
    )
  );
}

export function isValidCreateUserAiSessionRequest(
  body: unknown,
): body is CreateUserAiSessionRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    isValidLocation(record.location) &&
    typeof record.initialQuery === 'string' &&
    typeof record.trigger === 'string' &&
    VALID_TRIGGERS.includes(record.trigger as PlanHistoryTrigger) &&
    isValidHistory(record.fullHistory) &&
    (record.id === undefined || typeof record.id === 'string') &&
    (record.title === undefined ||
      record.title === null ||
      typeof record.title === 'string')
  );
}

export function isValidUpdateUserAiSessionRequest(
  body: unknown,
): body is UpdateUserAiSessionRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  const hasField =
    'title' in record ||
    'location' in record ||
    'initialQuery' in record ||
    'trigger' in record ||
    'fullHistory' in record ||
    'isSaved' in record ||
    'isPublic' in record;
  if (!hasField) {
    return false;
  }
  if ('title' in record && record.title !== null && typeof record.title !== 'string') {
    return false;
  }
  if ('location' in record && !isValidLocation(record.location)) {
    return false;
  }
  if ('initialQuery' in record && typeof record.initialQuery !== 'string') {
    return false;
  }
  if (
    'trigger' in record &&
    (typeof record.trigger !== 'string' ||
      !VALID_TRIGGERS.includes(record.trigger as PlanHistoryTrigger))
  ) {
    return false;
  }
  if ('fullHistory' in record && !isValidHistory(record.fullHistory)) {
    return false;
  }
  if ('isSaved' in record && typeof record.isSaved !== 'boolean') {
    return false;
  }
  if ('isPublic' in record && typeof record.isPublic !== 'boolean') {
    return false;
  }
  return true;
}

export async function createUserAiSession(
  req: IncomingMessage,
  rootDir: string,
  body: CreateUserAiSessionRequest,
): Promise<UserAiSessionRecord> {
  const now = new Date().toISOString();
  const item: UserAiSessionRecord = {
    id: body.id?.trim() || newId('ai-session'),
    userId: resolveUserId(req),
    title: body.title ?? null,
    location: body.location,
    initialQuery: body.initialQuery,
    trigger: body.trigger,
    fullHistory: body.fullHistory,
    isSaved: false,
    isPublic: false,
    createdAt: now,
    updatedAt: now,
  };

  const db = await readDevDb(rootDir);
  db.userAiSessions = [item, ...db.userAiSessions.filter((entry) => entry.id !== item.id)];
  await writeDevDb(rootDir, db);
  return item;
}

export async function listUserAiSessions(
  req: IncomingMessage,
  rootDir: string,
  options: { savedOnly?: boolean; publicOnly?: boolean; userId?: string } = {},
): Promise<UserAiSessionRecord[]> {
  const db = await readDevDb(rootDir);
  let items = [...db.userAiSessions];

  if (options.userId) {
    items = items.filter((item) => item.userId === options.userId);
    if (options.publicOnly) {
      items = items.filter((item) => item.isPublic && item.isSaved);
    }
  } else if (options.publicOnly) {
    items = items.filter((item) => item.isPublic && item.isSaved);
  } else {
    const userId = resolveUserId(req);
    items = items.filter((item) => item.userId === userId);
    if (options.savedOnly) {
      items = items.filter((item) => item.isSaved);
    }
  }

  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

async function findOwnedSession(
  req: IncomingMessage,
  rootDir: string,
  sessionId: string,
): Promise<UserAiSessionRecord | null | 'forbidden'> {
  const db = await readDevDb(rootDir);
  const item = db.userAiSessions.find((entry) => entry.id === sessionId);
  if (!item) {
    return null;
  }
  if (item.userId !== resolveUserId(req)) {
    return 'forbidden';
  }
  return item;
}

export async function getUserAiSessionById(
  req: IncomingMessage,
  rootDir: string,
  sessionId: string,
): Promise<UserAiSessionRecord | null> {
  const db = await readDevDb(rootDir);
  const item = db.userAiSessions.find((entry) => entry.id === sessionId);
  if (!item) {
    return null;
  }

  const userId = resolveUserId(req);
  const canViewSavedPublic = item.isSaved && item.isPublic;
  if (item.userId !== userId && !canViewSavedPublic) {
    return null;
  }

  return item;
}

export async function updateUserAiSession(
  req: IncomingMessage,
  rootDir: string,
  sessionId: string,
  patch: UpdateUserAiSessionRequest,
): Promise<UserAiSessionRecord | null | 'forbidden'> {
  const owned = await findOwnedSession(req, rootDir, sessionId);
  if (owned === 'forbidden') {
    return 'forbidden';
  }
  if (!owned) {
    return null;
  }

  const db = await readDevDb(rootDir);
  const index = db.userAiSessions.findIndex((entry) => entry.id === sessionId);
  if (index < 0) {
    return null;
  }

  const current = db.userAiSessions[index]!;
  const updated: UserAiSessionRecord = {
    ...current,
    title: patch.title !== undefined ? patch.title : current.title,
    location: patch.location ?? current.location,
    initialQuery: patch.initialQuery ?? current.initialQuery,
    trigger: patch.trigger ?? current.trigger,
    fullHistory: patch.fullHistory ?? current.fullHistory,
    isSaved: patch.isSaved ?? current.isSaved,
    isPublic: patch.isPublic ?? current.isPublic,
    updatedAt: new Date().toISOString(),
  };

  if (patch.title !== undefined && typeof patch.title === 'string') {
    updated.title = patch.title.trim() || null;
  }

  db.userAiSessions[index] = updated;
  await writeDevDb(rootDir, db);
  return updated;
}

export async function deleteUserAiSession(
  req: IncomingMessage,
  rootDir: string,
  sessionId: string,
): Promise<true | null | 'forbidden'> {
  const owned = await findOwnedSession(req, rootDir, sessionId);
  if (owned === 'forbidden') {
    return 'forbidden';
  }
  if (!owned) {
    return null;
  }

  const db = await readDevDb(rootDir);
  const next = db.userAiSessions.filter((entry) => entry.id !== sessionId);
  if (next.length === db.userAiSessions.length) {
    return null;
  }
  db.userAiSessions = next;
  await writeDevDb(rootDir, db);
  return true;
}

/** 清掉未保存的调试/测试会话，保留用户点过「保存方案」的记录 */
export async function purgeUnsavedUserAiSessions(
  rootDir: string,
): Promise<{ removed: number; kept: number }> {
  const db = await readDevDb(rootDir);
  const kept = db.userAiSessions.filter((entry) => entry.isSaved);
  const removed = db.userAiSessions.length - kept.length;
  if (removed > 0) {
    db.userAiSessions = kept;
    await writeDevDb(rootDir, db);
  }
  return { removed, kept: kept.length };
}
