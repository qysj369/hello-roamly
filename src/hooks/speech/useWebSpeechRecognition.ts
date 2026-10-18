import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionResultLike = {
  readonly isFinal: boolean;
  readonly 0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike> & { length: number };
};

type SpeechRecognitionErrorEventLike = {
  readonly error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((ev: Event) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isWebSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() != null;
}

export type UseWebSpeechRecognitionOptions = {
  lang?: string;
  /** 最终识别结果（已 trim） */
  onFinal?: (text: string) => void;
  /** 实时临时文案 */
  onInterim?: (text: string) => void;
};

/**
 * 首页 Web Speech 语音识别（浏览器原生）。
 * 不改动顾问页讯飞 ASR 管线；仅用于首页搜索 / 追问补全。
 */
export function useWebSpeechRecognition(options: UseWebSpeechRecognitionOptions = {}) {
  const { lang = 'zh-CN', onFinal, onInterim } = options;
  const supported = isWebSpeechRecognitionSupported();
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const intentionalStopRef = useRef(false);
  const finalBufferRef = useRef('');
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);

  useEffect(() => {
    onFinalRef.current = onFinal;
    onInterimRef.current = onInterim;
  }, [onFinal, onInterim]);

  const cleanupRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.onstart = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try {
      rec.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
  }, []);

  useEffect(() => () => cleanupRecognition(), [cleanupRecognition]);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(false);
      setProcessing(false);
      return;
    }
    try {
      rec.stop();
    } catch {
      cleanupRecognition();
      setListening(false);
      setProcessing(false);
    }
  }, [cleanupRecognition]);

  const start = useCallback(async () => {
    if (!supported) {
      setError('该设备暂不支持语音输入');
      return;
    }
    setError(null);
    setPreview('');
    finalBufferRef.current = '';
    intentionalStopRef.current = false;

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {
      setError('需要麦克风权限才能语音输入，可在浏览器设置中允许后重试');
      setListening(false);
      setProcessing(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError('该设备暂不支持语音输入');
      return;
    }

    cleanupRecognition();
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setListening(true);
      setProcessing(false);
      setError(null);
    };

    rec.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const piece = result?.[0]?.transcript ?? '';
        if (result.isFinal) finalChunk += piece;
        else interim += piece;
      }
      if (finalChunk) {
        finalBufferRef.current = `${finalBufferRef.current}${finalChunk}`.trim();
        setPreview(finalBufferRef.current);
        onInterimRef.current?.(finalBufferRef.current);
      } else if (interim) {
        const live = `${finalBufferRef.current} ${interim}`.trim();
        setPreview(live);
        onInterimRef.current?.(live);
      }
    };

    rec.onerror = (event) => {
      const code = event.error;
      if (code === 'aborted' || code === 'no-speech') {
        return;
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('需要麦克风权限才能语音输入，可在浏览器设置中允许后重试');
      } else if (code === 'audio-capture') {
        setError('未检测到麦克风，请检查设备后重试');
      } else {
        setError('语音识别暂时不可用，可改用文字输入');
      }
    };

    rec.onend = () => {
      setListening(false);
      setProcessing(false);
      recognitionRef.current = null;
      const text = finalBufferRef.current.trim();
      if (text && !intentionalStopRef.current) {
        onFinalRef.current?.(text);
      } else if (text && intentionalStopRef.current) {
        onFinalRef.current?.(text);
      }
      intentionalStopRef.current = false;
    };

    recognitionRef.current = rec;
    setProcessing(true);
    try {
      rec.start();
    } catch {
      setProcessing(false);
      setListening(false);
      setError('语音识别启动失败，请稍后再试');
      cleanupRecognition();
    }
  }, [cleanupRecognition, lang, supported]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
      return;
    }
    void start();
  }, [listening, start, stop]);

  return {
    supported,
    listening,
    processing,
    preview,
    error,
    start,
    stop,
    toggle,
    clearError: () => setError(null),
  };
}
