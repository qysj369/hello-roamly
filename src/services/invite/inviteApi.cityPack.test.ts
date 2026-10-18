import { describe, expect, it } from 'vitest';
import { CITY_INSPIRATION_PACK_REWARD_ID } from '@/lib/invite/cityInspirationPack';
import { fetchInviteSummary } from '@/services/invite/inviteApi';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';

describe('inviteApi city inspiration pack', () => {
  it('grants the city pack once demo referrals exist', async () => {
    const summary = await fetchInviteSummary(DEMO_CURRENT_USER_ID);
    expect(summary.invitedCount).toBeGreaterThanOrEqual(1);
    const pack = summary.rewards.find((item) => item.id === CITY_INSPIRATION_PACK_REWARD_ID);
    expect(pack?.status).toBe('granted');
    expect(pack?.label).toContain('高清城市灵感素材包');
  });
});
