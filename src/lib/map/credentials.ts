/** 过滤 .env 示例中的占位符，避免误判为已配置 */
export function isPlaceholderMapCredential(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const placeholderHints = [
    'your_',
    'your-',
    'pk.your',
    'sk-your',
    'sk-your_',
    'example',
    'changeme',
    'change-me',
    'placeholder',
    'xxx',
    '你的',
    '安全密钥',
    'token_here',
  ];

  return placeholderHints.some((hint) => normalized.includes(hint));
}

export function normalizeMapCredential(
  value: string | undefined,
): string | undefined {
  if (!value || isPlaceholderMapCredential(value)) {
    return undefined;
  }
  return value;
}

/** 开发自检用：只展示末 4 位，避免在 UI 中泄露完整 Key */
export function maskMapCredential(value: string | undefined): string {
  if (!value) {
    return '未配置';
  }
  if (value.length <= 4) {
    return '已配置';
  }
  return `已配置 (…${value.slice(-4)})`;
}
