import type { PlanChatHistoryItem } from '@/types/api/planContinueChat';
import type { PlanHistoryTrigger } from '@/types/domain/planHistory';

export type UserAiSessionLocation = {
  name: string;
  lng: number;
  lat: number;
};

/** user_ai_sessions 表对应记录 */
export type UserAiSessionRecord = {
  id: string;
  userId: string;
  title: string | null;
  location: UserAiSessionLocation;
  initialQuery: string;
  trigger: PlanHistoryTrigger;
  fullHistory: PlanChatHistoryItem[];
  isSaved: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserAiSessionRequest = {
  id?: string;
  location: UserAiSessionLocation;
  initialQuery: string;
  trigger: PlanHistoryTrigger;
  fullHistory: PlanChatHistoryItem[];
  title?: string | null;
};

export type UpdateUserAiSessionRequest = {
  title?: string | null;
  location?: UserAiSessionLocation;
  initialQuery?: string;
  trigger?: PlanHistoryTrigger;
  fullHistory?: PlanChatHistoryItem[];
  isSaved?: boolean;
  isPublic?: boolean;
};

export type ListUserAiSessionsParams = {
  saved?: boolean;
  public?: boolean;
  userId?: string;
};

export type ListUserAiSessionsResponse = {
  items: UserAiSessionRecord[];
  total: number;
};

export type GetUserAiSessionResponse = {
  item: UserAiSessionRecord;
};

export type UserAiSessionMutationResponse = {
  item: UserAiSessionRecord;
};

export type DeleteUserAiSessionResponse = {
  ok: true;
};

export type UserAiSessionErrorResponse = {
  error: string;
  code?:
    | 'invalid_params'
    | 'not_found'
    | 'forbidden'
    | 'read_failed'
    | 'save_failed'
    | 'update_failed'
    | 'delete_failed';
};
