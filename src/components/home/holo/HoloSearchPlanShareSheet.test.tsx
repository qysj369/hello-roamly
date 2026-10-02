import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HoloSearchPlanShareSheet from '@/components/home/holo/HoloSearchPlanShareSheet';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { SEARCH_PLAN_SHARE_REF } from '@/lib/home/searchPlanShareChannels';
import { copyVisibleText } from '@/utils/copyTextToClipboard';
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

function visiblePreviewText(): string {
  const dialog = screen.getByRole('dialog', { name: '发给朋友' });
  return [
    screen.getByRole('status').textContent,
    (screen.getByRole('textbox', { name: '朋友圈短文案' }) as HTMLTextAreaElement).value,
    (screen.getByRole('textbox', { name: '抖音口播' }) as HTMLTextAreaElement).value,
    (screen.getByRole('textbox', { name: '小红书种草文案' }) as HTMLTextAreaElement).value,
    dialog.textContent,
  ].join('\n');
}

describe('HoloSearchPlanShareSheet', () => {
  beforeEach(() => {
    vi.mocked(copyVisibleText).mockReturnValue('copied');
    vi.mocked(downloadBlob).mockClear();
    vi.mocked(downloadBlobsSequential).mockClear();
  });

  it('keeps WeChat, Douyin and Xiaohongshu sections without extra apps', async () => {
    renderSheet();
    expect(screen.getByRole('dialog', { name: '发给朋友' })).toBeTruthy();
    expect(screen.getByRole('status')).toHaveTextContent(/点微信、抖音或小红书/);
    expect(screen.getByRole('status')).not.toHaveTextContent(/复制全文|行程亮点|专属贴士/);
    expect(screen.queryByRole('button', { name: '复制全文' })).toBeNull();
    expect(screen.queryByRole('textbox', { name: '完整攻略' })).toBeNull();
    expect(screen.queryByText('完整攻略（复制发给好友）')).toBeNull();
    expect(screen.getByRole('region', { name: '微信' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '抖音' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '小红书' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /发到微信/ })).toBeNull();
    expect(screen.queryByText('还要发抖音 / 知乎 / B站 / 快手')).toBeNull();
    expect(copyVisibleText).not.toHaveBeenCalled();
    expect(screen.queryByAltText('扫码打开完整攻略页')).toBeNull();
    expect(screen.getByRole('img', { name: /抖音竖版/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '全屏录屏卡' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下载微信海报并复制文案' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '朋友圈短文案' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下载抖音海报并复制口播' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '抖音口播' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '下载3张小红书海报并复制种草文案' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: '小红书种草文案' })).toBeTruthy();
    expect(screen.getByText(/不从事旅行社组团/)).toBeTruthy();
    expect(visiblePreviewText()).not.toMatch(PRICE_OR_TIP);
    expect(visiblePreviewText()).toContain(SEARCH_PLAN_SHARE_REF);
    expect(downloadBlobsSequential).not.toHaveBeenCalled();
  });

  it('downloads WeChat square poster, copies the short note, and shows the QR', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: '下载微信海报并复制文案' }));
    expect(downloadBlob).toHaveBeenCalled();
    const wechatBox = screen.getByRole('textbox', { name: '朋友圈短文案' }) as HTMLTextAreaElement;
    expect(wechatBox.value).not.toContain('helloroamly.com');
    expect(wechatBox.value).not.toMatch(PRICE_OR_TIP);
    expect(await screen.findByRole('status')).toHaveTextContent(/图已下载|话已复制|微信/);
    expect(await screen.findByAltText('扫码打开完整攻略页')).toBeTruthy();
  });

  it('hides the QR after switching to Douyin', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: '下载微信海报并复制文案' }));
    expect(await screen.findByAltText('扫码打开完整攻略页')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '下载抖音海报并复制口播' }));
    expect(screen.queryByAltText('扫码打开完整攻略页')).toBeNull();
  });

  it('downloads Douyin vertical poster and copies spoken copy without a QR', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: '下载抖音海报并复制口播' }));
    expect(downloadBlob).toHaveBeenCalled();
    const douyinBox = screen.getByRole('textbox', { name: '抖音口播' }) as HTMLTextAreaElement;
    expect(douyinBox.value).not.toContain('helloroamly.com');
    expect(douyinBox.value).not.toMatch(PRICE_OR_TIP);
    expect(await screen.findByRole('status')).toHaveTextContent(/竖版图已下载|口播已复制|抖音/);
    expect(screen.queryByAltText('扫码打开完整攻略页')).toBeNull();
  });

  it('downloads three Xiaohongshu posters and copies the seed note', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: '下载3张小红书海报并复制种草文案' }));
    expect(downloadBlobsSequential).toHaveBeenCalled();
    const [blobs] = vi.mocked(downloadBlobsSequential).mock.calls[0]!;
    expect(blobs).toHaveLength(3);
    const xhsBox = screen.getByRole('textbox', { name: '小红书种草文案' }) as HTMLTextAreaElement;
    expect(xhsBox.value).toContain(SEARCH_PLAN_SHARE_REF);
    expect(xhsBox.value).not.toContain('helloroamly.com');
    expect(xhsBox.value).not.toMatch(PRICE_OR_TIP);
    expect(await screen.findByRole('status')).toHaveTextContent('小红书图文素材已全部就绪。');
    expect(screen.queryByAltText('扫码打开完整攻略页')).toBeNull();
  });

  it('closes when tapping 关闭', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSheet(onClose);
    await user.click(screen.getByRole('button', { name: '关闭' }));
    expect(onClose).toHaveBeenCalled();
  });
});
