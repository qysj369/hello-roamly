import type { AiSnailGuideParams, AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

/** POST /api/ai/generate-guide */
export type GenerateAiSnailGuideRequest = AiSnailGuideParams;

export type GenerateAiSnailGuideResponse = {
  guide: AiSnailGuideResult;
};

export type GenerateAiSnailGuideErrorResponse = {
  error: string;
  code?: string;
};
