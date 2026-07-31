import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { sendBuddyMessageSchema } from '@/schemas/travelBuddy';
import { readJsonBody, sendJson } from '../../lib/http';
import { newId, readDevDb, writeDevDb } from '../../db/devStore';
import type { BuddyMessage } from '@/types/domain/travelBuddy';

function resolveUserId(req: IncomingMessage): string {
  const header = req.headers['x-user-id'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim();
  }
  return DEMO_CURRENT_USER_ID;
}

function parseQuery(req: IncomingMessage): URLSearchParams {
  const url = new URL(req.url ?? '/', 'http://localhost');
  return url.searchParams;
}

function threadFilter(
  message: BuddyMessage,
  buddyPostId: string,
  selfUserId: string,
  peerUserId: string,
): boolean {
  if (message.buddyPostId !== buddyPostId) {
    return false;
  }
  const participants = new Set([message.fromUserId, message.toUserId]);
  return participants.has(selfUserId) && participants.has(peerUserId);
}

export async function handleBuddyMessagesApi(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const method = req.method ?? 'GET';

  if (method === 'GET') {
    const params = parseQuery(req);
    const buddyPostId = params.get('buddyPostId')?.trim();
    const peerUserId = params.get('peerUserId')?.trim();
    const since = params.get('since')?.trim();
    const selfUserId = resolveUserId(req);

    if (!buddyPostId || !peerUserId) {
      sendJson(res, 400, { error: 'buddyPostId 与 peerUserId 必填' });
      return;
    }

    const db = await readDevDb(rootDir);
    let items = db.buddyMessages.filter((message) =>
      threadFilter(message, buddyPostId, selfUserId, peerUserId),
    );

    if (since) {
      const sinceMs = new Date(since).getTime();
      items = items.filter((message) => new Date(message.createdAt).getTime() > sinceMs);
    }

    items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const unreadForSelf = db.buddyMessages.filter(
      (message) =>
        threadFilter(message, buddyPostId, selfUserId, peerUserId) &&
        message.toUserId === selfUserId &&
        !message.isRead,
    );
    for (const message of unreadForSelf) {
      message.isRead = true;
    }
    if (unreadForSelf.length > 0) {
      await writeDevDb(rootDir, db);
    }

    sendJson(res, 200, { items });
    return;
  }

  if (method === 'POST') {
    const body = await readJsonBody<{
      buddyPostId: string;
      toUserId: string;
      content: string;
    }>(req);
    const parsed = sendBuddyMessageSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(res, 400, { error: parsed.error.flatten().fieldErrors });
      return;
    }

    const fromUserId = resolveUserId(req);
    const item: BuddyMessage = {
      id: newId('bmsg'),
      buddyPostId: parsed.data.buddyPostId,
      fromUserId,
      toUserId: parsed.data.toUserId,
      content: parsed.data.content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const db = await readDevDb(rootDir);
    db.buddyMessages.push(item);
    await writeDevDb(rootDir, db);
    sendJson(res, 201, { item });
    return;
  }

  sendJson(res, 405, { error: 'Method Not Allowed' });
}
