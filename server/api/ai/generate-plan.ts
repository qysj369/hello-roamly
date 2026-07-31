import type { IncomingMessage, ServerResponse } from 'node:http';

import { handleDeepSeekPlanApi } from './deepseek';



/** POST /api/ai/generate-plan — 兼容旧路径，与 /api/ai/deepseek 相同 */

export async function handleGeneratePlanApi(

  req: IncomingMessage,

  res: ServerResponse,

  env: Parameters<typeof handleDeepSeekPlanApi>[2],

): Promise<void> {

  return handleDeepSeekPlanApi(req, res, env);

}


