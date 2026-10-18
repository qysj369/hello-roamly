import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';

/** AI 对话页路由 state / 首页跳转上下文 */
export type AiChatPageState = {
  initialPrompt?: string;
  aiDream?: string;
  aiPlan?: {
    destination: string;
    days: number;
    budget: string;
  };
  /** 恢复已有顾问会话 */
  sessionId?: string;
  /** 首页每次新搜索的一次性标记，禁止复用上一轮对话 */
  searchNonce?: number;
  /** 从地图方案带入的关联会话 */
  linkedPlanSessionId?: string;
  planExcerpt?: string;
  location?: {
    name: string;
    lng: number;
    lat: number;
  };
  source?: 'home_map' | 'plan_result' | 'direct' | 'capsule_one';
};

/** 攻略页路由 state（来自首页 AI 搜索 / 规划） */
export type GuidesPageState = {
  aiDream?: string;
  aiPlan?: {
    destination: string;
    days: number;
    budget: string;
  };
  /** 从旅行计划详情「寻找旅伴」进入 */
  travelBuddy?: {
    planId: string;
    planTitle: string;
    destination: string;
    days: number;
    budgetLabel: string;
  };
  source?: 'capsule_one' | 'home_map' | 'plan_result' | 'direct';
};

/** 发现页路由 state（来自 Capsule / AI 带入目的地） */
export type DiscoverPageState = {
  destination?: string;
  aiDream?: string;
  fromCapsule?: boolean;
  source?: 'capsule_one' | 'home_map' | 'plan_result' | 'direct';
};

/** 我的页路由 state（来自顶栏登录/注册） */
export type AboutPageState = {
  auth?: 'login';
};

/** 发布攻略页路由 state（来自 AI蜗牛 或手动发布入口） */
export type PublishGuidePageState = {
  editorDraft?: GuidePublishEditorDraft;
  aiGeneratedContent?: AiSnailGuideResult;
  sourceGuideId?: string;
  destination?: string;
  days?: number;
};

/** 伸出触角 · 发布结伴需求页 state */
export type TravelBuddyNewPageState = {
  destination?: string;
};

/** 站内信页 state（来自伸出触角「感兴趣」） */
export type MessagesPageState = {
  buddyPostId?: string;
  showSafetyNotice?: boolean;
  draftMessage?: string;
  contextLabel?: string;
};
