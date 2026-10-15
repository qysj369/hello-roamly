import { AI_API } from '@/services/ai/paths';
import type { EarthFlyDestinationId } from '@/lib/capsule/earthFlyTo';

export class CompanionSketchApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'CompanionSketchApiError';
    this.status = status;
  }
}

/** POST /api/ai/companion-sketch */
export async function fetchCompanionSketch(
  cityId: EarthFlyDestinationId,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(AI_API.companionSketch, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ cityId }),
    signal,
  });

  const payload = (await response.json().catch(() => null)) as { text?: string; error?: string } | null;
  if (!response.ok) {
    throw new CompanionSketchApiError(payload?.error || `生成行程失败（HTTP ${response.status}）`, response.status);
  }
  const text = payload?.text?.trim();
  if (!text) {
    throw new CompanionSketchApiError('行程是空的', response.status);
  }
  return text;
}
