import {
  canUseBrowserSpeechSynthesis,
  prepareBrowserSpeechSynthesis,
  speakBrowserText,
  speakBrowserTextImmediate,
  stopBrowserSpeechSynthesis,
} from '@/lib/browser/browserSpeechSynthesis';

const MAX_SPEECH_CHARS = 360;
const AUTO_NARRATE_STORAGE_KEY = 'holo-auto-narrate-next-plan';

/** 语音开麦后请求：方案生成完自动朗读一次（sessionStorage，跨壳层 remount 不丢） */
let autoNarrateNextPlan = false;

function canSpeak(): boolean {
  return canUseBrowserSpeechSynthesis();
}

function readAutoNarrateFlag(): boolean {
  if (autoNarrateNextPlan) {
    return true;
  }
  try {
    return sessionStorage.getItem(AUTO_NARRATE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeAutoNarrateFlag(on: boolean): void {
  autoNarrateNextPlan = on;
  try {
    if (on) {
      sessionStorage.setItem(AUTO_NARRATE_STORAGE_KEY, '1');
    } else {
      sessionStorage.removeItem(AUTO_NARRATE_STORAGE_KEY);
    }
  } catch {
    /* private mode */
  }
}

/** 在用户点击麦克风前预热 TTS（部分浏览器首次 speak 会静音） */
export function primePlanVoiceNarration(): void {
  if (!canSpeak()) {
    return;
  }
  void prepareBrowserSpeechSynthesis();
  try {
    window.speechSynthesis.getVoices();
  } catch {
    /* ignore */
  }
}

/** 停止当前语音播报 */
export function stopPlanVoiceNarration(): void {
  stopBrowserSpeechSynthesis();
}

/**
 * 浏览器 TTS 朗读（中文）。
 * 默认走同步 speak（手机点击「朗读」必须同步，否则无声）。
 */
export function speakPlanVoiceNarration(
  text: string,
  options?: {
    onError?: (message: string) => void;
    onEnd?: () => void;
    /** 点击手势内务必 true（默认 true） */
    immediate?: boolean;
  },
): void {
  const trimmed = text.trim().slice(0, MAX_SPEECH_CHARS);
  if (!trimmed) {
    options?.onEnd?.();
    return;
  }
  const immediate = options?.immediate !== false;
  if (immediate) {
    speakBrowserTextImmediate({
      text: trimmed,
      rate: 0.95,
      onError: options?.onError,
      onEnd: options?.onEnd,
    });
    return;
  }
  void speakBrowserText({
    text: trimmed,
    rate: 0.95,
    immediate: false,
    onError: options?.onError,
    onEnd: options?.onEnd,
  });
}

/** 首页语音一键规划：标记下一次方案可用时自动播报 */
export function requestAutoNarrateNextPlan(): void {
  writeAutoNarrateFlag(true);
  primePlanVoiceNarration();
}

export function consumeAutoNarrateNextPlan(): boolean {
  if (!readAutoNarrateFlag()) {
    return false;
  }
  writeAutoNarrateFlag(false);
  return true;
}

/** 仅查看是否待播报，不消费 */
export function peekAutoNarrateNextPlan(): boolean {
  return readAutoNarrateFlag();
}

export function buildVoicePlanAck(city: string, days: number): string {
  const place = city.trim() || '目的地';
  const dayPart = Number.isFinite(days) && days > 0 ? `${days}天` : '短途';
  return `好，正在为你规划${place}${dayPart}漫行，请稍等。`;
}

export function buildVoiceClarifyCityPrompt(): string {
  return '想去哪一座城慢慢逛？说城市名就可以。';
}

/** 语音识别后缺关键信息：一次说清要补的项，不默填 */
export function buildVoiceClarifyFollowup(fields: {
  city?: string | null;
  days?: number | null;
  party?: string | null;
  budgetYuan?: number | null;
  preference?: string | null;
}): string {
  const missing: string[] = [];
  if (!fields.city?.trim()) missing.push('想去哪座城');
  if (fields.days == null) missing.push('玩几天');
  if (!fields.party?.trim()) missing.push('情侣还是单人');
  if (fields.budgetYuan == null) missing.push('人均预算大概多少');
  if (!fields.preference?.trim() && /青岛/.test(fields.city ?? '')) {
    missing.push('更爱吃海鲜还是看风景');
  }
  if (missing.length === 0) {
    return buildVoiceClarifyCityPrompt();
  }
  return `先补这几项：${missing.join('，')}。`;
}

export function buildRoutePlanningIntro(originLabel: string, destinationLabel: string): string {
  return `收到，你在${originLabel}，要去${destinationLabel}。蜗牛正在帮你规划从出发地到目的地的漫行路线，请稍等。`;
}

function scrubSpeechText(raw: string): string {
  return raw
    .replace(/\|/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 方案弹窗朗读摘要（简介 + 首日亮点；标题对不上时退回正文前段） */
export function buildPlanResultSpeakText(planContent: string, locationName?: string | null): string {
  const place = locationName?.trim() || '目的地';
  const content = planContent.trim();
  const introMatch = content.match(
    /【方案简介】([\s\S]*?)(?:【行程流水账】|【蜗牛提示】|【避坑指南】|$)/,
  );
  const introText = scrubSpeechText(introMatch?.[1] ?? '').slice(0, 140);
  const itineraryMatch = content.match(
    /【行程流水账】([\s\S]*?)(?:【蜗牛提示】|【避坑指南】|$)/,
  );
  const firstDay = itineraryMatch?.[1]
    ?.split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 4);
  const daySnippet = scrubSpeechText(firstDay ?? '').slice(0, 100);
  const parts = [`${place}漫行方案已生成。`];
  if (introText) {
    parts.push(introText);
  } else {
    const fallback = scrubSpeechText(content).slice(0, 160);
    if (fallback) {
      parts.push(fallback);
    }
  }
  if (daySnippet) {
    parts.push(`首日安排：${daySnippet}`);
  }
  return parts.join('');
}

export function buildRoutePlanningSummary(
  originLabel: string,
  destinationLabel: string,
  planContent: string,
): string {
  const intro = `从${originLabel}到${destinationLabel}的方案好了。`;
  const itineraryMatch = planContent.match(
    /【行程流水账】([\s\S]*?)(?:【蜗牛提示】|【蜗牛启示】|【避坑指南】)/,
  );
  if (!itineraryMatch) {
    return intro;
  }
  const firstHighlight = itineraryMatch[1]
    ?.split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('**'));
  if (!firstHighlight) {
    return intro;
  }
  const detail = firstHighlight.replace(/\*\*/g, '').replace(/^[-—]\s*/, '');
  return `${intro}${detail.slice(0, 160)}`;
}
