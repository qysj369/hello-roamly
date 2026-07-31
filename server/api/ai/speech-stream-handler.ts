import type { WebSocket } from 'ws';
import {
  hasIflytekCredentials,
  IflytekIatStreamSession,
} from '../../lib/iflytekIat';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';
import { extractAdvisorSpeechText } from '@/lib/speech/advisorSpeechHallucinations';

const IFLYTEK_SETUP_HINT =
  '语音对话需配置讯飞 Key：在 .env.local 填入 IFLYTEK_APP_ID / IFLYTEK_API_KEY / IFLYTEK_API_SECRET（免费申请 https://console.xfyun.cn/ ）';

type ClientMessage =
  | { type: 'start' }
  | { type: 'audio'; data: string }
  | { type: 'stop' };

function sendJson(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

/** 浏览器 ↔ 服务端 WebSocket；服务端再桥接讯飞流式听写 */
export function handleSpeechStreamConnection(clientWs: WebSocket): void {
  if (!hasIflytekCredentials()) {
    sendJson(clientWs, { type: 'error', message: IFLYTEK_SETUP_HINT });
    clientWs.close();
    return;
  }

  let session: IflytekIatStreamSession | null = null;

  const ensureSession = () => {
    if (session) {
      return;
    }
    session = new IflytekIatStreamSession({
      onReady: () => {
        sendJson(clientWs, { type: 'ready' });
      },
      onPartial: (text) => {
        sendJson(clientWs, { type: 'partial', text });
      },
      onFinal: (text) => {
        const cleaned = correctAdvisorSpeechIntent(extractAdvisorSpeechText(text));
        sendJson(clientWs, { type: 'final', text: cleaned });
      },
      onError: (message) => {
        sendJson(clientWs, { type: 'error', message });
      },
    });
    session.start();
  };

  clientWs.on('message', (raw) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      sendJson(clientWs, { type: 'error', message: '语音消息格式无效' });
      return;
    }

    if (message.type === 'start') {
      ensureSession();
      return;
    }

    if (message.type === 'audio') {
      ensureSession();
      if (!message.data?.trim()) {
        return;
      }
      try {
        const pcm = Buffer.from(message.data, 'base64');
        session?.feedPcm(pcm);
      } catch {
        sendJson(clientWs, { type: 'error', message: '音频数据无效' });
      }
      return;
    }

    if (message.type === 'stop') {
      session?.end();
      session?.dispose();
      session = null;
    }
  });

  clientWs.on('close', () => {
    session?.dispose();
    session = null;
  });
}
