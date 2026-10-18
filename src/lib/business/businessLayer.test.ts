import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  hasBusinessPayload,
  hasFullFreeBaseAccess,
  hasMemberAddonAccess,
  resolveDistributeLink,
  resolvePaidGuideId,
  resolveUserAccessLane,
  shouldRenderBusinessSlot,
} from '@/lib/business';
import { isOpenBusiness } from '@/lib/business/businessConfig';
import type { BusinessExtensionFields } from '@/types/domain/businessExtensions';
import type { HoloCityPreviewPanel } from '@/data/holoCityPreviewPanel';
import type { HoloHomeCityKitItem } from '@/data/holoHotCityKit';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

describe('business layer decoupling', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults isOpenBusiness to false (pure free site)', () => {
    expect(isOpenBusiness()).toBe(false);
    expect(shouldRenderBusinessSlot('slotCityStay')).toBe(false);
    expect(shouldRenderBusinessSlot('slotNicheExperience')).toBe(false);
    expect(shouldRenderBusinessSlot('slotToolboxValueAdd')).toBe(false);
    expect(resolveDistributeLink({ distributeLink: 'https://x.example/d' })).toBeNull();
    expect(resolvePaidGuideId({ paidGuideId: 'guide-1' })).toBeNull();
  });

  it('opens slots when VITE_OPEN_BUSINESS=1', () => {
    vi.stubEnv('VITE_OPEN_BUSINESS', '1');
    expect(isOpenBusiness()).toBe(true);
    expect(shouldRenderBusinessSlot('slotCityStay')).toBe(true);
    expect(resolveDistributeLink({ distributeLink: 'https://x.example/d' })).toBe(
      'https://x.example/d',
    );
  });

  it('keeps free base access for all users; member is additive only', () => {
    expect(hasFullFreeBaseAccess()).toBe(true);
    expect(hasFullFreeBaseAccess({ isMember: true })).toBe(true);
    expect(resolveUserAccessLane()).toBe('free_base');
    expect(hasMemberAddonAccess({ isMember: true })).toBe(false);

    vi.stubEnv('VITE_OPEN_BUSINESS', '1');
    expect(resolveUserAccessLane({ isMember: true })).toBe('member_addon');
    expect(hasMemberAddonAccess({ isMember: true })).toBe(true);
    expect(hasMemberAddonAccess({ isMember: false })).toBe(false);
  });

  it('treats empty extension fields as non-renderable payload', () => {
    const empty: BusinessExtensionFields = {
      distributeLink: '',
      paidGuideId: null,
      activityTag: '  ',
    };
    expect(hasBusinessPayload(empty)).toBe(false);
    expect(hasBusinessPayload({ activityTag: '市集' })).toBe(true);
  });

  it('reserves extension fields on city / panel / guide types', () => {
    const city = {
      distributeLink: undefined,
      paidGuideId: undefined,
      activityTag: undefined,
      memberOnly: undefined,
    } satisfies Pick<
      HoloHomeCityKitItem,
      'distributeLink' | 'paidGuideId' | 'activityTag' | 'memberOnly'
    >;
    const panel = {
      distributeLink: null,
      paidGuideId: null,
      activityTag: null,
      memberOnly: false,
    } satisfies Pick<
      HoloCityPreviewPanel,
      'distributeLink' | 'paidGuideId' | 'activityTag' | 'memberOnly'
    >;
    const guide = {
      distributeLink: null,
      paidGuideId: null,
      activityTag: null,
      memberOnly: null,
    } satisfies Pick<
      AiSnailGuideResult,
      'distributeLink' | 'paidGuideId' | 'activityTag' | 'memberOnly'
    >;
    expect(city.memberOnly).toBeUndefined();
    expect(panel.paidGuideId).toBeNull();
    expect(guide.activityTag).toBeNull();
  });
});
