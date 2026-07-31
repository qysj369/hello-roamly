import {
  describeMicrophoneTrack,
  requestVoiceDialogMicrophoneStream,
} from '@/lib/browser/advisorMicrophoneDevices';
import { measurePeakAmplitude, normalizePcmGain } from '@/lib/browser/advisorPcmRecorder';
import { transcribePcmSamples } from '@/lib/browser/advisorLocalSpeech';

const TARGET_SAMPLE_RATE = 16_000;
const MIN_SPEECH_MS = 600;
const HEARD_PEAK = 0.0003;
const LEVEL_POLL_MS = 50;

export type AdvisorPcmVoiceDialogCallbacks = {
  onUtterance: (text: string) => void;
  onStatus?: (message: string) => void;
  onError?: (message: string) => void;
  onFatalError?: (message: string) => void;
  onRecordingChange?: (recording: boolean) => void;
  onInputLevel?: (peak: number) => void;
  onTranscribingChange?: (transcribing: boolean) => void;
  microphoneDeviceId?: string | null;
  useAutoGain?: boolean;
};

function pickRecorderMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  for (const mimeType of candidates) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return '';
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

async function decodeBlobToPcm16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const win = window as Window & { webkitAudioContext?: typeof AudioContext };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) {
    throw new Error('当前浏览器不支持音频解码');
  }
  const audioContext = new Ctor();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const channel = audioBuffer.getChannelData(0);
    const samples = new Float32Array(channel);
    const resampled = await resampleTo16k(samples, audioBuffer.sampleRate);
    return normalizePcmGain(resampled, 0.45);
  } finally {
    await audioContext.close();
  }
}

/** MediaRecorder 录音，点「说完了」再识别（Windows/Edge 上比 ScriptProcessor 更稳） */
export class AdvisorPcmVoiceDialogSession {
  private stream: MediaStream | null = null;

  private mediaRecorder: MediaRecorder | null = null;

  private audioContext: AudioContext | null = null;

  private analyser: AnalyserNode | null = null;

  private levelTimer: number | null = null;

  private segmentBlobs: Blob[] = [];

  private segmentStartedAt = 0;

  private mimeType = '';

  private running = false;

  private paused = false;

  private transcribing = false;

  private recording = false;

  private microphoneDeviceId: string | null = null;

  private useAutoGain = true;

  private callbacks: AdvisorPcmVoiceDialogCallbacks;

  constructor(callbacks: AdvisorPcmVoiceDialogCallbacks) {
    this.callbacks = callbacks;
    this.microphoneDeviceId = callbacks.microphoneDeviceId ?? null;
    this.useAutoGain = callbacks.useAutoGain ?? true;
  }

  private setTranscribing(next: boolean): void {
    if (this.transcribing === next) {
      return;
    }
    this.transcribing = next;
    this.callbacks.onTranscribingChange?.(next);
  }

