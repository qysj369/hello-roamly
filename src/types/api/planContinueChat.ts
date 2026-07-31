/** 方案连续对话 — 单条历史（无 id，供 API 上下文） */
export type PlanChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type ContinuePlanChatRequest = {
  planId: string;
  message: string;
  fullHistory: PlanChatHistoryItem[];
  locationName?: string;
  lng?: number;
  lat?: number;
};

export type ContinuePlanChatResponse = {
  reply: string;
};

export type ContinuePlanChatErrorResponse = {
  error: string;
  code?: 'invalid_params' | 'continue_failed';
};
