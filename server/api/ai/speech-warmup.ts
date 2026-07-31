import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerEnv } from '../../lib/deepseekServer';
import { warmupSpeechTranscriber } from '../../lib/advisorSpeechServer';
import { sendJson } from '../../lib/http';

/** GET /api/ai/speech-warmup — 预加载顾问语音识别模型 */
export async function handleSpeechWarmupApi(
  req: IncomingMessage,
  res: ServerResponse,
  _env: ServerEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const result = await warmupSpeechTranscriber();
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '语音模型预热失败';
    sendJson(res, 500, { error: message, code: 'speech_warmup_failed' });
  }
}
