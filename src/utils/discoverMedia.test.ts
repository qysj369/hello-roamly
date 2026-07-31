import { describe, expect, it } from 'vitest';
import { resolveCoverFromPlaceText } from '@/data/cityCoverImages';
import { getMomentCoverUrl } from '@/utils/discoverMedia';
import type { TravelMoment } from '@/types/domain/user/userSocial';

describe('resolveCoverFromPlaceText', () => {
  it('maps landmark aliases to city covers', () => {
    expect(resolveCoverFromPlaceText('西湖 · 杭州')).toContain('1747798678108');
    expect(resolveCoverFromPlaceText('灵隐 · 杭州')).toContain('1676487419872');
    expect(resolveCoverFromPlaceText('清迈夜市')).toContain('1773484133112');
    expect(resolveCoverFromPlaceText('蓝湖 · 冰岛')).toContain('1576090674370');
    expect(resolveCoverFromPlaceText('维克 · 冰岛')).toContain('1705630547844');
  });
});

describe('getMomentCoverUrl', () => {
  it('ignores picsum placeholders and uses destination cover', () => {
    const moment: TravelMoment = {
      id: 'm-test',
      authorId: 'u1',
      description: '西湖边早餐',
      location: '西湖 · 杭州',
      imageUrls: ['https://picsum.photos/seed/roamly-hz/800/600'],
      visibility: 'public',
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cover = getMomentCoverUrl(moment);
    expect(cover).toContain('1747798678108');
    expect(cover).not.toContain('picsum.photos');
  });
});
