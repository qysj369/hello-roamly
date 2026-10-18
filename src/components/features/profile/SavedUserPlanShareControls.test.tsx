import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SavedUserPlanShareControls from '@/components/features/profile/SavedUserPlanShareControls';
import type { UserPlanRecord } from '@/types/api/userPlans';

vi.mock('@/utils/copyTextToClipboard', () => ({
  copyTextToClipboard: vi.fn(async () => 'copied'),
}));

vi.mock('@/components/features/profile/SavedUserPlanWechatSharePosterDialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div>海报预览</div> : null),
}));

import { copyTextToClipboard } from '@/utils/copyTextToClipboard';

const plan: UserPlanRecord = {
  id: 'plan-share-1',
  userId: 'user-roamly-demo',
  title: '上海4天情侣',
  isPublic: true,
  createdAt: '',
  updatedAt: '',
  content: {
    planId: 'plan-share-1',
    locationName: '上海',
    lng: 121.47,
    lat: 31.23,
    fullHistory: [],
  },
};

describe('SavedUserPlanShareControls', () => {
  beforeEach(() => {
    vi.mocked(copyTextToClipboard).mockResolvedValue('copied');
  });

  it('keeps only share and messages on the page, and opens copy/poster actions in a dialog', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SavedUserPlanShareControls plan={plan} variant="compact" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: '分享漫行方案' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '分享到消息' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '生成微信分享海报' })).toBeNull();
    expect(screen.queryByText('海报')).toBeNull();

    await user.click(screen.getByRole('button', { name: '分享漫行方案' }));
    expect(screen.getByRole('button', { name: '复制链接' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '生成海报' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '生成海报' }));
    expect(screen.getByText('海报预览')).toBeTruthy();
  });

  it('hides the inbox button on a share landing and still opens copy/poster actions', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SavedUserPlanShareControls plan={plan} variant="compact" hideInbox />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: '分享到消息' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '分享漫行方案' }));
    expect(screen.getByRole('button', { name: '复制链接' })).toBeTruthy();
  });

  it('copies the share link from the dialog', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SavedUserPlanShareControls plan={plan} variant="compact" />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: '分享漫行方案' }));
    await user.click(screen.getByRole('button', { name: '复制链接' }));
    expect(copyTextToClipboard).toHaveBeenCalledWith(expect.stringContaining('/saved-plans/plan-share-1'));
  });
});
