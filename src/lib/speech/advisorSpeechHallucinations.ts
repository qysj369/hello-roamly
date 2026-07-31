/** Whisper 在静音/极短录音时的典型幻觉（客户端与服务端共用） */
export const ADVISOR_SPEECH_HALLUCINATIONS = new Set([
  '請問我',
  '感谢观看',
  '感谢收看',
  '字幕',
  '明镜与点点',
  '请不吝点赞',
  '订阅',
  '转发',
  '打赏',
]);

/** 视频字幕/演职员表类幻觉片段 */
const HALLUCINATION_FRAGMENT =
  /字幕|和詞|和曲|和编曲|和編曲|编曲|作词|作曲|作詞|J\.F\.|明镜|点赞|订阅|转发|打赏/i;

export function normalizeAdvisorSpeechText(text: string): string {
  return text
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*$/g, '')
    .replace(/（[^）]*$/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/嘟嘟+/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function hasRepetitivePattern(text: string): boolean {
  if (text.length < 20) {
    return false;
  }
  for (let size = 6; size <= 18; size += 1) {
    for (let start = 0; start <= text.length - size * 3; start += 1) {
      const chunk = text.slice(start, start + size);
      if (!chunk || chunk.length < size) {
        continue;
      }
      let count = 0;
      let index = 0;
      while ((index = text.indexOf(chunk, index)) !== -1) {
        count += 1;
        if (count >= 3) {
          return true;
        }
        index += size;
      }
    }
  }
  return false;
}

/** 判断是否为 Whisper / 静音幻觉 */
export function isLikelyAdvisorSpeechHallucination(raw: string): boolean {
  if (!raw.trim()) {
    return true;
  }

  if (HALLUCINATION_FRAGMENT.test(raw)) {
    return true;
  }

  const cleaned = normalizeAdvisorSpeechText(raw);
  if (!cleaned) {
    return true;
  }
  if (ADVISOR_SPEECH_HALLUCINATIONS.has(cleaned)) {
    return true;
  }
  if (/^嘟嘟+$/u.test(cleaned)) {
    return true;
  }
  if (hasRepetitivePattern(cleaned)) {
    return true;
  }

  const chineseCount = (cleaned.match(/[\u4e00-\u9fff]/g) ?? []).length;
  if (cleaned.length >= 24 && chineseCount / cleaned.length < 0.25) {
    return true;
  }

  return false;
}

export function sanitizeAdvisorSpeechText(raw: string): string {
  if (isLikelyAdvisorSpeechHallucination(raw)) {
    return '';
  }
  return normalizeAdvisorSpeechText(raw);
}

export function extractAdvisorSpeechText(raw: string): string {
  return sanitizeAdvisorSpeechText(raw);
}

/** 仅拒绝明确幻觉；其余结果填入输入框供用户修改 */
export function isBlockedAdvisorSpeechHallucination(text: string): boolean {
  return isLikelyAdvisorSpeechHallucination(text);
}

/** 流式语音对话：只拦字幕类垃圾，避免把讯飞静音误识别当「没听清」 */
export function isBlockedStreamVoiceHallucination(text: string): boolean {
  const raw = text.trim();
  if (!raw) {
    return true;
  }

  if (HALLUCINATION_FRAGMENT.test(raw)) {
    return true;
  }

  const cleaned = normalizeAdvisorSpeechText(raw);
  if (!cleaned || cleaned.length < 2) {
    return true;
  }

  if (ADVISOR_SPEECH_HALLUCINATIONS.has(cleaned)) {
    return true;
  }

  if (/^嘟嘟+$/u.test(cleaned)) {
    return true;
  }

  if (cleaned.length >= 20 && hasRepetitivePattern(cleaned)) {
    return true;
  }

  return false;
}
