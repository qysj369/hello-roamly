import { extractAdvisorSpeechText } from '@/lib/speech/advisorSpeechHallucinations';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';
import { resolveSpeechAsrProvider } from './speechAsrConfig';
import { transcribeIflytekPcm16 } from './iflytekIat';

type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>,
) => Promise<{ text?: string }>;

let transcriberPromise: Promise<Transcriber> | null = null;

const TRAVEL_SPEECH_PROMPT =
  '杭州济南莆田银川三天预算一千五穷游出发地旅行规划景点';

const DEFAULT_WHISPER_MODEL = 'Xenova/whisper-tiny';

function resolveWhisperModel(): string {
  const configured = process.env.WHISPER_MODEL?.trim();
  return configured || DEFAULT_WHISPER_MODEL;
}

async function getSpeechTranscriber(): Promise<Transcriber> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { env, pipeline } = await import('@xenova/transformers');
      env.allowLocalModels = false;
      env.remoteHost = 'https://hf-mirror.com/';
      env.remotePathTemplate = '{model}/resolve/{revision}/';
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        resolveWhisperModel(),
      );
      return transcriber as Transcriber;
    })().catch((error) => {
      transcriberPromise = null;
      throw error;
    });
  }
  return transcriberPromise;
}

function measurePeak(samples: Float32Array): number {
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.abs(samples[index] ?? 0);
    if (value > peak) {
      peak = value;
    }
  }
  return peak;
}

function normalizePcmGain(samples: Float32Array, targetPeak = 0.3): Float32Array {
  const peak = measurePeak(samples);
  if (peak < 0.0001 || peak >= targetPeak) {
    return samples;
  }
  const gain = Math.min(targetPeak / peak, 12);
  const boosted = new Float32Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    boosted[index] = Math.max(-1, Math.min(1, (samples[index] ?? 0) * gain));
  }
  return boosted;
}

/** 预加载 Whisper 模型，避免首次识别长时间等待 */
export async function warmupSpeechTranscriber(): Promise<{ ready: true; warmedAt: string }> {
  await getSpeechTranscriber();
  return { ready: true, warmedAt: new Date().toISOString() };
}

const MAX_SAMPLES = 16_000 * 20;

const INFERENCE_TIMEOUT_MS = 90_000;

function withInferenceTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), INFERENCE_TIMEOUT_MS);
    }),
  ]);
}

async function transcribeWithLocalWhisper(samples: Float32Array): Promise<string> {
  let transcriber: Transcriber;
  try {
    transcriber = await getSpeechTranscriber();
  } catch (error) {
    const detail = error instanceof Error ? error.message : '模型加载失败';
    if (/fetch|network|ECONNREFUSED|ENOTFOUND|timeout/i.test(detail)) {
      throw new Error('语音模型下载失败，请检查网络能否访问 hf-mirror.com');
    }
    throw new Error(`语音模型加载失败：${detail}`);
  }

  const prepared = normalizePcmGain(samples);
  const durationSec = Math.max(1, prepared.length / 16_000);

  const result = await withInferenceTimeout(
    transcriber(prepared, {
      language: 'chinese',
      task: 'transcribe',
      chunk_length_s: Math.min(20, Math.ceil(durationSec + 1)),
      stride_length_s: 2,
      return_timestamps: false,
      initial_prompt: TRAVEL_SPEECH_PROMPT,
    }),
    '本地识别超时：本机 CPU 太慢。请修复讯飞 Key（控制台 licc failed）或直接打字',
  );

  const text = extractAdvisorSpeechText(result?.text?.trim() ?? '');
  if (!text) {
    throw new Error('没听清：Chrome 易出乱码，请换 Microsoft Edge 或直接打字');
  }
  return correctAdvisorSpeechIntent(text);
}

export async function transcribePcm16kMono(samples: Float32Array): Promise<string> {
  if (!samples.length) {
    throw new Error('录音为空，请再试一次');
  }
  if (samples.length > MAX_SAMPLES) {
    throw new Error('录音过长，请控制在 20 秒以内');
  }

  const provider = resolveSpeechAsrProvider();
  if (provider === 'iflytek') {
    try {
      const raw = await transcribeIflytekPcm16(samples);
      return correctAdvisorSpeechIntent(extractAdvisorSpeechText(raw));
    } catch (error) {
      const detail = error instanceof Error ? error.message : '';
      if (/licc|auth|授权|quota|appid/i.test(detail)) {
        return transcribeWithLocalWhisper(samples);
      }
      throw error;
    }
  }

  return transcribeWithLocalWhisper(samples);
}
