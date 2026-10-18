import {
  auditSnailPlanOutput,
  resolveSnailPlanAuditLock,
  SNAIL_PLAN_MAX_REGEN_ATTEMPTS,
} from '@/lib/home/snailPlanOutputAudit';
import { ensureCompleteMapPlanContent } from '@/lib/plan/mapPlanCompleteness';
import { MAP_PLAN_MAX_TOKENS } from '@/lib/plan/mapPlanGenerationLimits';
import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';
import { applySnailPlanAuditRepairs } from '@/lib/home/snailPlanAuditRepair';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import {
  buildMapPlanSystemPrompt,
  buildMapPlanUserPrompt,
  buildSnailAuditRepairPrompt,
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

export class DeepSeekUnconfiguredError extends Error {
  readonly code = 'deepseek_unconfigured';

  constructor() {
    super('DeepSeek 未配置，无法调用大模型生成攻略');
    this.name = 'DeepSeekUnconfiguredError';
  }
}

export async function generateMapPlanFromModel(
  params: MapPlanGenerationParams,
  completer: AiSnailGuideCompleter,
  trimmedQuery: string,
  locationName: string,
  repairNotes?: string,
): Promise<string> {
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
    ...(repairNotes?.trim()
      ? [{ role: 'user' as const, content: repairNotes.trim() }]
      : []),
  ];

  const textCompleter: AiSnailGuideCompleter = (input) =>
    completer({ ...input, jsonMode: false });

  const initialContent = await textCompleter({
    messages: baseMessages,
    temperature: 0.55,
    maxTokens: MAP_PLAN_MAX_TOKENS,
    jsonMode: false,
  });

  const content = await ensureCompleteMapPlanContent(baseMessages, textCompleter, initialContent);
  return scrubPlanDisplayMarkup(sanitizePlanContentForDisplay(content.trim()));
}

/** 地图点击 + 逆地理 + DeepSeek 生成穷游 Markdown 方案（无假数据兜底） */
export async function runMapPlanGeneration(
  params: MapPlanGenerationParams,
  completer: AiSnailGuideCompleter | null,
): Promise<MapPlanGenerationResult> {
  const trimmedQuery = params.query.trim();
  if (!trimmedQuery) {
    throw new Error('请描述您的旅行需求');
  }

  const locationName = params.locationName.trim() || '所选地点';

  if (!completer) {
    throw new DeepSeekUnconfiguredError();
  }

  const lock = resolveSnailPlanAuditLock(locationName, trimmedQuery, params.originName);
  let content = applySnailPlanAuditRepairs(
    await generateMapPlanFromModel(params, completer, trimmedQuery, locationName),
    lock,
  );

  for (let attempt = 0; attempt < SNAIL_PLAN_MAX_REGEN_ATTEMPTS; attempt += 1) {
    const audit = auditSnailPlanOutput(content, lock);
    if (audit.ok) {
      break;
    }
    content = applySnailPlanAuditRepairs(
      await generateMapPlanFromModel(
        params,
        completer,
        trimmedQuery,
        locationName,
        buildSnailAuditRepairPrompt(audit.issues),
      ),
      lock,
    );
  }

  return { locationName, content };
}
