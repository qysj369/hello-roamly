import {
  describeMicrophoneTrack,
  requestVoiceDialogMicrophoneStream,
} from '@/lib/browser/advisorMicrophoneDevices';
import { measurePeakAmplitude, normalizePcmGain } from '@/lib/browser/advisorPcmRecorder';
import { transcribePcmSamples } from '@/lib/browser/advisorLocalSpeech';

const TARGET_SAMPLE_RATE = 16_000;
const MIN_INPUT_PEAK = 0.001;
const SPEECH_PEAK = 0.008;
const SILENCE_MS = 2_000;
const MIN_UTTERANCE_SEC = 0.8;
const LEVEL_POLL_MS = 50;

export type AdvisorWhisperVoiceDialogCallbacks = {
  onUtterance: (text: string) => void;
  onPreview?: (text: string) => void;
  onStatus?: (message: string) => void;
  onError?: (message: string) => void;
  onFatalError?: (message: string) => void;
  onRecordingChange?: (recording: boolean) => void;
  onInputLevel?: (peak: number) => void;
  microphoneDeviceId?: string | null;
  useAutoGain?: boolean;
};

function downsampleTo16k(input: Float32Array, sourceRate: number): Float32Array {
  if (sourceRate === TARGET_SAMPLE_RATE) {
    return input;
  }
  const ratio = sourceRate / TARGET_SAMPLE_RATE;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const sourceIndex = Math.min(input.length - 1, Math.floor(index * ratio));
    output[index] = input[sourceIndex] ?? 0;
  }
  return output;
}

/** 本地 Whisper 语音对话：采集 PCM，静音自动断句识别 */
export class AdvisorWhisperVoiceDialogSession {
  private stream: MediaStream | null = null;

  private audioContext: AudioContext | null = null;

  private processor: ScriptProcessorNode | null = null;

  private analyser: AnalyserNode | null = null;

  private source: MediaStreamAudioSourceNode | null = null;

  private muteGain: GainNode | null = null;

  private levelTimer: number | null = null;

  private running = false;

  private paused = false;

  private capturing = false;

  private recording = false;

  private transcribing = false;

  private sessionPeak = 0;

  private utteranceChunks: Float32Array[] = [];

  private utteranceStarted = false;

  private lastSoundAt = 0;

  private silenceTimer: number | null = null;

  private microphoneDeviceId: string | null = null;

  private useAutoGain = false;

  private callbacks: AdvisorWhisperVoiceDialogCallbacks;

  constructor(callbacks: AdvisorWhisperVoiceDialogCallbacks) {
    this.callbacks = callbacks;
    this.microphoneDeviceId = callbacks.microphoneDeviceId ?? null;
    this.useAutoGain = callbacks.useAutoGain ?? false;
  }

  private setRecording(next: boolean): void {
    if (this.recording === next) {
      return;
    }
    this.recording = next;
    this.callbacks.onRecordingChange?.(next);
  }

  private showListeningStatus(): void {
    if (this.paused || this.transcribing) {
      return;
    }
    this.callbacks.onStatus?.('请大声说话，观察下方音量条是否跳动');
  }

  private reportInputLevel(peak: number): void {
    if (peak > this.sessionPeak) {
      this.sessionPeak = peak;
    }
    this.callbacks.onInputLevel?.(peak);
  }

