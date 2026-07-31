import { runPlanAdvisorTools } from '../lib/planAdvisorTools';
import type { ServerEnv } from '../lib/deepseekServer';

export function isValidPlanToolsRequest(body: unknown): body is {
  content: string;
  locationName: string;
} {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.content === 'string' &&
    record.content.trim().length > 20 &&
    typeof record.locationName === 'string' &&
    record.locationName.trim().length > 0
  );
}

export async function analyzePlanWithTools(
  body: { content: string; locationName: string },
  env: ServerEnv,
) {
  return runPlanAdvisorTools(body.content.trim(), body.locationName.trim(), env);
}
