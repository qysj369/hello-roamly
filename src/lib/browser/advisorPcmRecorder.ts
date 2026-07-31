import {
  getSavedMicrophoneDeviceId,
  getSavedWeakMicrophoneMode,
  requestVoiceDialogMicrophoneStream,
} from '@/lib/browser/advisorMicrophoneDevices';

const TARGET_SAMPLE_RATE = 16_000;

function mergeFloat32Chunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

async function resampleTo16k(samples: Float32Array, sourceRate: number): Promise<Float32Array> {
  if (sourceRate === TARGET_SAMPLE_RATE) {
    return samples;
  }
  const durationSec = samples.length / sourceRate;
  const offline = new OfflineAudioContext(
    1,
    Math.max(1, Math.ceil(durationSec * TARGET_SAMPLE_RATE)),
    TARGET_SAMPLE_RATE,
  );
  const buffer = offline.createBuffer(1, samples.length, sourceRate);
  buffer.copyToChannel(samples, 0);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

export function measurePeakAmplitude(samples: Float32Array): number {
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.abs(samples[index] ?? 0);
    if (value > peak) {
      peak = value;
    }
  }
  return peak;
}

/** 音量偏小时自动增益，提升 Whisper 识别率 */
export function normalizePcmGain(samples: Float32Array, targetPeak = 0.28): Float32Array {
  const peak = measurePeakAmplitude(samples);
  if (peak < 0.0001) {
    return samples;
  }
  if (peak >= targetPeak) {
    return samples;
  }

  const gain = Math.min(targetPeak / peak, 18);
  const boosted = new Float32Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    boosted[index] = Math.max(-1, Math.min(1, (samples[index] ?? 0) * gain));
  }
  return boosted;
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器无法访问麦克风');
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

function createAudioContext(): AudioContext {
  const win = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) {
    throw new Error('当前浏览器不支持音频采集');
  }
  return new Ctor();
}

/** AudioContext 直采 PCM（Windows 上比 MediaRecorder 更稳） */
export class AdvisorPcmRecorder {
  private stream: MediaStream | null = null;

  private audioContext: AudioContext | null = null;

  private processor: ScriptProcessorNode | null = null;

  private source: MediaStreamAudioSourceNode | null = null;

  private muteGain: GainNode | null = null;

  private chunks: Float32Array[] = [];

  private capturing = false;

  async start(): Promise<void> {
    this.stream = await requestVoiceDialogMicrophoneStream({
      deviceId: getSavedMicrophoneDeviceId(),
      useAutoGain: getSavedWeakMicrophoneMode(),
    });

    this.audioContext = createAudioContext();
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.muteGain = this.audioContext.createGain();
    this.muteGain.gain.value = 0;

    this.chunks = [];
    this.capturing = false;

    this.processor.onaudioprocess = (event) => {
      if (!this.capturing) {
        return;
      }
      const channel = event.inputBuffer.getChannelData(0);
      this.chunks.push(new Float32Array(channel));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.muteGain);
    this.muteGain.connect(this.audioContext.destination);

    // ScriptProcessor 首帧常为静音，延迟 120ms 再开始采集
    await new Promise((resolve) => {
      window.setTimeout(resolve, 120);
    });
    this.capturing = true;
  }

  async stop(): Promise<Float32Array> {
    this.capturing = false;

    const sampleRate = this.audioContext?.sampleRate ?? TARGET_SAMPLE_RATE;
    const merged = mergeFloat32Chunks(this.chunks);
    this.chunks = [];

    this.processor?.disconnect();
    this.source?.disconnect();
    this.muteGain?.disconnect();
    this.processor = null;
    this.source = null;
    this.muteGain = null;

    for (const track of this.stream?.getTracks() ?? []) {
      track.stop();
    }
    this.stream = null;

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    const resampled = await resampleTo16k(merged, sampleRate);
    return normalizePcmGain(resampled);
  }
}
