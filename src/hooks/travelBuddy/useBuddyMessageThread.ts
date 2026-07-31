import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBuddyMessages, sendBuddyMessage } from '@/services/buddyMessages/api';
import type { BuddyMessage } from '@/types/domain/travelBuddy';
import type { UserId } from '@/types/domain/user/userId';
import { getSiteChatSelfUserId } from '@/stores/siteChat/store';

const POLL_INTERVAL_MS = 3000;

export function useBuddyMessageThread(params: {
  buddyPostId?: string;
  peerUserId?: UserId;
  enabled?: boolean;
}) {
  const { buddyPostId, peerUserId, enabled = true } = params;
  const [messages, setMessages] = useState<BuddyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAtRef = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (!buddyPostId || !peerUserId || !enabled) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { items } = await fetchBuddyMessages({
        buddyPostId,
        peerUserId,
        since: lastFetchedAtRef.current,
      });
      if (items.length > 0) {
        setMessages((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          for (const item of items) {
            map.set(item.id, item);
          }
          return [...map.values()].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        });
        lastFetchedAtRef.current = items[items.length - 1]!.createdAt;
      } else if (!lastFetchedAtRef.current) {
        const full = await fetchBuddyMessages({ buddyPostId, peerUserId });
        setMessages(full.items);
        if (full.items.length > 0) {
          lastFetchedAtRef.current = full.items[full.items.length - 1]!.createdAt;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载消息失败');
    } finally {
      setIsLoading(false);
    }
  }, [buddyPostId, peerUserId, enabled]);

  useEffect(() => {
    lastFetchedAtRef.current = undefined;
    setMessages([]);
    if (!buddyPostId || !peerUserId || !enabled) {
      return undefined;
    }
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [buddyPostId, peerUserId, enabled, load]);

  const send = useCallback(
    async (content: string) => {
      if (!buddyPostId || !peerUserId) {
        return;
      }
      const { item } = await sendBuddyMessage({
        buddyPostId,
        toUserId: peerUserId,
        content,
      });
      setMessages((prev) => [...prev, item]);
      lastFetchedAtRef.current = item.createdAt;
    },
    [buddyPostId, peerUserId],
  );

  const selfUserId = getSiteChatSelfUserId();

  return { messages, isLoading, error, send, selfUserId, reload: load };
}
