import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import HoloSearchPlanPosterPanel from '@/components/home/holo/HoloSearchPlanPosterPanel';
import { buildSearchPlanDouyinPosterBlob } from '@/lib/home/buildSearchPlanPoster';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const pngBlob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });

vi.mock('@/lib/home/buildSearchPlanPoster', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/buildSearchPlanPoster')>(
    '@/lib/home/buildSearchPlanPoster',
  );
  return {
    ...actual,
    buildSearchPlanPosterBlob: vi.fn(async () => pngBlob),
    buildSearchPlanDouyinPosterBlob: vi.fn(async () => pngBlob),
    buildSearchPlanXhsPosterBlob: vi.fn(async () => pngBlob),
    buildSearchPlanXhsPosterSlides: vi.fn(async () => [pngBlob, pngBlob, pngBlob]),
  };
});

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 4,
    peopleType: '单人',
    budget: null,
    theme: null,
  },
  budgetList: [],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '外滩闲逛',
      hotelArea: '外滩',
      tips: '',
      traffic: [],
      spots: [{ name: '外滩', intro: '必体验' }],
      foods: [],
    },
  ],
};

describe('HoloSearchPlanPosterPanel', () => {
  it('keeps wechat and douyin actions compact, and xhs without per-slide save', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const copyPlainText = vi.fn(async () => true);
    render(
      <HoloSearchPlanPosterPanel
        plan={plan}
        savedSessionId={null}
        onSystemShare={async () => 'copied'}
        copyPlainText={copyPlainText}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('button', { name: '收起分享图' })).toBeTruthy();
    expect(screen.getByText(/分享标题：上海4天｜一个人慢慢走的外滩路线/)).toBeTruthy();
    expect(screen.getByText(/种草短句：一个人沿着外滩慢慢逛/)).toBeTruthy();
    expect(screen.getByText(/话题标签：#上海旅行 #外滩 #街巷慢逛/)).toBeTruthy();
    expect(await screen.findByRole('button', { name: '复制图片' })).toBeTruthy();
    expect(screen.getByText('单图+配套文案，一键复制')).toBeTruthy();
    expect(screen.getByRole('button', { name: '保存图片' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制文案' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制链接' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '查看大图' })).toBeNull();
    expect(screen.queryByRole('button', { name: '系统分享' })).toBeNull();
    expect(screen.queryByRole('button', { name: /保存当前/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: '复制文案' }));
    expect(copyPlainText).toHaveBeenCalledWith(
      expect.stringContaining('上海4天｜一个人慢慢走的外滩路线'),
    );
    expect(copyPlainText.mock.calls[0]?.[0]).toContain('#上海旅行 #外滩 #街巷慢逛');
    expect(await screen.findByText('复制成功')).toBeTruthy();

    await user.click(screen.getByRole('tab', { name: '抖音' }));
    expect(await screen.findByText('单图+配套文案，上传抖音发布')).toBeTruthy();
    expect(screen.getByText(/上海小众慢游路线！外滩真的美哭/)).toBeTruthy();
    expect(screen.getByText(/话题标签：#上海旅游 #外滩慢游 #江南旅游/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制图片' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '保存图片' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制文案' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制链接' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '查看大图' })).toBeNull();
    expect(screen.queryByText(/「分享图片」/)).toBeNull();

    await user.click(screen.getByRole('tab', { name: '小红书' }));
    expect(await screen.findByText('全套3图+配套文案，一键复制')).toBeTruthy();
    expect(screen.getByText(/一个人也能松弛逛吃上海/)).toBeTruthy();
    expect(screen.getByText(/#上海单人旅行/)).toBeTruthy();
    expect(screen.getByRole('button', { name: '保存全部图片' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制图片' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制文案' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '复制链接' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /保存当前/ })).toBeNull();
    expect(screen.queryByRole('button', { name: '查看大图' })).toBeNull();

    await user.click(screen.getByRole('button', { name: '收起分享图' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows a friendly retry when the douyin poster cannot read scenery', async () => {
    const user = userEvent.setup();
    vi.mocked(buildSearchPlanDouyinPosterBlob).mockRejectedValue(
      new TypeError("Cannot read properties of null (reading 'scenery')"),
    );
    render(
      <HoloSearchPlanPosterPanel
        plan={plan}
        savedSessionId={null}
        onSystemShare={async () => 'copied'}
        copyPlainText={async () => true}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('tab', { name: '抖音' }));
    expect(await screen.findByText('配图暂时没生成，点重试再看一眼')).toBeTruthy();
    expect(screen.queryByText(/reading 'scenery'/)).toBeNull();
    vi.mocked(buildSearchPlanDouyinPosterBlob).mockResolvedValue(pngBlob);
    await user.click(screen.getByRole('button', { name: '重试' }));
    expect(await screen.findByRole('img', { name: /上海行程分享图/ })).toBeTruthy();
  });
});