  private readAnalyserPeak(): number {
    const analyser = this.analyser;
    if (!analyser) {
      return 0;
    }
    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);
    let peak = 0;
    for (let index = 0; index < timeData.length; index += 1) {
      const value = Math.abs(((timeData[index] ?? 128) - 128) / 128);
      if (value > peak) {
        peak = value;
      }
    }
    return peak;
  }

  private startLevelPolling(): void {
    this.stopLevelPolling();
    if (!this.analyser) {
      return;
    }
    this.levelTimer = window.setInterval(() => {
      if (!this.running) {
        return;
      }
      void this.ensureAudioCaptureActive();
      this.reportInputLevel(this.readAnalyserPeak());
    }, LEVEL_POLL_MS);
  }

  private stopLevelPolling(): void {
    if (this.levelTimer !== null) {
      window.clearInterval(this.levelTimer);
      this.levelTimer = null;
    }
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer !== null) {
      window.clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private scheduleSilenceFlush(): void {
    this.clearSilenceTimer();
    this.silenceTimer = window.setTimeout(() => {
      void this.flushUtterance();
    }, SILENCE_MS);
  }

  private resetUtterance(): void {
    this.utteranceChunks = [];
    this.utteranceStarted = false;
    this.lastSoundAt = 0;
    this.clearSilenceTimer();
  }

  private processAudioSamples(samples: Float32Array, sampleRate: number): void {
    if (this.paused || !this.capturing || this.transcribing) {
      return;
    }

    let pcm = downsampleTo16k(samples, sampleRate);
    const chunkPeak = measurePeakAmplitude(pcm);
    if (chunkPeak > this.sessionPeak) {
      this.sessionPeak = chunkPeak;
    }

    const peakForGain = Math.max(this.sessionPeak, chunkPeak, 0.00001);
    if (peakForGain < 0.28) {
      const gain = Math.min(0.4 / peakForGain, peakForGain < 0.02 || this.useAutoGain ? 56 : 36);
      const boosted = new Float32Array(pcm.length);
      for (let index = 0; index < pcm.length; index += 1) {
        boosted[index] = Math.max(-1, Math.min(1, (pcm[index] ?? 0) * gain));
      }
      pcm = boosted;
    }

    const boostedPeak = measurePeakAmplitude(pcm);
    if (boostedPeak >= SPEECH_PEAK) {
      this.utteranceStarted = true;
      this.lastSoundAt = Date.now();
      this.utteranceChunks.push(pcm);
      this.callbacks.onPreview?.('听到声音…');
      this.scheduleSilenceFlush();
      return;
    }

    if (this.utteranceStarted) {
      this.utteranceChunks.push(pcm);
      if (Date.now() - this.lastSoundAt >= SILENCE_MS) {
        void this.flushUtterance();
      }
    }
  }

  private mergeUtteranceChunks(): Float32Array {
    const total = this.utteranceChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Float32Array(total);
    let offset = 0;
    for (const chunk of this.utteranceChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    return merged;
  }

  private async flushUtterance(): Promise<void> {
    if (this.transcribing || this.paused || !this.running) {
      return;
    }

    this.clearSilenceTimer();
    const pcm = this.mergeUtteranceChunks();
    this.resetUtterance();

    const durationSec = pcm.length / TARGET_SAMPLE_RATE;
    if (durationSec < MIN_UTTERANCE_SEC) {
      this.showListeningStatus();
      return;
    }

    const peak = measurePeakAmplitude(pcm);
    if (peak < MIN_INPUT_PEAK) {
      this.callbacks.onError?.(
        `没录到声音（${describeMicrophoneTrack(this.stream!)}）：Win+I → 声音 → 输入，选「麦克风阵列 Realtek」`,
      );
      this.showListeningStatus();
      return;
    }

    this.transcribing = true;
    this.setRecording(false);
    this.callbacks.onStatus?.('正在识别语音…');

    try {
      const normalized = normalizePcmGain(pcm, 0.35);
      const text = await transcribePcmSamples(normalized, (message) => {
        this.callbacks.onStatus?.(message);
      });
      if (text.trim()) {
        this.callbacks.onUtterance(text.trim());
      } else {
        this.callbacks.onError?.('没听清，请大声说完整句子');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '语音识别失败';
      this.callbacks.onError?.(message);
    } finally {
      this.transcribing = false;
      if (this.running && !this.paused) {
        this.setRecording(true);
        this.showListeningStatus();
      }
    }
  }

  private async ensureAudioCaptureActive(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async start(): Promise<void> {
    this.stop();
    this.running = true;
    this.paused = false;
    this.capturing = false;
    this.transcribing = false;
    this.sessionPeak = 0;
    this.resetUtterance();
    this.callbacks.onStatus?.('正在连接麦克风…');

    try {
      this.stream = await requestVoiceDialogMicrophoneStream({
        deviceId: this.microphoneDeviceId,
        useAutoGain: this.useAutoGain,
      });

      const track = this.stream.getAudioTracks()[0];
      if (track?.muted) {
        throw new Error('麦克风被系统静音，请在 Windows 声音设置中取消静音');
      }

      const win = window as Window & { webkitAudioContext?: typeof AudioContext };
      const Ctor = win.AudioContext ?? win.webkitAudioContext;
      if (!Ctor) {
        throw new Error('当前浏览器不支持音频采集');
      }

      const audioContext = new Ctor();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(this.stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;

      processor.onaudioprocess = (event) => {
        if (!this.running) {
          return;
        }
        const channel = event.inputBuffer.getChannelData(0);
        this.processAudioSamples(new Float32Array(channel), audioContext.sampleRate);
      };

      source.connect(analyser);
      source.connect(processor);
      analyser.connect(muteGain);
      processor.connect(muteGain);
      muteGain.connect(audioContext.destination);

      this.audioContext = audioContext;
      this.source = source;
      this.analyser = analyser;
      this.processor = processor;
      this.muteGain = muteGain;

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 220);
      });
      await this.ensureAudioCaptureActive();
      this.capturing = true;
      this.startLevelPolling();
      if (!this.paused) {
        this.showListeningStatus();
        this.setRecording(true);
      }
    } catch (error) {
      this.running = false;
      const message = error instanceof Error ? error.message : '无法启动语音对话';
      this.callbacks.onFatalError?.(message);
    }
  }

  pause(): void {
    this.paused = true;
    this.clearSilenceTimer();
    this.setRecording(false);
    this.callbacks.onStatus?.('顾问回复中…语音对话已暂停');
  }

  async resume(): Promise<void> {
    if (!this.running) {
      return;
    }
    this.paused = false;
    this.resetUtterance();
    await this.ensureAudioCaptureActive();
    this.capturing = true;
    this.showListeningStatus();
    this.setRecording(true);
  }

  stop(): void {
    this.clearSilenceTimer();
    this.stopLevelPolling();
    this.running = false;
    this.paused = false;
    this.capturing = false;
    this.transcribing = false;
    this.resetUtterance();

    this.processor?.disconnect();
    this.analyser?.disconnect();
    this.source?.disconnect();
    this.muteGain?.disconnect();
    this.processor = null;
    this.analyser = null;
    this.source = null;
    this.muteGain = null;

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }

    for (const track of this.stream?.getTracks() ?? []) {
      track.stop();
    }
    this.stream = null;
    this.setRecording(false);
  }
}
