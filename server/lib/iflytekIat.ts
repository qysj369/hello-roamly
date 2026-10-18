import crypto from 'node:crypto';
import WebSocket from 'ws';
import { buildTravelSpeechHotwordPayload } from '@/lib/speech/travelSpeechHotwords';

const IFLYTEK_IAT_HOST = 'wss://iat-api.xfyun.cn/v2/iat';
const PCM_CHUNK_BYTES = 1280;
const DEFAULT_VAD_EOS_MS = 1700;

function resolveVadEosMs(override?: number): number {
  if (typeof override === 'number' && Number.isFinite(override) && override > 0) {
    return Math.round(override);
  }
  const fromEnv = Number(process.env.IFLYTEK_VAD_EOS_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.round(fromEnv);
  }
  return DEFAULT_VAD_EOS_MS;
}

export type IflytekCredentials = {
  appId: string;
  apiKey: string;
  apiSecret: string;
};

export function getIflytekCredentials(): IflytekCredentials | null {
  const appId = process.env.IFLYTEK_APP_ID?.trim();
  const apiKey = process.env.IFLYTEK_API_KEY?.trim();
  const apiSecret = process.env.IFLYTEK_API_SECRET?.trim();
  if (!appId || !apiKey || !apiSecret) {
    return null;
  }
  return { appId, apiKey, apiSecret };
}

export function hasIflytekCredentials(): boolean {
  return getIflytekCredentials() != null;
}

function buildIflytekAuthUrl(credentials: IflytekCredentials): string {
  const url = new URL(IFLYTEK_IAT_HOST);
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${url.host}\ndate: ${date}\nGET ${url.pathname} HTTP/1.1`;
  const signature = crypto
    .createHmac('sha256', credentials.apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  const authorizationOrigin = `api_key="${credentials.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  url.searchParams.set('authorization', authorization);
  url.searchParams.set('date', date);
  url.searchParams.set('host', url.host);
  return url.toString();
}

function formatIflytekErrorMessage(message?: string, code?: number): string {
  const detail = message?.trim() ?? '';
  if (/licc/i.test(detail) || code === 10005) {
    return (
      '讯飞授权失败(licc)：请到 console.xfyun.cn → 我的应用 → 蜗牛旅行 → 添加「语音听写（流式版）」能力，' +
      '确认 APPID/KEY 与 .env.local 一致后重启开发服'
    );
  }
  if (/11200|no license|没有权限/i.test(detail) || code === 11200) {
    return '讯飞服务未开通或已过期：请到 console.xfyun.cn 检查「语音听写（流式版）」试用/购买状态';
  }
  return detail || `讯飞识别失败（${code ?? 'unknown'}）`;
}

export function float32ToInt16Buffer(samples: Float32Array): Buffer {
  const buffer = Buffer.alloc(samples.length * 2);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    buffer.writeInt16LE(Math.round(int16), index * 2);
  }
  return buffer;
}

type IflytekWsResult = {
  sn?: number;
  pgs?: string;
  rg?: number[];
  ws?: Array<{ cw?: Array<{ w?: string }> }>;
};

export function parseIflytekWsText(result: IflytekWsResult | undefined): string {
  let text = '';
  for (const ws of result?.ws ?? []) {
    for (const cw of ws.cw ?? []) {
      text += cw.w ?? '';
    }
  }
  return text;
}

/** 讯飞 wpgs 动态修正：按 sn 存段，rpl 时按 rg 替换，避免「我我我想…」重复拼接 */
export class IflytekWpgsAccumulator {
  private segments = new Map<number, string>();

  reset(): void {
    this.segments.clear();
  }

  push(result: IflytekWsResult): string {
    const piece = parseIflytekWsText(result);
    const sn = typeof result.sn === 'number' ? result.sn : this.segments.size + 1;

    if (result.pgs === 'rpl' && Array.isArray(result.rg) && result.rg.length >= 2) {
      const begin = Math.min(result.rg[0] ?? 0, result.rg[1] ?? 0);
      const end = Math.max(result.rg[0] ?? 0, result.rg[1] ?? 0);
      for (let index = begin; index <= end; index += 1) {
        this.segments.delete(index);
      }
    }

    if (piece || result.pgs) {
      this.segments.set(sn, piece);
    }

    return this.compose();
  }

