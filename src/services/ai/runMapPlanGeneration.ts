import { ensureCompleteMapPlanContent } from '@/lib/plan/mapPlanCompleteness';
import { MAP_PLAN_MAX_TOKENS } from '@/lib/plan/mapPlanGenerationLimits';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import {
  buildMapPlanMockContent,
  buildMapPlanSystemPrompt,
  buildMapPlanUserPrompt,
} from '@/services/ai/prompts/mapPlanGeneration';
import type { AiSnailGuideCompleter } from '@/services/ai/runAiSnailGuideGeneration';

export type MapPlanGenerationParams = {
  lng: number;
  lat: number;
  query: string;
  locationName: string;
  originName?: string | null;
};

export type MapPlanGenerationResult = {
  locationName: string;
  content: string;
};

/** 地图点击 + 逆地理 + DeepSeek 生成穷游 Markdown 方案 */
export async function runMapPlanGeneration(
  params: MapPlanGenerationParams,
  completer: AiSnailGuideCompleter | null,
  options: { forceMock?: boolean } = {},
): Promise<MapPlanGenerationResult> {
  const trimmedQuery = params.query.trim();
  if (!trimmedQuery) {
    throw new Error('请描述您的旅行需求');
  }

  const locationName = params.locationName.trim() || '所选地点';

  if (options.forceMock || !completer) {
    return {
      locationName,
      content: buildMapPlanMockContent(locationName, trimmedQuery, params.originName),
    };
  }

  const baseMessages = [
    { role: 'system' as const, content: buildMapPlanSystemPrompt() },
    {
      role: 'user' as const,
      content: buildMapPlanUserPrompt(
        locationName,
        trimmedQuery,
        { lng: params.lng, lat: params.lat },
        params.originName,
      ),
    },
  ];

  const initialContent = await completer({
    messages: baseMessages,
    temperature: 0.55,
    maxTokens: MAP_PLAN_MAX_TOKENS,
    jsonMode: false,
  });

  const content = await ensureCompleteMapPlanContent(baseMessages, completer, initialContent);

  return { locationName, content: sanitizePlanContentForDisplay(content.trim()) };
}
