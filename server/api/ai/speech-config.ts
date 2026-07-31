import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerEnv } from '../../lib/deepseekServer';
import { getSpeechAsrStatus } from '../../lib/speechAsrConfig';
import { sendJson } from '../../lib/http';

/** GET /api/ai/speech-config — 第六周语音识别通道状态 */
export async function handleSpeechConfigApi(
  req: IncomingMessage,
  res: ServerResponse,
  _env: ServerEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  sendJson(res, 200, getSpeechAsrStatus());
}
