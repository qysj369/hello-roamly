import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HoloSearchPlanReadySheet from '@/components/home/holo/HoloSearchPlanReadySheet';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

vi.mock('@/utils/copyTextToClipboard', () => ({
  copyTextToClipboard: vi.fn(async () => 'copied'),
  copyTextToClipboardSync: vi.fn(() => 'copied'),
  sharePlainText: vi.fn(async () => 'copied'),
  shouldUseNativeShare: () => false,
}));

vi.mock('@/lib/home/saveSearchStructuredPlan', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/saveSearchStructuredPlan')>(
    '@/lib/home/saveSearchStructuredPlan',
  );
  return {
    ...actual,
    saveSearchStructuredPlan: vi.fn(async () => ({ sessionId: 'plan-test' })),
    ensureSharedSearchPlan: vi.fn(async () => 'plan-shared'),
  };
});

vi.mock('@/lib/browser/planVoiceNarration', () => ({
  speakPlanVoiceNarration: vi.fn((_text: string, options?: { onEnd?: () => void }) => {
    options?.onEnd?.();
  }),
  stopPlanVoiceNarration: vi.fn(),
  consumeAutoNarrateNextPlan: vi.fn(() => false),
  requestAutoNarrateNextPlan: vi.fn(),
}));

vi.mock('@/components/agent/TravelAgentHost', () => ({
  default: () => (
    <aside className="travel-agent-host travel-agent-host--embed" aria-label="蜗牛管家">
      <button type="button" aria-label="打开蜗牛管家">
        管家
      </button>
    </aside>
  ),
}));

vi.mock('@/components/home/holo/HoloSearchPlanShareSheet', () => ({
  default: ({ onClose }: { onClose?: () => void }) => (
    <div>
      发给朋友
      <p>先点微信、抖音或小红书</p>
      <button type="button">微信</button>
      <button type="button">抖音</button>
      <button type="button">小红书</button>
      <button type="button" onClick={onClose}>
        收起分享
      </button>
    </div>
  ),
  toShareAutoExport: (kind: string) => (kind === 'wechat' || kind === 'douyin' || kind === 'xhs' ? kind : null),
}));

vi.mock('@/hooks/map/useHomeMapSearchVoice', () => ({
  useHomeMapSearchVoice: () => ({
    supported: true,
    active: false,
    processing: false,
    error: null,
    preview: '',
    status: '',
    inputLevel: 0,
    requiresManualFinish: false,
    toggle: vi.fn(),
    finishUtterance: vi.fn(),
    stop: vi.fn(),
  }),
}));

import { copyTextToClipboard, copyTextToClipboardSync } from '@/utils/copyTextToClipboard';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { MIN_ASIDE_PREVIEW_CARDS } from '@/lib/home/planCityAtmosphere';
import { ensureSharedSearchPlan, saveSearchStructuredPlan } from '@/lib/home/saveSearchStructuredPlan';
import { speakPlanVoiceNarration } from '@/lib/browser/planVoiceNarration';
import { useTravelAgentStore } from '@/stores/travelAgent/store';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [
    { item: '往返大交通', perPerson: 0, tip: '根据出发地选择高铁或飞机' },
    { item: '市内交通', perPerson: 150, tip: '地铁公交为主，预留部分打车额度' },
    { item: '餐饮', perPerson: 600, tip: '正餐人均100-150' },
    { item: '合计', perPerson: 2600, tip: '' },
  ],
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
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: vi.fn(() => false),
  });
  vi.mocked(copyTextToClipboard).mockResolvedValue('copied');
  vi.mocked(copyTextToClipboardSync).mockReturnValue('copied');
  vi.mocked(ensureSharedSearchPlan).mockClear();
  vi.mocked(saveSearchStructuredPlan).mockClear();
  useTravelAgentStore.setState({ open: false });
});

const hidden = { hidden: true } as const;

