import { useEffect, useRef, useState } from 'react';

import {
  enqueueAdvisorReplySpeech,
  getAdvisorReplySpeechQueue,
  isAdvisorReplySpeechActive,
  splitAdvisorReplySpeechDelta,
  stopAdvisorReplySpeech,
  stripAdvisorReplyForSpeech,
} from '@/lib/browser/advisorVoiceNarration';

type UseAdvisorReplySpeechOptions = {
  active: boolean;
  isReplying: boolean;
  assistantReplyText: string | null;
  onSpeakingChange?: (speaking: boolean) => void;
  onSpeakError?: (message: string | null) => void;
};

/** 第七周：语音对话模式下，顾问回复流式 TTS（边出字边朗读） */
export function useAdvisorReplySpeech({
  active,
  isReplying,
  assistantReplyText,
  onSpeakingChange,
  onSpeakError,
}: UseAdvisorReplySpeechOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const spokenLengthRef = useRef(0);
  const activeRef = useRef(active);
  const isReplyingRef = useRef(isReplying);
  const onSpeakErrorRef = useRef(onSpeakError);
  const onSpeakingChangeRef = useRef(onSpeakingChange);

  activeRef.current = active;
  isReplyingRef.current = isReplying;
  onSpeakErrorRef.current = onSpeakError;
  onSpeakingChangeRef.current = onSpeakingChange;

  const syncSpeaking = (next: boolean) => {
    setIsSpeaking(next);
    onSpeakingChangeRef.current?.(next);
  };

  useEffect(() => {
    const queue = getAdvisorReplySpeechQueue();
    queue.setOnIdle(() => {
      if (!activeRef.current) {
        syncSpeaking(false);
        return;
      }
      syncSpeaking(isAdvisorReplySpeechActive());
    });
    return () => {
      queue.setOnIdle(null);
    };
  }, []);

  useEffect(() => {
    if (active) {
      spokenLengthRef.current = stripAdvisorReplyForSpeech(assistantReplyText ?? '').length;
      onSpeakErrorRef.current?.(null);
      return;
    }

    stopAdvisorReplySpeech();
    spokenLengthRef.current = 0;
    syncSpeaking(false);
    onSpeakErrorRef.current?.(null);
  }, [active]);

  useEffect(() => {
    const wasReplying = isReplyingRef.current;
    isReplyingRef.current = isReplying;

    if (!wasReplying && isReplying) {
      spokenLengthRef.current = 0;
      stopAdvisorReplySpeech();
      syncSpeaking(false);
    }
  }, [isReplying]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const plain = stripAdvisorReplyForSpeech(assistantReplyText ?? '');
    const { chunks, nextSpokenLength } = splitAdvisorReplySpeechDelta(
      plain,
      spokenLengthRef.current,
      !isReplying,
    );

    if (chunks.length === 0) {
      if (!isReplying && plain.length > 0 && spokenLengthRef.current >= plain.length) {
        syncSpeaking(isAdvisorReplySpeechActive());
      }
      return;
    }

    spokenLengthRef.current = nextSpokenLength;
    syncSpeaking(true);
    onSpeakErrorRef.current?.(null);

    for (const chunk of chunks) {
      enqueueAdvisorReplySpeech(chunk);
    }
  }, [active, isReplying, assistantReplyText]);

  useEffect(() => {
    if (!isSpeaking) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isAdvisorReplySpeechActive()) {
        syncSpeaking(false);
      }
    }, 12_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSpeaking]);

  useEffect(
    () => () => {
      stopAdvisorReplySpeech();
    },
    [],
  );

  return { isSpeaking };
}
