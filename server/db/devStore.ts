import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { BuddyMessage, TravelBuddyPost } from '@/types/domain/travelBuddy';
import type { UserPlanRecord } from '@/types/api/userPlans';
import type { UserAiSessionRecord } from '@/types/api/userAiSessions';
import { migrateUserPlansToSessions } from './migrateUserPlansToSessions';

export type DevDbSnapshot = {
  travelBuddies: TravelBuddyPost[];
  buddyMessages: BuddyMessage[];
  userPlans: UserPlanRecord[];
  userAiSessions: UserAiSessionRecord[];
};

const DEFAULT_SNAPSHOT: DevDbSnapshot = {
  travelBuddies: [],
  buddyMessages: [],
  userPlans: [],
  userAiSessions: [],
};

function dataFilePath(rootDir: string): string {
  return path.join(rootDir, 'server', '.data', 'travel-buddy-db.json');
}

export async function readDevDb(rootDir: string): Promise<DevDbSnapshot> {
  const filePath = dataFilePath(rootDir);
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DevDbSnapshot>;
    const userPlans = Array.isArray(parsed.userPlans) ? parsed.userPlans : [];
    let userAiSessions = Array.isArray(parsed.userAiSessions) ? parsed.userAiSessions : [];
    if (userAiSessions.length === 0 && userPlans.length > 0) {
      userAiSessions = migrateUserPlansToSessions(userPlans);
    }
    return {
      travelBuddies: Array.isArray(parsed.travelBuddies) ? parsed.travelBuddies : [],
      buddyMessages: Array.isArray(parsed.buddyMessages) ? parsed.buddyMessages : [],
      userPlans,
      userAiSessions,
    };
  } catch {
    return { ...DEFAULT_SNAPSHOT };
  }
}

export async function writeDevDb(rootDir: string, snapshot: DevDbSnapshot): Promise<void> {
  const filePath = dataFilePath(rootDir);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
}

export function sortSeekingPosts(items: TravelBuddyPost[]): TravelBuddyPost[] {
  return items
    .filter((item) => item.status === 'seeking')
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime() ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
