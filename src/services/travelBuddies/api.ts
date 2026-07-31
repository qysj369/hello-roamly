import { http } from '@/lib/api/http';
import { readEnv } from '@/lib/config/env';
import { TRAVEL_BUDDY_API } from '@/services/travelBuddies/paths';
import { useTravelBuddiesStore } from '@/stores/travelBuddies/store';
import type {
  CreateTravelBuddyRequest,
  CreateTravelBuddyResponse,
  ListTravelBuddiesResponse,
} from '@/types/api/travelBuddy';
import { sortSeekingTravelBuddyPosts } from '@/utils/travelBuddy';

const DEV_API_PREFIX = '/api';

function useRemoteApi(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL'));
}

function useDevApi(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'preview';
}

async function fetchDevJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${DEV_API_PREFIX}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
    throw new Error(typeof payload.error === 'string' ? payload.error : '请求失败');
  }
  return response.json() as Promise<T>;
}

function listFromLocal(): ListTravelBuddiesResponse {
  const store = useTravelBuddiesStore.getState();
  store.hydrate();
  const items = store.listSeeking();
  return { items, total: items.length };
}

export async function fetchTravelBuddyList(): Promise<ListTravelBuddiesResponse> {
  if (useRemoteApi()) {
    const { data } = await http.get<ListTravelBuddiesResponse>(TRAVEL_BUDDY_API.list, {
      params: { status: 'seeking' },
    });
    return {
      items: sortSeekingTravelBuddyPosts(data.items),
      total: data.total,
    };
  }

  if (useDevApi()) {
    try {
      return await fetchDevJson<ListTravelBuddiesResponse>(TRAVEL_BUDDY_API.list);
    } catch {
      return listFromLocal();
    }
  }

  return listFromLocal();
}

export async function createTravelBuddyPost(
  payload: CreateTravelBuddyRequest,
): Promise<CreateTravelBuddyResponse> {
  if (useRemoteApi()) {
    const { data } = await http.post<CreateTravelBuddyResponse>(
      TRAVEL_BUDDY_API.create,
      payload,
    );
    return data;
  }

  if (useDevApi()) {
    try {
      return await fetchDevJson<CreateTravelBuddyResponse>(TRAVEL_BUDDY_API.create, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      const item = useTravelBuddiesStore.getState().addPost(payload);
      return { item };
    }
  }

  const item = useTravelBuddiesStore.getState().addPost(payload);
  return { item };
}
