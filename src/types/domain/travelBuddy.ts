import type {
  TravelBuddyBudgetRangeValue,
  TravelBuddyTagValue,
} from '@/lib/config/travelBuddy';
import type { UserId } from '@/types/domain/user/userId';

/** 结伴需求状态 — 对应 DB status */
export type TravelBuddyStatus = 'seeking' | 'matched' | 'closed';

/** 伸出触角 · 结伴需求帖 */
export type TravelBuddyPost = {
  id: string;
  userId: UserId;
  destination: string;
  /** YYYY-MM-DD */
  startDate: string;
  budgetRange: TravelBuddyBudgetRangeValue;
  tags: TravelBuddyTagValue[];
  description?: string;
  status: TravelBuddyStatus;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
};

/** 搭子站内信 — 对应 buddy_messages 表 */
export type BuddyMessage = {
  id: string;
  buddyPostId: string;
  fromUserId: UserId;
  toUserId: UserId;
  content: string;
  isRead: boolean;
  /** ISO 8601 */
  createdAt: string;
};

export type CreateTravelBuddyPostInput = {
  destination: string;
  startDate: string;
  budgetRange: TravelBuddyBudgetRangeValue;
  tags: TravelBuddyTagValue[];
  description?: string;
};

export type SendBuddyMessageInput = {
  buddyPostId: string;
  toUserId: UserId;
  content: string;
};
