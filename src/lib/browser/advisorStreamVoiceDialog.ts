import {
  describeMicrophoneTrack,
  requestVoiceDialogMicrophoneStream,
} from '@/lib/browser/advisorMicrophoneDevices';
import { measurePeakAmplitude } from '@/lib/browser/advisorPcmRecorder';

const TARGET_SAMPLE_RATE = 16_000;
const PCM_CHUNK_BYTES = 1280;
const MIN_INPUT_PEAK = 0.001;
const LOW_INPUT_WARN_MS = 4_000;
const LEVEL_POLL_MS = 50;

export type AdvisorStreamVoiceDialogCallbacks = {
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

function floatToInt16(samples: Float32Array): Int16Array {
  const int16 = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0));
    int16[index] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return int16;
}

function buildSpeechStreamUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/ai/speech-stream`;
}

/** 讯飞流式语音对话：连续听写，静音自动断句发送 */
export class AdvisorStreamVoiceDialogSession {
  private stream: MediaStream | null = null;

  private audioContext: AudioContext | null = null;

  private processor: ScriptProcessorNode | null = null;

  private analyser: AnalyserNode | null = null;

  private source: MediaStreamAudioSourceNode | null = null;

  private muteGain: GainNode | null = null;

  private levelTimer: number | null = null;

  private ws: WebSocket | null = null;

  private running = false;

  private paused = false;

  private capturing = false;

  private recording = false;

  private sessionPeak = 0;

  private pcmPending: number[] = [];

  private keepAliveTimer: number | null = null;

  private visibilityHandler: (() => void) | null = null;

  private lowInputTimer: number | null = null;

  private lowInputWarned = false;

  private microphoneDeviceId: string | null = null;

  private useAutoGain = false;

  private callbacks: AdvisorStreamVoiceDialogCallbacks;

  constructor(callbacks: AdvisorStreamVoiceDialogCallbacks) {
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
    if (this.paused) {
      return;
    }
    this.callbacks.onStatus?.('请大声说话，观察下方音量条是否跳动');
  }

  private async ensureAudioCaptureActive(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private startCaptureKeepAlive(): void {
    this.stopCaptureKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      if (!this.running) {
        return;
      }
      void this.ensureAudioCaptureActive();
    }, 1500);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && this.running && !this.paused) {
        void this.ensureAudioCaptureActive();
      }
    };
    this.visibilityHandler = onVisible;
    document.addEventListener('visibilitychange', onVisible);
  }

  private stopCaptureKeepAlive(): void {
    if (this.keepAliveTimer !== null) {
      window.clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    if (this.lowInputTimer !== null) {
      window.clearTimeout(this.lowInputTimer);
      this.lowInputTimer = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  private scheduleLowInputCheck(): void {
    if (this.lowInputTimer !== null) {
      window.clearTimeout(this.lowInputTimer);
    }
    this.lowInputTimer = window.setTimeout(() => {
      this.lowInputTimer = null;
      if (!this.running || this.paused || this.lowInputWarned) {
        return;
      }
      if (this.sessionPeak < MIN_INPUT_PEAK) {
        this.lowInputWarned = true;
        const deviceHint = describeMicrophoneTrack(this.stream!);
        if (this.sessionPeak <= 0.00005) {
          this.callbacks.onError?.(
            `未收到麦克风信号（${deviceHint}）：请在下拉框切换到 Realtek 麦克风后点「重新检测」`,
          );
        } else {
          this.callbacks.onStatus?.(
            `音量偏低（${deviceHint}）：请靠近麦克风大声说话，观察音量条是否跳动`,
          );
        }
      }
    }, LOW_INPUT_WARN_MS);
  }

  private processAudioSamples(samples: Float32Array, sampleRate: number): void {
    const chunkPeak = measurePeakAmplitude(samples);
    if (chunkPeak > this.sessionPeak) {
      this.sessionPeak = chunkPeak;
    }
    if (chunkPeak >= MIN_INPUT_PEAK) {
      this.lowInputWarned = false;
    }

    if (this.paused || !this.capturing) {
      return;
    }

    let pcm = downsampleTo16k(samples, sampleRate);
    const peakForGain = Math.max(this.sessionPeak, chunkPeak, 0.00001);
    const weakMic = peakForGain < 0.02;
    if (peakForGain < 0.28) {
      const gain = Math.min(0.4 / peakForGain, weakMic || this.useAutoGain ? 56 : 36);
      const boosted = new Float32Array(pcm.length);
      for (let index = 0; index < pcm.length; index += 1) {
        boosted[index] = Math.max(-1, Math.min(1, (pcm[index] ?? 0) * gain));
      }
      pcm = boosted;
    }

    const int16 = floatToInt16(pcm);
    for (let index = 0; index < int16.length; index += 1) {
      this.pcmPending.push(int16[index] ?? 0);
    }
    this.flushPcmChunks();
  }

  private reportInputLevel(peak: number): void {
    if (peak > this.sessionPeak) {
      this.sessionPeak = peak;
    }
    if (peak >= MIN_INPUT_PEAK) {
      this.lowInputWarned = false;
      if (peak >= 0.008 && !this.paused) {
        this.callbacks.onStatus?.('请说话，停顿约 2 秒自动发送');
      }
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
      if (!this.running || !this.analyser) {
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

  private flushPcmChunks(force = false): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    while (this.pcmPending.length >= PCM_CHUNK_BYTES / 2 || (force && this.pcmPending.length > 0)) {
      const sampleCount = force
        ? this.pcmPending.length
        : Math.min(this.pcmPending.length, PCM_CHUNK_BYTES / 2);
      const chunk = this.pcmPending.splice(0, sampleCount);
      const buffer = new ArrayBuffer(chunk.length * 2);
      const view = new DataView(buffer);
      for (let index = 0; index < chunk.length; index += 1) {
        view.setInt16(index * 2, chunk[index] ?? 0, true);
      }
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      ws.send(JSON.stringify({ type: 'audio', data: base64 }));
    }
  }

  private handleWsMessage(raw: string): void {
    let payload: { type?: string; text?: string; message?: string };
    try {
      payload = JSON.parse(raw) as { type?: string; text?: string; message?: string };
    } catch {
      this.callbacks.onError?.('语音服务返回异常');
      return;
    }

    if (payload.type === 'ready') {
      if (!this.paused) {
        this.showListeningStatus();
        this.setRecording(true);
      }
      return;
    }

    if (payload.type === 'partial' && payload.text?.trim()) {
      this.callbacks.onPreview?.(`听到：${payload.text.trim()}`);
      return;
    }

    if (payload.type === 'final' && payload.text?.trim()) {
      this.callbacks.onUtterance(payload.text.trim());
      if (!this.paused) {
        this.showListeningStatus();
      }
      return;
    }

    if (payload.type === 'error' && payload.message) {
      if (/licc|授权|11200|no license/i.test(payload.message)) {
        this.callbacks.onFatalError?.(payload.message);
        this.stop();
        return;
      }
      this.callbacks.onError?.(payload.message);
    }
  }

  private async connectWebSocket(): Promise<void> {
    const ws = new WebSocket(buildSpeechStreamUrl());
    this.ws = ws;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error('语音服务连接超时'));
      }, 12_000);

      ws.onopen = () => {
        window.clearTimeout(timeout);
        ws.send(JSON.stringify({ type: 'start' }));
        resolve();
      };

      ws.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('语音服务连接失败'));
      };

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          this.handleWsMessage(event.data);
        }
      };

      ws.onclose = () => {
        if (this.running) {
          this.callbacks.onError?.('语音连接已断开，请重新开启语音对话');
        }
      };
    });
  }

  async start(): Promise<void> {
    this.stop();
    this.running = true;
    this.paused = false;
    this.capturing = false;
    this.sessionPeak = 0;
    this.pcmPending = [];
    this.callbacks.onStatus?.('正在连接语音服务…');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('当前浏览器无法访问麦克风');
      }

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

      await this.connectWebSocket();

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 220);
      });
      await this.ensureAudioCaptureActive();
      this.capturing = true;
      this.startLevelPolling();
      this.startCaptureKeepAlive();
      this.scheduleLowInputCheck();
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
    this.setRecording(false);
    this.callbacks.onStatus?.('顾问回复中…语音对话已暂停');
  }

  isRunning(): boolean {
    return this.running;
  }

  async resume(): Promise<void> {
    if (!this.running) {
      return;
    }
    this.paused = false;
    this.sessionPeak = Math.max(this.sessionPeak * 0.35, 0.00001);
    this.lowInputWarned = false;
    await this.ensureAudioCaptureActive();
    this.capturing = true;
    this.startLevelPolling();
    this.scheduleLowInputCheck();
    this.showListeningStatus();
    this.setRecording(true);
  }

  stop(): void {
    this.stopCaptureKeepAlive();
    this.stopLevelPolling();
    this.running = false;
    this.paused = false;
    this.capturing = false;
    this.flushPcmChunks(true);
    try {
      this.ws?.send(JSON.stringify({ type: 'stop' }));
      this.ws?.close();
    } catch {
      // ignore
    }
    this.ws = null;

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
    this.pcmPending = [];
    this.setRecording(false);
  }
}
