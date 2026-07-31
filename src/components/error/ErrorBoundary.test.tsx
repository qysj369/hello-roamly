import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '@/components/error/ErrorBoundary';

function OptionalThrow({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('测试崩溃');
  }
  return <p>内容已恢复</p>;
}

describe('ErrorBoundary', () => {
  it('renders fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary boundary="section">
        <OptionalThrow shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('测试崩溃')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('recovers after reset when the child no longer throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary boundary="section">
        <OptionalThrow shouldThrow />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary boundary="section">
        <OptionalThrow shouldThrow={false} />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: '重试' }));

    expect(screen.getByText('内容已恢复')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('auto-resets when resetKeys change', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary boundary="section" resetKeys={['a']}>
        <OptionalThrow shouldThrow />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary boundary="section" resetKeys={['b']}>
        <OptionalThrow shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('内容已恢复')).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