  compose(): string {
    return [...this.segments.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, text]) => text)
      .join('');
  }
}

type IflytekWsPayload = {
  code?: number;
  message?: string;
  data?: {
    status?: number;
    result?: IflytekWsResult;
  };
};

function buildStartFrame(credentials: IflytekCredentials, vadEosMs: number): string {
  const dhw = buildTravelSpeechHotwordPayload();
  return JSON.stringify({
    common: { app_id: credentials.appId },
    business: {
      language: 'zh_cn',
      domain: 'iat',
      accent: 'mandarin',
      vad_eos: vadEosMs,
      dwa: 'wpgs',
      ...(dhw ? { dhw } : {}),
    },
    data: {
      status: 0,
      format: 'audio/L16;rate=16000',
      encoding: 'raw',
      audio: '',
    },
  });
}

function buildAudioFrame(audioBase64: string, status: 0 | 1 | 2): string {
  return JSON.stringify({
    data: {
      status,
      format: 'audio/L16;rate=16000',
      encoding: 'raw',
      audio: audioBase64,
    },
  });
}

function sendPcmChunks(ws: WebSocket, pcm: Buffer): void {
  if (!pcm.length) {
    ws.send(buildAudioFrame('', 2));
    return;
  }

  let offset = 0;
  while (offset < pcm.length) {
    const end = Math.min(offset + PCM_CHUNK_BYTES, pcm.length);
    const chunk = pcm.subarray(offset, end);
    const isLast = end >= pcm.length;
    const status: 1 | 2 = isLast ? 2 : 1;
    ws.send(buildAudioFrame(chunk.toString('base64'), status));
    offset = end;
  }
}

/** 一次性识别整段 PCM（按住说话等场景） */
export async function transcribeIflytekPcm16(samples: Float32Array): Promise<string> {
  const credentials = getIflytekCredentials();
  if (!credentials) {
    throw new Error('未配置讯飞语音 Key');
  }

  const pcm = float32ToInt16Buffer(samples);
  if (!pcm.length) {
    throw new Error('录音为空，请再试一次');
  }

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(buildIflytekAuthUrl(credentials));
    let transcript = '';
    let settled = false;

    const finish = (error?: Error, text?: string) => {
      if (settled) {
        return;
      }
      settled = true;
      try {
        ws.close();
      } catch {
        // ignore
      }
      if (error) {
        reject(error);
        return;
      }
      const trimmed = (text ?? '').trim();
      if (!trimmed) {
        reject(new Error('没听清，请靠近麦克风再说一次'));
        return;
      }
      resolve(trimmed);
    };

    const timeout = setTimeout(() => {
      finish(new Error('讯飞识别超时，请重试'));
    }, 30_000);

    ws.on('open', () => {
      ws.send(buildStartFrame(credentials, DEFAULT_VAD_EOS_MS));
      sendPcmChunks(ws, pcm);
    });

    ws.on('message', (raw) => {
      let payload: IflytekWsPayload;
      try {
        payload = JSON.parse(raw.toString()) as IflytekWsPayload;
      } catch {
        finish(new Error('讯飞返回格式异常'));
        return;
      }

  if (payload.code !== 0) {
    const message = formatIflytekErrorMessage(payload.message, payload.code);
    finish(new Error(message));
    return;
  }

      if (payload.data?.result) {
        transcript += parseIflytekWsText(payload.data.result);
      }

      if (payload.data?.status === 2) {
        clearTimeout(timeout);
        finish(undefined, transcript);
      }
    });

    ws.on('error', () => {
      clearTimeout(timeout);
      finish(new Error('讯飞语音服务连接失败'));
    });

    ws.on('close', () => {
      clearTimeout(timeout);
      if (!settled) {
        finish(undefined, transcript);
      }
    });
  });
}

