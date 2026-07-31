import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { getUserFacingErrorMessage, resolveUserFacingError } from '@/lib/errors/userFacingMessage';
import { DeepSeekApiError } from '@/services/ai/deepseek/errors';

describe('getUserFacingErrorMessage', () => {
  it('maps network errors to friendly copy', () => {
    const message = getUserFacingErrorMessage(
      new ApiError({ message: 'Network Error', kind: 'network' }),
    );
    expect(message).toContain('网络');
    expect(message).not.toContain('Network Error');
  });

  it('keeps friendly Chinese backend messages', () => {
    const message = getUserFacingErrorMessage(
      new ApiError({ message: '邀请码已失效', kind: 'http', status: 400 }),
      'invite',
    );
    expect(message).toBe('邀请码已失效');
  });

  it('hides technical English messages', () => {
    const message = getUserFacingErrorMessage(
      new ApiError({ message: 'Request failed with status code 500', kind: 'http', status: 500 }),
      'guide',
    );
    expect(message).toContain('服务');
    expect(message).not.toContain('Request failed');
  });

  it('maps DeepSeek config errors in production tone', () => {
    const message = getUserFacingErrorMessage(
      new DeepSeekApiError('DeepSeek API Key 无效或未授权', { status: 401 }),
      'chat',
    );
    if (import.meta.env.DEV) {
      expect(message).toContain('API Key');
    } else {
      expect(message).toContain('AI');
    }
  });
});

describe('resolveUserFacingError', () => {
  it('includes title and hint for guide context', () => {
    const resolved = resolveUserFacingError(
      new ApiError({ message: 'x', kind: 'timeout' }),
      'guide',
    );
    expect(resolved.title).toContain('攻略');
    expect(resolved.hint).toBeTruthy();
    expect(resolved.canRetry).toBe(true);
  });
});
