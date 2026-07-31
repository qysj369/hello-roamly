import { create } from 'zustand';
import {
  DEMO_TRAVEL_BUDDY_POSTS,
  readTravelBuddiesFromStorage,
  writeTravelBuddiesToStorage,
} from '@/stores/travelBuddies/storage';
import type { CreateTravelBuddyPostInput, TravelBuddyPost } from '@/types/domain/travelBuddy';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { sortSeekingTravelBuddyPosts } from '@/utils/travelBuddy';

function mergeSeedPosts(existing: TravelBuddyPost[]): TravelBuddyPost[] {
  const existingIds = new Set(existing.map((item) => item.id));
  const seeds = DEMO_TRAVEL_BUDDY_POSTS.filter((seed) => !existingIds.has(seed.id));
  if (seeds.length === 0) {
    return existing;
  }
  return [...seeds, ...existing];
}

function newPostId(): string {
  return `buddy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type TravelBuddiesState = {
  items: TravelBuddyPost[];
  hydrated: boolean;
  hydrate: () => void;
  listSeeking: () => TravelBuddyPost[];
  addPost: (input: CreateTravelBuddyPostInput, userId?: string) => TravelBuddyPost;
  getById: (id: string) => TravelBuddyPost | undefined;
};

export const useTravelBuddiesStore = create<TravelBuddiesState>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const merged = mergeSeedPosts(readTravelBuddiesFromStorage());
    writeTravelBuddiesToStorage(merged);
    set({ items: merged, hydrated: true });
  },

  listSeeking: () => sortSeekingTravelBuddyPosts(get().items),

  addPost: (input, userId = DEMO_CURRENT_USER_ID) => {
    const now = new Date().toISOString();
    const post: TravelBuddyPost = {
      id: newPostId(),
      userId,
      ...input,
      status: 'seeking',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const items = [post, ...state.items];
      writeTravelBuddiesToStorage(items);
      return { items };
    });
    return post;
  },

  getById: (id) => get().items.find((item) => item.id === id),
}));