export type IflytekStreamCallbacks = {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
  onReady?: () => void;
};

/** 流式会话：静音自动断句，适合顾问页语音对话 */
export class IflytekIatStreamSession {
  private credentials: IflytekCredentials;

  private vadEosMs: number;

  private ws: WebSocket | null = null;

  private callbacks: IflytekStreamCallbacks;

  private utteranceText = '';

  private wpgs = new IflytekWpgsAccumulator();

  private pendingPcm = Buffer.alloc(0);

  private sending = false;

  private closed = false;

  constructor(callbacks: IflytekStreamCallbacks, vadEosMs?: number) {
    const credentials = getIflytekCredentials();
    if (!credentials) {
      throw new Error('未配置讯飞语音 Key');
    }
    this.credentials = credentials;
    this.callbacks = callbacks;
    this.vadEosMs = resolveVadEosMs(vadEosMs);
  }

  start(): void {
    if (this.closed) {
      return;
    }
    this.utteranceText = '';
    this.wpgs.reset();
    this.pendingPcm = Buffer.alloc(0);
    this.sending = false;

    const ws = new WebSocket(buildIflytekAuthUrl(this.credentials));
    this.ws = ws;

    ws.on('open', () => {
      ws.send(buildStartFrame(this.credentials, this.vadEosMs));
      this.callbacks.onReady?.();
      void this.flushPendingAudio();
    });

    ws.on('message', (raw) => {
      let payload: IflytekWsPayload;
      try {
        payload = JSON.parse(raw.toString()) as IflytekWsPayload;
      } catch {
        this.callbacks.onError?.('讯飞返回格式异常');
        return;
      }

      if (payload.code !== 0) {
        this.callbacks.onError?.(formatIflytekErrorMessage(payload.message, payload.code));
        return;
      }

      if (payload.data?.result) {
        this.utteranceText = this.wpgs.push(payload.data.result);
        if (this.utteranceText) {
          this.callbacks.onPartial?.(this.utteranceText);
        }
      }

      if (payload.data?.status === 2) {
        const finalText = this.utteranceText.trim();
        this.utteranceText = '';
        this.wpgs.reset();
        if (finalText) {
          this.callbacks.onFinal?.(finalText);
        } else {
          this.callbacks.onError?.('没听清，请靠近麦克风大声说完整句子后再点「说完了」');
        }
        if (!this.closed) {
          try {
            this.ws?.close();
          } catch {
            // ignore
          }
          this.ws = null;
          this.start();
        }
      }
    });

    ws.on('error', () => {
      this.callbacks.onError?.('讯飞语音服务连接失败');
    });

    ws.on('close', () => {
      if (!this.closed && this.ws === ws) {
        this.callbacks.onError?.('讯飞语音连接已断开');
      }
    });
  }

  feedPcm(pcm: Buffer): void {
    if (this.closed || !pcm.length) {
      return;
    }
    this.pendingPcm = Buffer.concat([this.pendingPcm, pcm]);
    void this.flushPendingAudio();
  }

  private async flushPendingAudio(): Promise<void> {
    if (this.sending || this.closed) {
      return;
    }
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.sending = true;
    try {
      while (this.pendingPcm.length >= PCM_CHUNK_BYTES) {
        const chunk = this.pendingPcm.subarray(0, PCM_CHUNK_BYTES);
        this.pendingPcm = this.pendingPcm.subarray(PCM_CHUNK_BYTES);
        ws.send(buildAudioFrame(chunk.toString('base64'), 1));
      }
    } finally {
      this.sending = false;
    }
  }

  end(): void {
    if (this.closed) {
      return;
    }
    const ws = this.ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (this.pendingPcm.length > 0) {
        ws.send(buildAudioFrame(this.pendingPcm.toString('base64'), 2));
        this.pendingPcm = Buffer.alloc(0);
      } else {
        ws.send(buildAudioFrame('', 2));
      }
    }
  }

  dispose(): void {
    this.closed = true;
    this.pendingPcm = Buffer.alloc(0);
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;
  }
}
