import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  isValidSpeechTranscribeJson,
  transcribeAdvisorSpeechFromJson,
  transcribeAdvisorSpeechFromPcm,
} from '../../controllers/speechTranscribeController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, readRawBody, sendJson } from '../../lib/http';

/** POST /api/ai/speech-transcribe — 顾问语音转文字（服务端 Whisper） */
export async function handleSpeechTranscribeApi(
  req: IncomingMessage,
  res: ServerResponse,
  _env: ServerEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const contentType = req.headers['content-type'] ?? '';

    if (contentType.includes('application/octet-stream')) {
      const sampleRate = Number.parseInt(req.headers['x-audio-sample-rate'] ?? '16000', 10);
      if (sampleRate !== 16_000) {
        sendJson(res, 400, { error: '仅支持 16kHz PCM', code: 'invalid_params' });
        return;
      }
      const raw = await readRawBody(req);
      if (raw.byteLength < 2_000) {
        sendJson(res, 400, { error: '录音太短', code: 'too_short' });
        return;
      }
      const result = await transcribeAdvisorSpeechFromPcm(raw);
      sendJson(res, 200, result);
      return;
    }

    const body = await readJsonBody<unknown>(req);
    if (!isValidSpeechTranscribeJson(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const result = await transcribeAdvisorSpeechFromJson(body);
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '语音识别失败';
    sendJson(res, 500, { error: message, code: 'speech_failed' });
  }
}