describe('HoloSearchPlanReadySheet copy/share', () => {
  it('shows copy, share and save, and keeps AI folded', () => {
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    expect(screen.getByRole('button', { name: '发给朋友', ...hidden })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'AI调整行程', ...hidden })).toBeNull();
    expect(screen.getByRole('button', { name: '更多', ...hidden })).toBeTruthy();
    expect(screen.getByText('打开蜗牛管家，微调你的行程', hidden)).toBeTruthy();
    expect(screen.queryByRole('button', { name: '复制行程', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '保存行程', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '改成亲子', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '下雨怎么走', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '人多怎么走', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '换馆子', ...hidden })).toBeNull();
    expect(screen.getAllByRole('button', { name: '打开蜗牛管家', ...hidden }).length).toBeGreaterThan(0);
    expect(document.querySelector('.holo-home__plan-sheet-inner--with-agent')).toBeNull();
    expect(screen.queryByRole('button', { name: '朗读', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '回退上一版', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '分享图', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '语音助手', ...hidden })).toBeNull();
    expect(screen.queryByRole('button', { name: '补充景点详情', ...hidden })).toBeNull();
    expect(screen.getByText('预算明细', hidden).closest('details')).toBeTruthy();
    expect(screen.getByText(/西湖值得慢慢逛/, hidden)).toBeTruthy();
    expect(screen.getByText('住宿片区 · 湖滨', hidden)).toBeTruthy();
    expect(screen.getAllByText(/住宿片区/, hidden)).toHaveLength(1);
    expect(screen.queryByText('美景占位', hidden)).toBeNull();
    expect(document.querySelector('.holo-home__plan-day-photo')).toBeTruthy();
  });

  it('opens the butler from the toolbar and from 只改这一处', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getAllByRole('button', { name: '打开蜗牛管家', ...hidden })[0]);
    expect(useTravelAgentStore.getState().open).toBe(true);
    expect(useTravelAgentStore.getState().plan).toBeTruthy();
    expect(document.querySelector('.holo-home__plan-sheet-inner--with-agent')).toBeTruthy();
    useTravelAgentStore.setState({ open: false });
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    await user.click(screen.getByRole('menuitem', { name: '只改这一处', ...hidden }));
    expect(useTravelAgentStore.getState().open).toBe(true);
    expect(screen.getByText('在管家里写要改的那一句，再发送。', hidden)).toBeTruthy();
  });

  it('runs 回退上一版 from the more menu without freezing', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    await user.click(screen.getByRole('menuitem', { name: '回退上一版', ...hidden }));
    expect(screen.getByText('还没有上一版。先改一处，才能回退。', hidden)).toBeTruthy();
  });

  it('opens a single-layer share sheet and keeps increment actions folded', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '发给朋友', ...hidden }));
    expect(ensureSharedSearchPlan).toHaveBeenCalledWith(plan, null);
    expect(await screen.findByText(/先点微信、抖音或小红书|先选一个渠道/, hidden)).toBeTruthy();
    expect(screen.getByRole('button', { name: /微信/, ...hidden })).toBeTruthy();
    expect(screen.getByRole('button', { name: /抖音/, ...hidden })).toBeTruthy();
    expect(screen.getByRole('button', { name: /小红书/, ...hidden })).toBeTruthy();
    expect(screen.queryByText('发到微信', hidden)).toBeNull();
    expect(screen.queryByText('微博', hidden)).toBeNull();
    expect(screen.queryByRole('button', { name: '补充景点详情', ...hidden })).toBeNull();
    await user.click(screen.getByRole('button', { name: '收起分享', ...hidden }));
    expect(screen.queryByText(/先点微信、抖音或小红书/)).toBeNull();
    expect(screen.getByRole('button', { name: '发给朋友', ...hidden })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    expect(screen.queryByRole('button', { name: '补充景点详情', ...hidden })).toBeNull();
    expect(screen.getByRole('menuitem', { name: '朗读', ...hidden })).toBeTruthy();
  });

  it('copies formatted itinerary on click', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    expect(screen.queryByRole('menuitem', { name: '改成亲子', ...hidden })).toBeNull();
    expect(screen.getByRole('menuitem', { name: '朗读', ...hidden })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: '回退上一版', ...hidden })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: '只改这一处', ...hidden })).toBeTruthy();
    await user.click(screen.getByRole('menuitem', { name: '复制行程', ...hidden }));
    expect(copyTextToClipboardSync).toHaveBeenCalledWith(expect.stringContaining('杭州 · 3天 · 好友结伴'));
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    expect(await screen.findByRole('menuitem', { name: '已复制', ...hidden })).toBeTruthy();
  });

  it('saves the itinerary into the existing plan library', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    await user.click(screen.getByRole('menuitem', { name: '保存行程', ...hidden }));
    await user.click(screen.getByRole('button', { name: '确认保存', ...hidden }));
    expect(saveSearchStructuredPlan).toHaveBeenCalledWith(
      expect.objectContaining({ title: '杭州3天｜和好友避开人流的湖边松弛路线', isPublic: false }),
    );
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    expect(await screen.findByRole('menuitem', { name: '已保存', ...hidden })).toBeTruthy();
  });

  it('shows at least six Shanghai aside photos mixed with food', () => {
    const couple = matchSearchPlanGoldExample({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '情侣',
      budget: null,
      theme: null,
    })!;
    render(<HoloSearchPlanReadySheet plan={couple} onClose={() => undefined} />);
    const aside = screen.getByRole('complementary', { name: '上海美景与美食', ...hidden });
    const photos = aside.querySelectorAll('img.holo-home__plan-aside-photo');
    expect(photos.length).toBeGreaterThanOrEqual(MIN_ASIDE_PREVIEW_CARDS);
    const srcs = [...photos].map((img) => img.getAttribute('src') ?? '');
    expect(new Set(srcs).size).toBeGreaterThanOrEqual(MIN_ASIDE_PREVIEW_CARDS);
    expect(srcs.every((src) => !src.startsWith('data:image/svg+xml'))).toBe(true);
  });

  it('renders city kit scenery for Hangzhou, not a hardcoded other city', () => {
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    expect(screen.getByRole('complementary', { name: '杭州美景与美食', ...hidden })).toBeTruthy();
    expect(screen.getByText('西湖环湖', hidden)).toBeTruthy();
    expect(screen.queryByText('什刹海', hidden)).toBeNull();
  });

  it('shows Guangzhou local food photos instead of empty placeholders', () => {
    render(
      <HoloSearchPlanReadySheet
        plan={{
          ...plan,
          baseInfo: { ...plan.baseInfo, targetCity: '广州' },
        }}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText('肠粉', hidden)).toBeTruthy();
    expect(screen.getByText('糖水', hidden)).toBeTruthy();
    const aside = screen.getByRole('complementary', { name: '广州美景与美食', ...hidden });
    const photos = aside.querySelectorAll('img.holo-home__plan-aside-photo');
    const srcs = [...photos].map((img) => img.getAttribute('src') ?? '');
    expect(srcs.some((src) => src.includes('cheungfun'))).toBe(true);
    expect(srcs.some((src) => src.includes('tongshui'))).toBe(true);
    expect(srcs.every((src) => !src.startsWith('data:image/svg+xml'))).toBe(true);
  });

  it('switches budget copy when the plan city changes to Suzhou', () => {
    render(
      <HoloSearchPlanReadySheet
        plan={{
          ...plan,
          baseInfo: { ...plan.baseInfo, targetCity: '苏州' },
        }}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByText(/苏州地铁/, hidden)).toBeTruthy();
    expect(screen.getAllByText(/苏式面/, hidden).length).toBeGreaterThan(0);
    expect(screen.queryByText(/杭州地铁公交为主/, hidden)).toBeNull();
  });

  it('shows a fallback photo when Beijing food has no real shot', () => {
    render(
      <HoloSearchPlanReadySheet
        plan={{
          ...plan,
          baseInfo: { ...plan.baseInfo, targetCity: '北京' },
        }}
        onClose={() => undefined}
      />,
    );
    const aside = screen.getByRole('complementary', { name: '北京美景与美食', ...hidden });
    expect(screen.getByText('炸酱面', hidden)).toBeTruthy();
    const srcs = [...aside.querySelectorAll('img.holo-home__plan-aside-photo')].map(
      (img) => img.getAttribute('src') ?? '',
    );
    expect(srcs.some((src) => src.includes('shichahai'))).toBe(true);
    expect(srcs.some((src) => src.startsWith('data:image/svg+xml'))).toBe(true);
  });

  it('loads Beijing kit media when the plan city changes', () => {
    render(
      <HoloSearchPlanReadySheet
        plan={{
          ...plan,
          baseInfo: { ...plan.baseInfo, targetCity: '北京' },
        }}
        onClose={() => undefined}
      />,
    );
    expect(screen.getByRole('complementary', { name: '北京美景与美食', ...hidden })).toBeTruthy();
    expect(screen.getByText('什刹海', hidden)).toBeTruthy();
    expect(screen.queryByText('西湖环湖', hidden)).toBeNull();
  });

  it('renames increment actions and localizes Hangzhou budget tips', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    expect(screen.queryByRole('button', { name: '补充景点详情', ...hidden })).toBeNull();
    expect(screen.getByRole('menuitem', { name: '朗读', ...hidden })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '加入一些景点介绍', ...hidden })).toBeNull();
    expect(screen.getByRole('heading', { name: '杭州3天好友结伴', ...hidden })).toBeTruthy();
    expect(screen.getByText('3天人均80‑120元', hidden)).toBeTruthy();
    expect(screen.getByText(/杭州地铁公交为主/, hidden)).toBeTruthy();
    expect(screen.getByText('按出发地核算', hidden)).toBeTruthy();
    expect(screen.getByText('根据你的出发地核算高铁/机票往返费用，提前购票可享折扣', hidden)).toBeTruthy();
    expect(screen.queryByText('人均 0元', hidden)).toBeNull();
    expect(screen.queryByText('人均 150元', hidden)).toBeNull();
    expect(screen.queryByText('地铁公交为主，预留部分打车额度', hidden)).toBeNull();
  });

  it('starts narration from the structured summary', async () => {
    const user = userEvent.setup();
    render(<HoloSearchPlanReadySheet plan={plan} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: '更多', ...hidden }));
    await user.click(screen.getByRole('menuitem', { name: '朗读', ...hidden }));
    expect(speakPlanVoiceNarration).toHaveBeenCalledWith(
      expect.stringContaining('杭州3天好友结伴'),
      expect.objectContaining({ immediate: true }),
    );
    expect(speakPlanVoiceNarration).toHaveBeenCalledWith(
      expect.stringContaining('西湖'),
      expect.objectContaining({ immediate: true }),
    );
  });
});
