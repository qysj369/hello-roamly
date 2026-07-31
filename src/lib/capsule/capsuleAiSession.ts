const CAPSULE_AI_SESSION_KEY = 'capsule-one-ai-active';

/** 从 Capsule 首页跳转 AI 时标记，用于延续驾驶舱皮肤 */
export function markCapsuleAiSession(): void {
  sessionStorage.setItem(CAPSULE_AI_SESSION_KEY, '1');
}

export function isCapsuleAiSession(): boolean {
  return sessionStorage.getItem(CAPSULE_AI_SESSION_KEY) === '1';
}

export function clearCapsuleAiSession(): void {
  sessionStorage.removeItem(CAPSULE_AI_SESSION_KEY);
}
