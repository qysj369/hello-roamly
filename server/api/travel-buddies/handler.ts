import type { IncomingMessage, ServerResponse } from 'node:http';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { createTravelBuddyPostSchema } from '@/schemas/travelBuddy';
import { sendJson, readJsonBody } from '../../lib/http';
import { newId, readDevDb, sortSeekingPosts, writeDevDb } from '../../db/devStore';
import type { TravelBuddyPost } from '@/types/domain/travelBuddy';

type CreateBody = {
  destination: string;
  startDate: string;
  budgetRange: TravelBuddyPost['budgetRange'];
  tags: TravelBuddyPost['tags'];
  description?: string;
};

function resolveUserId(req: IncomingMessage): string {
  const header = req.headers['x-user-id'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim();
  }
  return DEMO_CURRENT_USER_ID;
}

export async function handleTravelBuddiesApi(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const method = req.method ?? 'GET';

  if (method === 'GET') {
    const db = await readDevDb(rootDir);
    const items = sortSeekingPosts(db.travelBuddies);
    sendJson(res, 200, { items, total: items.length });
    return;
  }

  if (method === 'POST') {
    const body = await readJsonBody<CreateBody>(req);
    const parsed = createTravelBuddyPostSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(res, 400, { error: parsed.error.flatten().fieldErrors });
      return;
    }

    const now = new Date().toISOString();
    const item: TravelBuddyPost = {
      id: newId('buddy'),
      userId: resolveUserId(req),
      ...parsed.data,
      status: 'seeking',
      createdAt: now,
      updatedAt: now,
    };

    const db = await readDevDb(rootDir);
    db.travelBuddies = [item, ...db.travelBuddies];
    await writeDevDb(rootDir, db);
    sendJson(res, 201, { item });
    return;
  }

  sendJson(res, 405, { error: 'Method Not Allowed' });
}
