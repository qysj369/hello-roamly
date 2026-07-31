import type {
  ContentModerationScene,
  ModerationDecision,
} from '@/types/domain/contentModeration';

/** POST /moderation/check */
export type ModerationCheckRequest = {
  scene: ContentModerationScene;
  text: string;
  bizId?: string;
  userId?: string;
};

export type ModerationCheckResponse = {
  decision: ModerationDecision;
  requestId: string;
  labels?: string[];
  message?: string;
};
