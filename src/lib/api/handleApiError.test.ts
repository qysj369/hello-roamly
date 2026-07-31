import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { handleMutationApiError } from '@/lib/api/handleApiError';
import { useApiErrorStore } from '@/stores/apiErrorStore';

describe('handleMutationApiError', () => {
  beforeEach(() => {
    useApiErrorStore.setState({ message: null });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows global banner message for mutations', () => {
    const message = handleMutationApiError(
      new ApiError({ message: '提交失败', status: 500, kind: 'http' }),
      ['toggle-like'],
    );

    expect(message).toContain('服务');
    expect(useApiErrorStore.getState().message).toContain('服务');
  });
});
