import { describe, expect, it } from 'vitest';
import { getErrorMessage, normalizeError } from '@/lib/errors/normalizeError';

describe('normalizeError', () => {
  it('returns the same Error instance', () => {
    const error = new Error('boom');
    expect(normalizeError(error)).toBe(error);
  });

  it('wraps string errors', () => {
    expect(normalizeError('网络异常').message).toBe('网络异常');
  });
});

describe('getErrorMessage', () => {
  it('uses fallback for empty messages', () => {
    expect(getErrorMessage(new Error('   '), '默认提示')).toBe('默认提示');
  });

  it('returns trimmed message', () => {
    expect(getErrorMessage(new Error('  加载失败  '))).toBe('加载失败');
  });
});
