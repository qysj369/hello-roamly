import type { BuddyMessage, TravelBuddyPost } from '@/types/domain/travelBuddy';
import type { CreateTravelBuddyPostInput } from '@/types/domain/travelBuddy';

export type ListTravelBuddiesResponse = {
  items: TravelBuddyPost[];
  total: number;
};

export type CreateTravelBuddyRequest = CreateTravelBuddyPostInput;

export type CreateTravelBuddyResponse = {
  item: TravelBuddyPost;
};

export type ListBuddyMessagesParams = {
  buddyPostId: string;
  peerUserId: string;
  since?: string;
};

export type ListBuddyMessagesResponse = {
  items: BuddyMessage[];
};

export type SendBuddyMessageRequest = {
  buddyPostId: string;
  toUserId: string;
  content: string;
};

export type SendBuddyMessageResponse = {
  item: BuddyMessage;
};
