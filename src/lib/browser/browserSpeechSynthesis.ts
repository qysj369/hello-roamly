const VOICE_PATTERNS = [
  /Xiaoxiao/i,
  /Huihui/i,
  /Yaoyao/i,
  /Kangkang/i,
  /Tingting/i,
  /Microsoft.*Chinese/i,
  /Google.*中文/i,
  /Google.*Chinese/i,
  /zh-CN/i,
  /zh_CN/i,
  /zh-Hans/i,
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
  if (chromeKeepAliveTimer != null) {
    window.clearInterval(chromeKeepAliveTimer);
    chromeKeepAliveTimer = null;
  }
}

/** Chrome 长时间朗读会卡住，定期 resume */
let chromeKeepAliveTimer: number | null = null;

function startChromeSpeechKeepAlive(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (chromeKeepAliveTimer != null) {
    window.clearInterval(chromeKeepAliveTimer);
  }
  chromeKeepAliveTimer = window.setInterval(() => {
    if (!window.speechSynthesis.speaking) {
      if (chromeKeepAliveTimer != null) {
        window.clearInterval(chromeKeepAliveTimer);
        chromeKeepAliveTimer = null;
      }
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, 8_000);
}

function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(navigator.userAgent);
}

export type SpeakBrowserTextOptions = {
  text: string;
  rate?: number;
  /**
   * true：同步 speak（必须在点击/触摸手势里调用，手机否则会静音）
   * false：cancel 后短暂延迟（桌面 Edge 更稳）
   */
  immediate?: boolean;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

function enqueueUtterance(
  text: string,
  rate: number,
  useVoice: boolean,
  finish: (message?: string) => void,
  markStarted: () => void,
  allowRetry: boolean,
): void {
  const utterance = new SpeechSynthesisUtterance(text);
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
    markStarted();
    startChromeSpeechKeepAlive();
  };

  utterance.onend = () => finish();
  utterance.onerror = () => {
    if (allowRetry && useVoice) {
      // 个别机型指定 voice 会失败，退回系统默认再试
      window.setTimeout(() => {
        enqueueUtterance(text, rate, false, finish, markStarted, false);
      }, 30);
      return;
    }
    finish('朗读失败：请确认手机未静音，并允许浏览器语音播报');
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * 在用户点击手势内同步朗读（手机可用的关键路径）。
 * 禁止在此处 await / setTimeout，否则会丢掉用户手势导致完全无声。
 */
export function speakBrowserTextImmediate({
  text,
  rate = 0.96,
  onEnd,
  onError,
}: SpeakBrowserTextOptions): void {
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

  // 预热 voices（同步）；取消当前队列后立刻 speak
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
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
    if (chromeKeepAliveTimer != null) {
      window.clearInterval(chromeKeepAliveTimer);
      chromeKeepAliveTimer = null;
    }
    if (message) {
      onError?.(message);
    }
    onEnd?.();
  };

  enqueueUtterance(
    trimmed,
    rate,
    true,
    finish,
    () => {
      started = true;
    },
    true,
  );

  window.setTimeout(() => {
    if (finished || started || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      return;
    }
    // 部分安卓第一次 voices 为空：再试一次不指定 voice
    enqueueUtterance(
      trimmed,
      rate,
      false,
      finish,
      () => {
        started = true;
      },
      false,
    );
  }, 400);

  window.setTimeout(() => {
    if (finished || started || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      return;
    }
    finish('听不到朗读？请提高媒体音量；若在微信内打开，请用系统浏览器访问');
  }, 2800);
}

/** 浏览器 TTS；手机默认走同步路径，桌面可延迟以兼容 Edge */
export async function speakBrowserText({
  text,
  rate = 0.96,
  immediate,
  onEnd,
  onError,
}: SpeakBrowserTextOptions): Promise<void> {
  const useImmediate = immediate ?? isMobileBrowser();
  if (useImmediate) {
    speakBrowserTextImmediate({ text, rate, onEnd, onError });
    return;
  }

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
    if (chromeKeepAliveTimer != null) {
      window.clearInterval(chromeKeepAliveTimer);
      chromeKeepAliveTimer = null;
    }
    if (message) {
      onError?.(message);
    }
    onEnd?.();
  };

  enqueueUtterance(
    trimmed,
    rate,
    true,
    finish,
    () => {
      started = true;
    },
    true,
  );

  window.setTimeout(() => {
    if (finished || started || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      return;
    }
    finish('听不到朗读？请提高媒体音量，并确认浏览器标签页未静音');
  }, 2500);
}