  private setRecording(next: boolean): void {
    if (this.recording === next) {
      return;
    }
    this.recording = next;
    this.callbacks.onRecordingChange?.(next);
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
      this.callbacks.onInputLevel?.(this.readAnalyserPeak());
    }, LEVEL_POLL_MS);
  }

  private stopLevelPolling(): void {
    if (this.levelTimer !== null) {
      window.clearInterval(this.levelTimer);
      this.levelTimer = null;
    }
  }

  private async setupLevelMeter(): Promise<void> {
    if (!this.stream) {
      return;
    }
    const win = window as Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = win.AudioContext ?? win.webkitAudioContext;
    if (!Ctor) {
      return;
    }
    const audioContext = new Ctor();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    const source = audioContext.createMediaStreamSource(this.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const muteGain = audioContext.createGain();
    muteGain.gain.value = 0;
    source.connect(analyser);
    analyser.connect(muteGain);
    muteGain.connect(audioContext.destination);
    this.audioContext = audioContext;
    this.analyser = analyser;
    this.startLevelPolling();
  }

  private startRecorder(): void {
    if (!this.stream || this.paused || !this.running) {
      return;
    }

    this.segmentBlobs = [];
    this.segmentStartedAt = Date.now();
    this.mimeType = pickRecorderMimeType();

    const options = this.mimeType ? { mimeType: this.mimeType } : undefined;
    const recorder = new MediaRecorder(this.stream, options);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.segmentBlobs.push(event.data);
      }
    };
    recorder.onerror = () => {
      this.callbacks.onError?.('录音异常，请关闭语音对话后重试');
    };

    this.mediaRecorder = recorder;
    recorder.start(250);
    this.setRecording(true);
  }

  private stopRecorder(): Promise<Blob | null> {
    const recorder = this.mediaRecorder;
    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(
        this.segmentBlobs.length
          ? new Blob(this.segmentBlobs, { type: this.mimeType || 'audio/webm' })
          : null,
      );
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = (blob: Blob | null) => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        this.mediaRecorder = null;
        this.segmentBlobs = [];
        resolve(blob);
      };

      const timeoutId = window.setTimeout(() => {
        finish(
          this.segmentBlobs.length
            ? new Blob(this.segmentBlobs, { type: recorder.mimeType || this.mimeType || 'audio/webm' })
            : null,
        );
      }, 1_500);

      recorder.onstop = () => {
        const blob = this.segmentBlobs.length
          ? new Blob(this.segmentBlobs, { type: recorder.mimeType || this.mimeType || 'audio/webm' })
          : null;
        finish(blob);
      };

      try {
        if (recorder.state === 'recording') {
          recorder.requestData();
        }
        recorder.stop();
      } catch {
        finish(null);
      }
    });
  }

  private async decodeBlobWithTimeout(blob: Blob): Promise<Float32Array> {
    return Promise.race([
      decodeBlobToPcm16k(blob),
      new Promise<Float32Array>((_, reject) => {
        window.setTimeout(() => reject(new Error('音频解码超时，请重试')), 12_000);
      }),
    ]);
  }

  private async flushSegment(): Promise<void> {
    if (this.transcribing || !this.running) {
      return;
    }

    this.setTranscribing(true);

    try {
      this.callbacks.onStatus?.('正在处理录音…');

      const elapsedMs = Date.now() - this.segmentStartedAt;
      const blob = await this.stopRecorder();
      this.setRecording(false);

      if (!blob || blob.size < 200) {
        this.callbacks.onError?.('还没录到内容：请先大声说 1 秒，再点「说完了」');
        return;
      }
      if (elapsedMs < MIN_SPEECH_MS) {
        this.callbacks.onError?.('录音太短，请多说 1 秒再点「说完了」');
        return;
      }

      this.callbacks.onStatus?.('正在解码录音…');
      const pcm = await this.decodeBlobWithTimeout(blob);
      const peak = measurePeakAmplitude(pcm);
      if (peak < HEARD_PEAK) {
        const deviceHint = this.stream ? describeMicrophoneTrack(this.stream) : '默认麦克风';
        this.callbacks.onError?.(
          `没录到声音（${deviceHint}）：Win+I → 系统 → 声音 → 输入，选「麦克风阵列 Realtek」并调高音量`,
        );
        return;
      }

      this.callbacks.onStatus?.('正在识别语音…');
      const text = await transcribePcmSamples(pcm, (message) => {
        this.callbacks.onStatus?.(message);
      });
      if (text.trim()) {
        this.callbacks.onUtterance(text.trim());
        this.callbacks.onStatus?.('请大声说话，说完点上方「说完了」按钮');
      } else {
        this.callbacks.onError?.('没听清，请大声说完整句子后再点「说完了」');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '语音识别失败';
      this.callbacks.onError?.(message);
    } finally {
      this.setTranscribing(false);
      if (this.running && !this.paused && !this.mediaRecorder) {
        this.startRecorder();
      }
    }
  }

  async start(): Promise<void> {
    this.stop();
    this.running = true;
    this.paused = false;
    this.setTranscribing(false);

    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('当前浏览器不支持录音，请换 Edge 最新版');
      }

      this.stream = await requestVoiceDialogMicrophoneStream({
        deviceId: this.microphoneDeviceId,
        useAutoGain: true,
      });

      const track = this.stream.getAudioTracks()[0];
      if (track?.muted) {
        throw new Error('麦克风被系统静音，请在 Windows 声音设置中取消静音');
      }

      await this.setupLevelMeter();
      this.startRecorder();
      this.callbacks.onStatus?.('请大声说话，说完点上方「说完了」按钮');
    } catch (error) {
      this.running = false;
      const message = error instanceof Error ? error.message : '无法启动麦克风';
      throw new Error(message);
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  forceFinishUtterance(): void {
    if (!this.running) {
      this.callbacks.onError?.('语音未启动，请关闭后重新开启绿色波形');
      return;
    }
    if (this.transcribing) {
      this.callbacks.onStatus?.('正在识别上一条，请稍候…');
      return;
    }
    void this.flushSegment();
  }

  pause(): void {
    this.paused = true;
    void this.stopRecorder();
    this.setRecording(false);
    this.callbacks.onStatus?.('顾问回复中…语音对话已暂停');
  }

  resume(): void {
    if (!this.running) {
      return;
    }
    this.paused = false;
    this.startRecorder();
    this.callbacks.onStatus?.('请大声说话，说完点上方「说完了」按钮');
  }

  stop(): void {
    this.stopLevelPolling();
    this.running = false;
    this.paused = false;
    this.setTranscribing(false);
    void this.stopRecorder();
    this.setRecording(false);

    this.analyser?.disconnect();
    this.analyser = null;
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }

    for (const track of this.stream?.getTracks() ?? []) {
      track.stop();
    }
    this.stream = null;
  }
}
