/** 将 unknown 转为 Error 实例 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error('未知错误');
  }
}

/** 面向用户的简短错误文案（不暴露堆栈） */
export function getErrorMessage(error: unknown, fallback = '出了点问题，请稍后重试'): string {
  const normalized = normalizeError(error);
  const message = normalized.message.trim();
  if (!message || message === '未知错误') {
    return fallback;
  }
  return message;
}

/** 开发环境是否在 UI 中展示技术详情 */
export function shouldShowErrorDetails(): boolean {
  return import.meta.env.DEV;
}
