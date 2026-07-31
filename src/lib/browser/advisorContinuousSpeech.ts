import { requestVoiceDialogMicrophoneStream } from '@/lib/browser/advisorMicrophoneDevices';
import { advisorVoiceDialogNetworkHint } from '@/lib/browser/advisorSpeechBrowser';
import { getSpeechRecognitionCtor } from '@/lib/browser/advisorSpeechRecognition';

const SILENCE_SEND_MS = 1_800;
const MIN_UTTERANCE_CHARS = 2;
const NETWORK_RETRY_MS = 1_200;
const MAX_NETWORK_RETRIES = 4;
const NO_SPEECH_HINT_MS = 8_000;

export type AdvisorContinuousSpeechCallbacks = {
  onInterim?: (text: string) => void;
  onUtterance: (text: string) => void;
  onError?: (message: string) => void;
  onStatus?: (message: string) => void;
  onFatalError?: (message: string) => void;
  microphoneDeviceId?: string | null;
};

/** 连续听写：停顿后自动断句并回调 onUtterance */
export class AdvisorContinuousSpeechSession {
  private recognition: SpeechRecognition | null = null;

  private running = false;

  private paused = false;

  private committedText = '';

  private interimText = '';

  private silenceTimer: number | null = null;

  private networkRetryTimer: number | null = null;

  private noSpeechTimer: number | null = null;

  private networkRetryCount = 0;

  private heardSpeech = false;

  private callbacks: AdvisorContinuousSpeechCallbacks;

  constructor(callbacks: AdvisorContinuousSpeechCallbacks) {
    this.callbacks = callbacks;
  }

  static isSupported(): boolean {
    return getSpeechRecognitionCtor() != null;
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer != null) {
      window.clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  private clearNetworkRetryTimer(): void {
    if (this.networkRetryTimer != null) {
      window.clearTimeout(this.networkRetryTimer);
      this.networkRetryTimer = null;
    }
  }

  private clearNoSpeechTimer(): void {
    if (this.noSpeechTimer != null) {
      window.clearTimeout(this.noSpeechTimer);
      this.noSpeechTimer = null;
    }
  }

  private currentPreview(): string {
    return `${this.committedText}${this.interimText}`.trim();
  }

  private scheduleUtteranceSend(): void {
    this.clearSilenceTimer();
    this.silenceTimer = window.setTimeout(() => {
      this.flushUtterance();
    }, SILENCE_SEND_MS);
  }

  private flushUtterance(): void {
    this.clearSilenceTimer();
    const text = this.currentPreview();
    this.committedText = '';
    this.interimText = '';
    if (text.length >= MIN_UTTERANCE_CHARS) {
      this.heardSpeech = true;
      this.callbacks.onUtterance(text);
    }
  }

  private resetNoSpeechTimer(): void {
    this.clearNoSpeechTimer();
    if (!this.running || this.paused) {
      return;
    }
    this.noSpeechTimer = window.setTimeout(() => {
      if (!this.heardSpeech && this.running && !this.paused) {
        this.callbacks.onStatus?.('没听到声音：请靠近麦克风，清晰说完整句子');
      }
    }, NO_SPEECH_HINT_MS);
  }

  private handleResult(event: SpeechRecognitionEvent): void {
    this.networkRetryCount = 0;
    this.heardSpeech = true;
    this.clearNoSpeechTimer();

    let committed = '';
    let interim = '';

    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      const piece = result?.[0]?.transcript?.trim();
      if (!piece) {
        continue;
      }
      if (result.isFinal) {
        committed += piece;
      } else {
        interim += piece;
      }
    }

    this.committedText = committed.trim();
    this.interimText = interim.trim();

    const preview = this.currentPreview();
    if (preview) {
      this.callbacks.onInterim?.(preview);
      this.scheduleUtteranceSend();
      this.callbacks.onStatus?.(`听到：${preview}`);
    }
  }

