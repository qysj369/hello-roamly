import { http } from '@/lib/api/http';
import { hasModerationBackend, isContentModerationEnabled } from '@/lib/moderation/config';
import { runLocalPreflight } from '@/lib/moderation/localPreflight';
import { MODERATION_API } from '@/services/moderation/paths';
import { moderationCheckResponseSchema } from '@/schemas/moderation/check';
import type { ModerationCheckRequest } from '@/types/api/contentModeration';
import type { ModerateContentInput, ModerationResult } from '@/types/domain/contentModeration';

function passThrough(message?: string): ModerationResult {
  return {
    decision: 'pass',
    requestId: `bypass-${Date.now()}`,
    message,
  };
}

function buildDemoResult(input: ModerateContentInput): ModerationResult {
  const preflight = runLocalPreflight(input.text);
  if (preflight && preflight.decision === 'reject') {
    return preflight;
  }
  return {
    decision: 'pass',
    requestId: `demo-mod-${Date.now()}`,
    localOnly: true,
    message: '内容安全接口已预留：请配置 VITE_API_BASE_URL 与后端云审服务后启用正式审核',
  };
}

/**
 * 审核链路（顺序固定）：全局关闭 → 本地敏感词 → 无后端则演示通过 → 正式云审。
 * 本地 preflight 在无 API 时仍能拦截演示违禁词，不依赖网络。
 */
export async function checkContentModeration(input: ModerateContentInput): Promise<ModerationResult> {
  if (!isContentModerationEnabled()) {
    return passThrough();
  }

  const preflight = runLocalPreflight(input.text);
  if (preflight?.decision === 'reject') {
    return preflight;
  }

  if (!hasModerationBackend()) {
    // TODO: 上线前必须 hasModerationBackend，演示 pass 不可用于 UGC 生产
    return buildDemoResult(input);
  }

  const body: ModerationCheckRequest = {
    scene: input.scene,
    text: input.text,
    bizId: input.bizId,
    userId: input.userId,
  };
  const { data } = await http.post(MODERATION_API.check, body);
  const parsed = moderationCheckResponseSchema.parse(data);
  return {
    decision: parsed.decision,
    requestId: parsed.requestId,
    labels: parsed.labels,
    message: parsed.message,
  };
}
