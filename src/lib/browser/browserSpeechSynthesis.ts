const VOICE_PATTERNS = [
  /Xiaoxiao/i,
  /Huihui/i,
  /Yaoyao/i,
  /Kangkang/i,
  /Microsoft.*Chinese/i,
  /zh-CN/i,
  /zh_CN/i,
  /Chinese/i,
];

export function canUseBrowserSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function pickChineseSpeechVoice(): SpeechSynthesisVoice | null {
  if (!canUseBrowserSpeechSynthesis()) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  for (const pattern of VOICE_PATTERNS) {
    const match = voices.find(
      (voice) => pattern.test(voice.name) || pattern.test(voice.lang),
    );
    if (match) {
      return match;
    }
  }
  return voices.find((voice) => voice.lang.toLowerCase().startsWith('zh')) ?? null;
}

/** 等待 voices 列表就绪（Edge 首次常为 empty） */
export function waitForSpeechVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  if (!canUseBrowserSpeechSynthesis()) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', finish);
    window.speechSynthesis.getVoices();
    window.setTimeout(finish, timeoutMs);
  });
}

export async function prepareBrowserSpeechSynthesis(): Promise<void> {
  if (!canUseBrowserSpeechSynthesis()) {
    return;
  }
  await waitForSpeechVoices();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopBrowserSpeechSynthesis(): void {
  if (!canUseBrowserSpeechSynthesis()) {
    return;
  }
  window.speechSynthesis.cancel();
}

export type SpeakBrowserTextOptions = {
  text: string;
  rate?: number;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

/** 浏览器 TTS；cancel 后延迟 speak，避免 Edge 静音 */
export async function speakBrowserText({
  text,
  rate = 0.96,
  onEnd,
  onError,
}: SpeakBrowserTextOptions): Promise<void> {
  if (!canUseBrowserSpeechSynthesis()) {
    onError?.('当前浏览器不支持语音朗读');
    onEnd?.();
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    onEnd?.();
    return;
  }

  stopBrowserSpeechSynthesis();
  await prepareBrowserSpeechSynthesis();

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 150);
  });

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  let finished = false;
  let started = false;

  const finish = (message?: string) => {
    if (finished) {
      return;
    }
    finished = true;
    if (message) {
      onError?.(message);
    }
    onEnd?.();
  };

  const speakOnce = (useVoice: boolean, allowRetry: boolean) => {
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (useVoice) {
      const voice = pickChineseSpeechVoice();
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => {
      started = true;
    };

    utterance.onend = () => finish();
    utterance.onerror = () => {
      if (allowRetry && useVoice) {
        window.setTimeout(() => speakOnce(false, false), 80);
        return;
      }
      finish(
        '朗读失败：请检查 Windows「输出设备」是否选对（扬声器/耳机），并确认浏览器标签页未静音',
      );
    };

    window.speechSynthesis.speak(utterance);
  };

  speakOnce(true, true);

  window.setTimeout(() => {
    if (finished || started || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      return;
    }
    finish(
      '听不到朗读？请在 Win+I → 系统 → 声音 → 输出 里选择正在使用的扬声器或耳机',
    );
  }, 2500);
}