  private handleRecognitionError(error: string): void {
    if (error === 'no-speech' || error === 'aborted') {
      return;
    }

    if (error === 'network') {
      if (this.running && !this.paused && this.networkRetryCount < MAX_NETWORK_RETRIES) {
        this.networkRetryCount += 1;
        this.callbacks.onStatus?.(
          `语音连接中断，正在重试（${this.networkRetryCount}/${MAX_NETWORK_RETRIES}）…`,
        );
        this.clearNetworkRetryTimer();
        this.networkRetryTimer = window.setTimeout(() => {
          void this.restartRecognition();
        }, NETWORK_RETRY_MS);
        return;
      }
      this.callbacks.onFatalError?.(advisorVoiceDialogNetworkHint());
      return;
    }

    if (error === 'not-allowed' || error === 'service-not-allowed') {
      this.callbacks.onFatalError?.('请允许麦克风权限（地址栏锁图标 → 麦克风）');
      return;
    }

    this.callbacks.onError?.(`语音识别异常，请改用按住麦克风或打字（${error}）`);
  }

  private bindRecognition(recognition: SpeechRecognition): void {
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      if (this.paused) {
        return;
      }
      this.handleResult(event);
    };

    recognition.onerror = (event) => {
      this.handleRecognitionError(event.error);
    };

    recognition.onstart = () => {
      this.callbacks.onStatus?.('麦克风已连接，请大声说话');
    };

    recognition.onend = () => {
      const pending = this.currentPreview();
      if (pending.length >= MIN_UTTERANCE_CHARS && !this.paused) {
        this.flushUtterance();
      }

      if (!this.running) {
        this.recognition = null;
        return;
      }
      this.recognition = null;
      if (!this.paused && this.networkRetryTimer == null) {
        void this.restartRecognition();
      }
    };

    recognition.onspeechstart = () => {
      this.heardSpeech = true;
      this.clearNoSpeechTimer();
    };
  }

  private async primeMicrophone(): Promise<void> {
    const stream = await requestVoiceDialogMicrophoneStream({
      deviceId: this.callbacks.microphoneDeviceId ?? null,
      useAutoGain: true,
    });
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }

  private async restartRecognition(): Promise<void> {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !this.running || this.paused) {
      return;
    }
    try {
      await this.primeMicrophone();
    } catch {
      this.callbacks.onFatalError?.('无法访问麦克风：请 Win+I → 声音 → 输入，选「麦克风阵列 Realtek」');
      return;
    }
    const recognition = new Ctor();
    this.bindRecognition(recognition);
    this.recognition = recognition;
    try {
      recognition.start();
      this.heardSpeech = false;
      this.resetNoSpeechTimer();
      this.callbacks.onStatus?.('正在听…说完停顿会自动发送');
    } catch {
      this.callbacks.onFatalError?.('无法启动连续语音识别，请换 Edge 或改用打字');
    }
  }

  async start(): Promise<void> {
    if (!AdvisorContinuousSpeechSession.isSupported()) {
      this.callbacks.onFatalError?.('当前浏览器不支持连续语音识别，请换 Edge');
      return;
    }
    this.stop();
    this.running = true;
    this.paused = false;
    this.networkRetryCount = 0;
    this.heardSpeech = false;
    this.committedText = '';
    this.interimText = '';
    await this.restartRecognition();
  }

  pause(): void {
    this.paused = true;
    this.clearSilenceTimer();
    this.clearNetworkRetryTimer();
    this.clearNoSpeechTimer();
    const recognition = this.recognition;
    this.recognition = null;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
    }
  }

  resume(): void {
    if (!this.running) {
      return;
    }
    this.paused = false;
    this.networkRetryCount = 0;
    this.heardSpeech = false;
    this.committedText = '';
    this.interimText = '';
    void this.restartRecognition();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    this.networkRetryCount = 0;
    this.heardSpeech = false;
    this.clearSilenceTimer();
    this.clearNetworkRetryTimer();
    this.clearNoSpeechTimer();
    this.committedText = '';
    this.interimText = '';
    const recognition = this.recognition;
    this.recognition = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
          /* ignore */
        }
      }
    }
  }
}
