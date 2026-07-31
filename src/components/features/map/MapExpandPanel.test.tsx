import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MapExpandPanel from '@/components/features/map/MapExpandPanel';

vi.mock('@/components/features/map/TravelMap', () => ({
  default: () => <div data-testid="travel-map-stub" />,
}));

vi.mock('@/components/features/map/MapProviderBadge', () => ({
  default: () => <span data-testid="map-provider-badge" />,
}));

vi.mock('@/lib/map/provider', () => ({
  hasDisplayableMap: () => true,
}));

describe('MapExpandPanel', () => {
  it('opens and closes fullscreen via button, overlay, and Escape', async () => {
    const user = userEvent.setup();
    render(<MapExpandPanel />);

    expect(screen.queryByRole('dialog', { name: '全屏地图' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '全屏查看地图' }));
    expect(screen.getByRole('dialog', { name: '全屏地图' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '关闭全屏地图' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '全屏地图' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '全屏查看地图' }));
    const dialog = screen.getByRole('dialog', { name: '全屏地图' });
    await user.click(dialog);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '全屏地图' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '全屏查看地图' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '全屏地图' })).not.toBeInTheDocument();
    });
  });
});
