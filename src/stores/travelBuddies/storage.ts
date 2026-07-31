import type { TravelBuddyPost } from '@/types/domain/travelBuddy';
import { defaultTravelBuddyStartDate } from '@/utils/travelBuddy';

const STORAGE_KEY = 'hello-roamly:travel-buddies';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function daysFromDateIso(days: number): string {
  return defaultTravelBuddyStartDate(days);
}

/** 演示结伴需求 — 首次注入 */
export const DEMO_TRAVEL_BUDDY_POSTS: TravelBuddyPost[] = [
  {
    id: 'buddy-seed-hz-2d',
    userId: 'user-roamly-demo',
    destination: '杭州 · 西湖环线',
    startDate: daysFromDateIso(2),
    budgetRange: '500_1000',
    tags: ['meal', 'photo'],
    description: '女生，会拍照，求饭搭子一起逛西湖周边，不住同一间房也行。',
    status: 'seeking',
    createdAt: daysAgoIso(1),
    updatedAt: daysAgoIso(1),
  },
  {
    id: 'buddy-seed-cq-3d',
    userId: 'user-nomad',
    destination: '重庆',
    startDate: daysFromDateIso(4),
    budgetRange: '1000_2000',
    tags: ['meal', 'carpool_room'],
    description: '男生，会开车，可拼车；火锅搭子优先，青旅拼房分摊。',
    status: 'seeking',
    createdAt: daysAgoIso(3),
    updatedAt: daysAgoIso(3),
  },
  {
    id: 'buddy-seed-dl-4d',
    userId: 'user-maple',
    destination: '大理 · 洱海骑行',
    startDate: daysFromDateIso(6),
    budgetRange: '1000_2000',
    tags: ['photo', 'hiking', 'carpool_room'],
    description: '想环洱海拍照，接受电瓶车或徒步段，求节奏相近的蜗友。',
    status: 'seeking',
    createdAt: daysAgoIso(5),
    updatedAt: daysAgoIso(5),
  },
];

export function readTravelBuddiesFromStorage(): TravelBuddyPost[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as TravelBuddyPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeTravelBuddiesToStorage(items: TravelBuddyPost[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export { STORAGE_KEY as TRAVEL_BUDDIES_STORAGE_KEY };
