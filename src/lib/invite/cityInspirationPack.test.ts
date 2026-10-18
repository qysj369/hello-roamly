import { describe, expect, it } from 'vitest';
import {
  CITY_INSPIRATION_PACK_REWARD_ID,
  isCityInspirationPackUnlocked,
  listCityInspirationPackPhotos,
} from '@/lib/invite/cityInspirationPack';
import type { InviteSummary } from '@/types/domain/invite';

function summary(partial: Partial<InviteSummary>): InviteSummary {
  return {
    inviteCode: 'ROAM2026',
    inviteLink: 'https://helloroamly.com/?ref=ROAM2026',
    invitedCount: 0,
    activeCount: 0,
    pendingRewardCount: 1,
    totalPointsEarned: 0,
    rewards: [
      {
        id: CITY_INSPIRATION_PACK_REWARD_ID,
        kind: 'coupon',
        label: '高清城市灵感素材包',
        status: 'pending',
        condition: '邀请 1 位好友完成注册后解锁',
      },
    ],
    referrals: [],
    ...partial,
  };
}

describe('cityInspirationPack', () => {
  it('lists local city-kit photos without outbound urls', () => {
    const photos = listCityInspirationPackPhotos();
    expect(photos.length).toBeGreaterThan(3);
    expect(photos.length).toBeLessThanOrEqual(18);
    expect(photos.every((src) => src.startsWith('/') || src.startsWith('http://localhost'))).toBe(true);
    expect(photos.join(' ')).not.toContain('特惠');
  });

  it('unlocks after one successful invite or a granted reward', () => {
    expect(isCityInspirationPackUnlocked(summary({ invitedCount: 0 }))).toBe(false);
    expect(isCityInspirationPackUnlocked(summary({ invitedCount: 1 }))).toBe(true);
    expect(
      isCityInspirationPackUnlocked(
        summary({
          invitedCount: 0,
          rewards: [
            {
              id: CITY_INSPIRATION_PACK_REWARD_ID,
              kind: 'coupon',
              label: '高清城市灵感素材包',
              status: 'granted',
              condition: '邀请 1 位好友完成注册后解锁',
            },
          ],
        }),
      ),
    ).toBe(true);
  });
});
