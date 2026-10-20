import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import SpiralHomeChrome, {
  SPIRAL_HOME_CTA,
  SPIRAL_HOME_SUBTITLE,
  SPIRAL_HOME_TITLE,
  SPIRAL_HOME_VERSE,
} from '@/components/capsule-one/spiral-home/SpiralHomeChrome';

describe('SpiralHomeChrome', () => {
  it('renders hero copy and launches roam from the left CTA', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(
      <MemoryRouter>
        <SpiralHomeChrome onLaunch={onLaunch} onSearch={vi.fn()} onExploreRoutes={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText(SPIRAL_HOME_TITLE)).toBeTruthy();
    expect(screen.getByText(SPIRAL_HOME_SUBTITLE)).toBeTruthy();
    expect(screen.getByText(SPIRAL_HOME_VERSE)).toBeTruthy();
    expect(screen.getByRole('link', { name: '首页' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '探索品牌' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '蜗牛旅行' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '旅人故事' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '深度漫游' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '帮助中心' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '探索航线' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '搜索' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'UI SOMIS' })).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: '主导航' });
    expect(nav.textContent?.replace(/\s+/g, '')).toBe(
      '首页探索品牌蜗牛旅行旅人故事深度漫游帮助中心探索航线',
    );
    expect(screen.getByRole('button', { name: SPIRAL_HOME_CTA })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^开启低空漫游$/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: SPIRAL_HOME_CTA }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
