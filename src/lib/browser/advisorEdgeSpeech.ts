import { getSpeechRecognitionCtor } from '@/lib/browser/advisorSpeechRecognition';

const BROWSER_STOP_WAIT_MS = 2_500;

/** 按住说话期间同步采集浏览器原生语音识别（Edge/Chrome 优先） */
export class AdvisorEdgeSpeechSession {
  private recognition: SpeechRecognition | null = null;

  private transcript = '';

  private active = false;

  private stopResolve: ((text: string) => void) | null = null;

  static isSupported(): boolean {
    return getSpeechRecognitionCtor() != null;
  }

  private abortSync(): void {
    this.active = false;
    this.stopResolve = null;
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

  start(): void {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      return;
    }

    this.abortSync();
    this.transcript = '';
    this.active = true;

    const recognition = new Ctor();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const piece = result?.[0]?.transcript?.trim();
        if (!piece) {
          continue;
        }
        if (result.isFinal) {
          finalText += piece;
        } else {
          interimText += piece;
        }
      }
      const combined = (finalText || interimText).trim();
      if (combined) {
        this.transcript = combined;
      }
    };

    recognition.onerror = () => {
      /* 失败时回退服务端识别 */
    };

    recognition.onend = () => {
      this.active = false;
      this.recognition = null;
      const text = this.transcript.trim();
      const resolve = this.stopResolve;
      this.stopResolve = null;
      resolve?.(text);
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      this.active = false;
      this.recognition = null;
    }
  }

  /** 等待 onend 后再返回，避免松开时 transcript 尚未就绪 */
  stop(): Promise<string> {
    this.active = false;
    const recognition = this.recognition;
    if (!recognition) {
      return Promise.resolve(this.transcript.trim());
    }

    return new Promise((resolve) => {
      let settled = false;
      const finish = (text: string) => {
        if (settled) {
          return;
        }
        settled = true;
        this.stopResolve = null;
        this.recognition = null;
        resolve(text);
      };

      const timeoutId = window.setTimeout(() => {
        finish(this.transcript.trim());
      }, BROWSER_STOP_WAIT_MS);

      this.stopResolve = (text: string) => {
        window.clearTimeout(timeoutId);
        finish(text);
      };

      try {
        recognition.stop();
      } catch {
        window.clearTimeout(timeoutId);
        finish(this.transcript.trim());
      }
    });
  }
}
