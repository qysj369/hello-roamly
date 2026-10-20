import { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TravelAgentHost from '@/components/agent/TravelAgentHost';
import { useSnailFlightCaptionStore } from '@/lib/snail-flight/captionPackStore';
import { useFlightButlerStore } from '@/lib/snail-flight/flightButlerStore';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '抵达杭州',
      hotelArea: '湖滨',
      tips: '',
      traffic: [],
      spots: [{ name: '西湖', intro: '' }],
      foods: [],
    },
  ],
};

beforeEach(() => {
  useSnailFlightCaptionStore.setState({ packId: 'story', progress: 0 });
  useFlightButlerStore.getState().reset();
  useTravelAgentStore.setState({
    open: true,
    busy: false,
    plan,
    posterOpen: false,
    messages: [{ id: 'welcome', role: 'assistant', text: '行程已在左侧。点下面改一处。' }],
  });
});

describe('TravelAgentHost embed drawer', () => {
  it('shows history, composer and three itinerary chips plus 朗读/回退', async () => {
    const user = userEvent.setup();
    const onNarrate = vi.fn();
    const onRollback = vi.fn();
    render(
      <TravelAgentHost
        layout="embed"
        narrating={false}
        onNarrate={onNarrate}
        onRollback={onRollback}
      />,
    );
    expect(screen.getByLabelText('蜗牛管家')).toBeTruthy();
    expect(screen.getByText('行程已在左侧。点下面改一处。')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '对管家说' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '补充景点详情' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '增加本地美食' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '完善出行交通' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '改成亲子' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '朗读' }));
    await user.click(screen.getByRole('button', { name: '回退上一版' }));
    expect(onNarrate).toHaveBeenCalledTimes(1);
    expect(onRollback).toHaveBeenCalledTimes(1);
  });

  it('uses a flight-only welcome instead of trip planning copy', () => {
    render(<TravelAgentHost layout="fab" variant="flight" />);
    useTravelAgentStore.getState().openChat();
    expect(screen.getByText('飞行途中可切换字幕，不会打断漫游。')).toBeTruthy();
    expect(screen.getByText(/这次是蜗牛号低空漫游/)).toBeTruthy();
    expect(screen.queryByText(/杭州3天亲子/)).toBeNull();
    expect(screen.getByRole('button', { name: '极简诗意' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '介绍眼前这片区域' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '前方还有哪些风景' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '帮我生成目的地行程' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '它的劣势有哪些？' })).toBeNull();
  });

  it('toggles the spiral butler from the circular avatar', async () => {
    const user = userEvent.setup();
    useTravelAgentStore.setState({ open: false });
    render(<TravelAgentHost layout="fab" variant="spiral" />);
    expect(screen.getByRole('button', { name: '打开蜗牛管家' })).toHaveTextContent('蜗');
    expect(screen.queryByText('蜗牛管家已就位')).toBeNull();
    await user.click(screen.getByRole('button', { name: '打开蜗牛管家' }));
    expect(screen.getByText('蜗牛管家已就位')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '关闭对话' }));
    await waitFor(() => {
      expect(screen.queryByText('蜗牛管家已就位')).toBeNull();
    });
    expect(screen.getByRole('button', { name: '打开蜗牛管家' })).toBeTruthy();
  });

  it('shows spiral-home butler copy and three caption chips only', () => {
    useTravelAgentStore.setState({
      open: true,
      messages: [
        { id: 'spiral-u1', role: 'user', text: '济南历下' },
        { id: 'spiral-u2', role: 'user', text: '潍坊' },
      ],
    });
    render(<TravelAgentHost layout="fab" variant="spiral" />);
    expect(screen.getByText('蜗牛管家已就位')).toBeTruthy();
    expect(screen.getByText('告诉我你想听什么，我陪你一路漫游')).toBeTruthy();
    expect(screen.getByText('济南历下')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: '更多' })).toHaveLength(2);
    expect(screen.getByRole('button', { name: '人文主版本' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '极简诗意' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '科普叙事' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '介绍眼前这片区域' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '前方还有哪些风景' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '帮我生成目的地行程' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '它的劣势有哪些？' })).toBeNull();
    expect(screen.queryByRole('button', { name: '如何优化图文旅行攻略的内容？' })).toBeNull();
    expect(screen.queryByRole('button', { name: '如何进一步提升用户体验？' })).toBeNull();
    expect(screen.queryByRole('button', { name: '还有哪些方面可以改进？' })).toBeNull();
    expect(screen.getByRole('textbox', { name: '对管家说' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: '确认行程，生成图文资产包' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
  });

  it('windows long spiral logs, flashes style chips, and shows a loading placeholder', async () => {
    const user = userEvent.setup();
    useTravelAgentStore.setState({
      open: true,
      busy: false,
      plan,
      messages: Array.from({ length: 30 }, (_, index) => ({
        id: `m${index}`,
        role: index % 2 ? ('user' as const) : ('assistant' as const),
        text: `msg-${index}`,
      })),
    });
    render(<TravelAgentHost layout="fab" variant="spiral" />);
    expect(screen.queryByText('msg-0')).toBeNull();
    expect(screen.getByText('msg-29')).toBeTruthy();
    expect(screen.getByRole('button', { name: /显示更早的 6 条对话/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '极简诗意' }));
    expect(screen.getByRole('button', { name: '极简诗意' })).toHaveClass('is-flash');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '极简诗意' })).toHaveClass('is-active');
    });
    await user.click(screen.getByRole('button', { name: '科普叙事' }));
    expect(screen.getByRole('button', { name: '科普叙事' })).toHaveClass('is-flash');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '科普叙事' })).toHaveClass('is-active');
      expect(
        screen.getByText(/已切换至【科普轻叙事版】，为你带来更丰富的地理与人文解说/),
      ).toBeTruthy();
    });
    act(() => {
      useTravelAgentStore.setState({ busy: true });
    });
    expect(screen.getByText('正在为你规划行程…')).toBeTruthy();
  });

  it('fills the spiral composer then sends a scene card without opening a second asset button', async () => {
    const user = userEvent.setup();
    render(<TravelAgentHost layout="fab" variant="spiral" />);
    const input = screen.getByRole('textbox', { name: '对管家说' });
    await user.click(screen.getByRole('button', { name: '介绍眼前这片区域' }));
    expect(input).toHaveValue('介绍眼前这片区域');
    await waitFor(() => {
      expect(screen.getByText(/趵突泉与大明湖/)).toBeTruthy();
      expect(input).toHaveValue('');
    });
    expect(screen.queryByText('正在为你规划行程…')).toBeNull();
    expect(screen.getAllByRole('button', { name: '确认行程，生成图文资产包' })).toHaveLength(1);
  });

  it('fills the flight composer then sends a scene card', async () => {
    const user = userEvent.setup();
    render(<TravelAgentHost layout="fab" variant="flight" />);
    const input = screen.getByRole('textbox', { name: '对管家说' });
    await user.click(screen.getByRole('button', { name: '介绍眼前这片区域' }));
    expect(input).toHaveValue('介绍眼前这片区域');
    await waitFor(() => {
      expect(screen.getByText(/历下|趵突泉/)).toBeTruthy();
    });
  });

  it('keeps a single asset-pack button and updated assistant copy', async () => {
    const user = userEvent.setup();
    render(<TravelAgentHost layout="fab" variant="spiral" />);
    expect(screen.getAllByRole('button', { name: '确认行程，生成图文资产包' })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: '确认行程，生成图文资产包' }));
    expect(screen.getByText(/文案仅作漫游灵感参考，不含订票、组团服务/)).toBeTruthy();
    expect(screen.queryByText(/文案只做慢游灵感/)).toBeNull();
    expect(screen.getAllByRole('button', { name: '确认行程，生成图文资产包' })).toHaveLength(1);
  });
});
