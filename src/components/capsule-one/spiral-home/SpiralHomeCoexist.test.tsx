import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SpiralHomeButler from '@/components/capsule-one/spiral-home/SpiralHomeButler';
import SnailFlightBookingDialog from '@/components/snail-flight/SnailFlightBookingDialog';
import { useTravelAgentStore } from '@/stores/travelAgent/store';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
  useTravelAgentStore.setState({
    open: false,
    busy: false,
    plan: null,
    posterOpen: false,
    messages: [{ id: 'welcome', role: 'assistant', text: '说目的地即可。' }],
  });
});

describe('spiral home butler and booking dialog', () => {
  it('keeps both surfaces on screen without sharing one container', async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    const { rerender } = render(
      <div className="spiral-home">
        <SpiralHomeButler onLaunch={onLaunch} />
      </div>,
    );
    await user.click(screen.getByRole('button', { name: '打开蜗牛管家' }));
    expect(await screen.findByText('蜗牛管家已就位')).toBeTruthy();
    expect(screen.getByRole('button', { name: '人文主版本' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '极简诗意' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '科普叙事' })).toBeTruthy();

    rerender(
      <div className="spiral-home">
        <SpiralHomeButler onLaunch={onLaunch} />
        <SnailFlightBookingDialog onCancel={vi.fn()} onConfirm={vi.fn()} />
      </div>,
    );

    expect(screen.getByRole('heading', { name: '选择航线' })).toBeTruthy();
    expect(screen.getByLabelText('起飞地点')).toBeTruthy();
    expect(screen.getByLabelText('目的地')).toBeTruthy();
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '确认航线，登机' })).toBeTruthy();
    expect(screen.getByText('蜗牛管家已就位')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '极简诗意' }));
    expect(screen.getByText(/已切换至【极简诗意版】/)).toBeTruthy();
  });
});
