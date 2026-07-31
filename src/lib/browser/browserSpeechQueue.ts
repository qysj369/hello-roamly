import {
  canUseBrowserSpeechSynthesis,
  pickChineseSpeechVoice,
  prepareBrowserSpeechSynthesis,
  stopBrowserSpeechSynthesis,
} from '@/lib/browser/browserSpeechSynthesis';

/** 浏览器 TTS 队列：连续 enqueue，不 cancel 前一段（适合流式朗读） */
export class BrowserSpeechQueue {
  private prepared = false;

  private enqueued = 0;

  private completed = 0;

  private idleTimer: number | null = null;

  private onIdle: (() => void) | null = null;

  setOnIdle(callback: (() => void) | null): void {
    this.onIdle = callback;
  }

  isActive(): boolean {
    if (!canUseBrowserSpeechSynthesis()) {
      return false;
    }
    return (
      this.enqueued > this.completed ||
      window.speechSynthesis.speaking ||
      window.speechSynthesis.pending
    );
  }

  stop(): void {
    this.prepared = false;
    this.enqueued = 0;
    this.completed = 0;
    if (this.idleTimer != null) {
      window.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    stopBrowserSpeechSynthesis();
    this.onIdle?.();
  }

  enqueue(text: string, rate = 0.96): void {
    const trimmed = text.trim();
    if (!trimmed || !canUseBrowserSpeechSynthesis()) {
      return;
    }

    void this.enqueueAsync(trimmed, rate);
  }

  private async enqueueAsync(text: string, rate: number): Promise<void> {
    if (!this.prepared) {
      await prepareBrowserSpeechSynthesis();
      this.prepared = true;
    }

    this.enqueued += 1;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = pickChineseSpeechVoice();
    if (voice) {
      utterance.voice = voice;
    }

    const finish = () => {
      this.completed += 1;
      this.scheduleIdleCheck();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    window.speechSynthesis.speak(utterance);
  }

  private scheduleIdleCheck(): void {
    if (this.idleTimer != null) {
      window.clearTimeout(this.idleTimer);
    }
    this.idleTimer = window.setTimeout(() => {
      this.idleTimer = null;
      if (!this.isActive()) {
        this.onIdle?.();
      }
    }, 120);
  }
}
