import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HoloSearchPlanShareSheet from '@/components/home/holo/HoloSearchPlanShareSheet';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { SEARCH_PLAN_SHARE_REF } from '@/lib/home/searchPlanShareChannels';
import { copyTextToClipboardSync, copyVisibleText } from '@/utils/copyTextToClipboard';
import { downloadBlob, downloadBlobsSequential } from '@/lib/share/download';

vi.mock('@/utils/copyTextToClipboard', () => ({
  copyVisibleText: vi.fn(() => 'copied'),
  copyTextToClipboardSync: vi.fn(() => 'copied'),
}));

vi.mock('@/lib/share/wechat', () => ({
  isWechatInAppBrowser: () => false,
}));

vi.mock('@/lib/share/wechatJsSdk', () => ({
  configureWechatJsShare: vi.fn(async () => false),
  wechatShareCardImageUrl: () => 'https://helloroamly.com/assets/snail-drag-earth.png',
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,qr'),
  },
}));

vi.mock('@/lib/home/buildSearchPlanPoster', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/buildSearchPlanPoster')>(
    '@/lib/home/buildSearchPlanPoster',
  );
  const png = new Blob(['png'], { type: 'image/png' });
  return {
    ...actual,
    searchPlanPosterShareUrl: () => 'https://helloroamly.com/saved-plans/plan-sh?from=share',
    buildSearchPlanDouyinStaticPosterBlob: vi.fn(async () => png),
    buildSearchPlanWechatSquarePosterBlob: vi.fn(async () => png),
  };
});

vi.mock('@/lib/home/buildSearchPlanXhsNotePack', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/buildSearchPlanXhsNotePack')>(
    '@/lib/home/buildSearchPlanXhsNotePack',
  );
  const png = new Blob(['png'], { type: 'image/png' });
  return {
    ...actual,
    renderSearchPlanXhsNotePosters: vi.fn(async () => [png, png, png]),
  };
});

vi.mock('@/lib/share/renderItinerarySummaryPoster', () => ({
  renderItinerarySummaryPoster: vi.fn(async () => new Blob(['png'], { type: 'image/png' })),
}));

vi.mock('@/lib/home/searchPlanShareVisuals', async () => {
  const actual = await vi.importActual<typeof import('@/lib/home/searchPlanShareVisuals')>(
    '@/lib/home/searchPlanShareVisuals',
  );
  const png = new Blob(['png'], { type: 'image/png' });
  return {
    ...actual,
    renderSearchPlanShareImages: vi.fn(async () => [png, png, png, png, png, png]),
  };
});

vi.mock('@/lib/share/download', () => ({
  downloadBlob: vi.fn(),
  downloadBlobsSequential: vi.fn(async () => undefined),
}));

const PRICE_OR_TIP = /人均|\d+\s*元|【行程亮点】|【本次行程专属贴士】|【预算明细】/;

const plan = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

function renderSheet(onClose = () => undefined, copiedOnOpen = false) {
  return render(
    <HoloSearchPlanShareSheet
      plan={plan}
      savedSessionId="plan-sh"
      copiedOnOpen={copiedOnOpen}
      onClose={onClose}
    />,
  );
}

describe('HoloSearchPlanShareSheet', () => {
  beforeEach(() => {
    vi.mocked(copyVisibleText).mockReturnValue('copied');
    vi.mocked(copyTextToClipboardSync).mockReturnValue('copied');
    vi.mocked(downloadBlob).mockClear();
    vi.mocked(downloadBlobsSequential).mockClear();
    vi.mocked(copyTextToClipboardSync).mockClear();
  });

  it('starts with stacked channels and a WeChat summary, not empty previews', () => {
    renderSheet();
    expect(screen.getByRole('dialog', { name: '发给朋友' })).toBeTruthy();
    expect(screen.getByRole('status')).toHaveTextContent(/复制.*文案|汇总海报|选平台/);
    expect(screen.getByRole('button', { name: /微信/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /抖音/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /小红书/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '朋友圈短文案' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: '抖音口播' })).toBeNull();
    expect(screen.queryByRole('textbox', { name: '小红书种草文案' })).toBeNull();
    expect(screen.queryByRole('button', { name: '全屏录屏卡' })).toBeNull();
    expect(screen.queryByRole('button', { name: /发到微信/ })).toBeNull();
    expect(screen.queryByText('微博')).toBeNull();
    expect(copyTextToClipboardSync).not.toHaveBeenCalled();
    expect(screen.getByText(/不从事旅行社组团/)).toBeTruthy();
  });

  it('shows a filled WeChat preview, steps, copy, download and QR', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: /微信/ }));
    expect(screen.getByRole('region', { name: '微信' })).toBeTruthy();
    expect(screen.getByText(/打开微信/)).toBeTruthy();
    expect(screen.getByLabelText('微信汇总海报预览')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '朋友圈短文案' })).toBeTruthy();
    const wechatBox = screen.getByRole('textbox', { name: '朋友圈短文案' }) as HTMLTextAreaElement;
    expect(wechatBox.value).not.toContain('helloroamly.com');
    expect(wechatBox.value).not.toMatch(PRICE_OR_TIP);
    expect(wechatBox.value).toContain(SEARCH_PLAN_SHARE_REF);
    expect(wechatBox.value).toContain('D1');
    expect(wechatBox.value).toContain('出行小提示');
    expect(wechatBox.value).toMatch(/上海3天好友慢游/);
    await user.click(screen.getByRole('button', { name: '下载海报' }));
    expect(downloadBlob).toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent(/微信|海报|复制/);
    expect(screen.getAllByAltText('扫码打开这趟行程').length).toBe(1);
  });

  it('keeps a combined summary poster when switching to Douyin', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: /微信/ }));
    expect(screen.getAllByAltText('扫码打开这趟行程').length).toBe(1);
    await user.click(screen.getByRole('button', { name: /抖音/ }));
    expect(screen.getByLabelText('抖音汇总海报预览')).toBeTruthy();
    expect(screen.getAllByAltText('扫码打开这趟行程').length).toBe(1);
  });

  it('downloads Douyin summary poster and copies spoken copy', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: /抖音/ }));
    await user.click(screen.getByRole('button', { name: '下载海报' }));
    expect(downloadBlob).toHaveBeenCalled();
    const douyinBox = screen.getByRole('textbox', { name: '抖音口播' }) as HTMLTextAreaElement;
    expect(douyinBox.value).not.toContain('helloroamly.com');
    expect(douyinBox.value).not.toMatch(PRICE_OR_TIP);
    expect(await screen.findByRole('status')).toHaveTextContent(/抖音|口播|海报/);
  });

  it('downloads one Xiaohongshu summary poster and copies the seed note', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: /小红书/ }));
    expect(screen.getByLabelText('小红书汇总海报预览')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '复制文案' }));
    await user.click(screen.getByRole('button', { name: '下载海报' }));
    expect(downloadBlob).toHaveBeenCalled();
    const xhsBox = screen.getByRole('textbox', { name: '小红书种草文案' }) as HTMLTextAreaElement;
    expect(xhsBox.value).toContain(SEARCH_PLAN_SHARE_REF);
    expect(xhsBox.value).not.toContain('helloroamly.com');
    expect(xhsBox.value).not.toMatch(PRICE_OR_TIP);
    expect(xhsBox.value.length).toBeGreaterThan(80);
    expect(await screen.findByRole('status')).toHaveTextContent(/小红书|海报|复制/);
  });

  it('closes when tapping 关闭', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSheet(onClose);
    await user.click(screen.getByRole('button', { name: '关闭' }));
    expect(onClose).toHaveBeenCalled();
  });
});
