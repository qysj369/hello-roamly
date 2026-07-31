import { AI_API } from '@/services/ai/paths';

const TARGET_SAMPLE_RATE = 16_000;
const MIN_DURATION_SEC = 0.8;
const SPEECH_REQUEST_TIMEOUT_MS = 180_000;

export async function requestAdvisorMicrophone(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器无法访问麦克风');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

/** 顾问页打开时预热服务端 Whisper 模型 */
export function warmupAdvisorSpeechModel(): void {
  const controller = new AbortController();
  window.setTimeout(() => controller.abort(), 120_000);
  void fetch(AI_API.speechWarmup, {
    method: 'GET',
    signal: controller.signal,
  }).catch(() => {
    /* 预热失败可忽略，首次识别时会再加载 */
  });
}

/** 上传 PCM 到服务端 Whisper 识别（二进制上传，避免 base64 卡顿） */
export async function transcribePcmSamples(
  samples: Float32Array,
  onStatus?: (message: string) => void,
): Promise<string> {
  const durationSec = samples.length / TARGET_SAMPLE_RATE;
  if (durationSec < MIN_DURATION_SEC) {
    throw new Error('录音太短，请按住说满 2 秒再松开');
  }

  onStatus?.('正在识别语音（本地 Whisper，约 5–20 秒）…');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SPEECH_REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();
  const progressId = window.setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
    if (elapsedSec >= 8) {
      onStatus?.(`仍在识别…已等待 ${elapsedSec} 秒（本机首次可能较慢）`);
    }
  }, 4_000);

  try {
    const response = await fetch(AI_API.speechTranscribe, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Audio-Sample-Rate': String(TARGET_SAMPLE_RATE),
      },
      body: samples.buffer.slice(samples.byteOffset, samples.byteOffset + samples.byteLength),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | { text?: string }
      | { error?: string }
      | null;

    if (!response.ok) {
      const message =
        payload && 'error' in payload && payload.error
          ? payload.error
          : `语音识别失败（HTTP ${response.status}）`;
      throw new Error(message);
    }

    const text = payload && 'text' in payload ? payload.text?.trim() ?? '' : '';
    if (!text) {
      throw new Error('没听清，请靠近麦克风、说清楚再试一次');
    }
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('识别超时：请确认「蜗牛旅行-开发服」窗口未关闭，然后重试');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    window.clearInterval(progressId);
  }
}
