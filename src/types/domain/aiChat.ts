export type AiChatRole = 'user' | 'assistant' | 'system';

export type AiChatMessageStatus = 'streaming' | 'complete';

export type AiChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
  /** 流式输出中时为 streaming，结束后为 complete（默认） */
  status?: AiChatMessageStatus;
  /** 仅用于 API 上下文，不在界面展示（如 Capsule 自动注入的首条用户输入） */
  hidden?: boolean;
};

import type { AiTravelParams } from '@/types/domain/aiTravelParams';

export type AiChatLocationContext = {
  name: string;
  lng: number;
  lat: number;
};

export type AiChatContext = {
  destination?: string;
  days?: number;
  budget?: string;
  dream?: string;
  travelParams?: AiTravelParams;
  /** 当前顾问会话 ID（与 user_ai_sessions 对齐） */
  sessionId?: string;
  /** 首页新搜索标记：变化时必须开全新会话 */
  searchNonce?: number;
  /** 来源：首页地图 / 方案追问 / 直接进入 */
  source?: 'home_map' | 'plan_result' | 'direct' | 'capsule_one';
  /** 地图侧关联的 plan session（从方案页跳入顾问时） */
  linkedPlanSessionId?: string;
  /** 已生成方案摘要（注入 system prompt） */
  planExcerpt?: string;
  /** 用户已校正的出发地（首页「确认出发地」） */
  origin?: AiChatLocationContext;
  /** 地图关联地点（多为目的地坐标，从首页/方案页跳入时） */
  location?: AiChatLocationContext;
};
