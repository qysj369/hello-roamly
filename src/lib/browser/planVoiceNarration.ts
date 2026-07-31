const MAX_SPEECH_CHARS = 280;

function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 在用户点击地图前预热 TTS（部分浏览器首次 speak 会静音） */
export function primePlanVoiceNarration(): void {
  if (!canSpeak()) {
    return;
  }
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

/** 停止当前语音播报 */
export function stopPlanVoiceNarration(): void {
  if (!canSpeak()) {
    return;
  }
  window.speechSynthesis.cancel();
}

/** 浏览器 TTS 朗读（中文） */
export function speakPlanVoiceNarration(text: string): void {
  if (!canSpeak()) {
    return;
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }
  stopPlanVoiceNarration();
  primePlanVoiceNarration();
  const utterance = new SpeechSynthesisUtterance(trimmed.slice(0, MAX_SPEECH_CHARS));
  utterance.lang = 'zh-CN';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function buildRoutePlanningIntro(originLabel: string, destinationLabel: string): string {
  return `收到，你在${originLabel}，要去${destinationLabel}。蜗牛正在帮你规划从出发地到目的地的穷游路线，请稍等。`;
}

/** 方案弹窗朗读摘要（简介 + 首日亮点） */
export function buildPlanResultSpeakText(planContent: string, locationName?: string | null): string {
  const place = locationName?.trim() || '目的地';
  const introMatch = planContent.match(/【方案简介】([\s\S]*?)【行程流水账】/);
  const introText = introMatch?.[1]
    ?.replace(/\|/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 120);
  const itineraryMatch = planContent.match(
    /【行程流水账】([\s\S]*?)(?:【蜗牛提示】|【避坑指南】)/,
  );
  const firstDay = itineraryMatch?.[1]
    ?.split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 4);
  const daySnippet = firstDay?.replace(/\*\*/g, '').slice(0, 100);
  const parts = [`${place}穷游方案已生成。`];
  if (introText) {
    parts.push(introText);
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
