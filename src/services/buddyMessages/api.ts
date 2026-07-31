import { http } from '@/lib/api/http';
import { readEnv } from '@/lib/config/env';
import { BUDDY_MESSAGES_API } from '@/services/travelBuddies/paths';
import {
  listBuddyMessagesLocal,
  sendBuddyMessageLocal,
} from '@/stores/buddyMessages/local';
import type {
  ListBuddyMessagesParams,
  ListBuddyMessagesResponse,
  SendBuddyMessageRequest,
  SendBuddyMessageResponse,
} from '@/types/api/travelBuddy';

const DEV_API_PREFIX = '/api';

function useRemoteApi(): boolean {
  return Boolean(readEnv('VITE_API_BASE_URL'));
}

function useDevApi(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'preview';
}

async function fetchDevJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(`${DEV_API_PREFIX}${path}`, window.location.origin);
  if (init?.method === 'GET' && init.body) {
    void init.body;
  }
  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error('请求失败');
  }
  return response.json() as Promise<T>;
}

export async function fetchBuddyMessages(
  params: ListBuddyMessagesParams,
): Promise<ListBuddyMessagesResponse> {
  if (useRemoteApi()) {
    const { data } = await http.get<ListBuddyMessagesResponse>(BUDDY_MESSAGES_API.list, {
      params,
    });
    return data;
  }

  if (useDevApi()) {
    try {
      const query = new URLSearchParams({
        buddyPostId: params.buddyPostId,
        peerUserId: params.peerUserId,
      });
      if (params.since) {
        query.set('since', params.since);
      }
      return await fetchDevJson<ListBuddyMessagesResponse>(
        `${BUDDY_MESSAGES_API.list}?${query.toString()}`,
      );
    } catch {
      return {
        items: listBuddyMessagesLocal({
          buddyPostId: params.buddyPostId,
          peerUserId: params.peerUserId,
          since: params.since,
        }),
      };
    }
  }

  return {
    items: listBuddyMessagesLocal({
      buddyPostId: params.buddyPostId,
      peerUserId: params.peerUserId,
      since: params.since,
    }),
  };
}

export async function sendBuddyMessage(
  payload: SendBuddyMessageRequest,
): Promise<SendBuddyMessageResponse> {
  if (useRemoteApi()) {
    const { data } = await http.post<SendBuddyMessageResponse>(
      BUDDY_MESSAGES_API.send,
      payload,
    );
    return data;
  }

  if (useDevApi()) {
    try {
      return await fetchDevJson<SendBuddyMessageResponse>(BUDDY_MESSAGES_API.send, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        item: sendBuddyMessageLocal({
          buddyPostId: payload.buddyPostId,
          toUserId: payload.toUserId,
          content: payload.content,
        }),
      };
    }
  }

  return {
    item: sendBuddyMessageLocal({
      buddyPostId: payload.buddyPostId,
      toUserId: payload.toUserId,
      content: payload.content,
    }),
  };
}
