import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HoloShareLandingHint from '@/components/home/holo/HoloShareLandingHint';

describe('HoloShareLandingHint', () => {
  it('focuses search and can be dismissed', async () => {
    const user = userEvent.setup();
    const onCta = vi.fn();
    const onClose = vi.fn();
    render(
      <HoloShareLandingHint
        text="朋友分享了「杭州」漫行行程。"
        ctaLabel="去搜索"
        closeLabel="关闭分享提示"
        onCta={onCta}
        onClose={onClose}
      />,
    );
    await user.click(screen.getByRole('button', { name: '去搜索' }));
    expect(onCta).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: '关闭分享提示' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
