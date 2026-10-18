import { describe, expect, it } from 'vitest';
import { resolvePlanCoverImage, resolvePlanSpotImage } from '@/data/planSceneImages';

const SZ_INTRO =
  '济南奔赴深圳两日轻漫行，节奏松弛不赶行程。打卡华强北数码市井、海岸城商圈、深圳湾滨海栈道，看海湾日落。';

describe('planSceneImages — 本地图库绑定', () => {
  it('Shenzhen cover stays Shenzhen Bay boardwalk', () => {
    const cover = resolvePlanCoverImage({
      intro: SZ_INTRO,
      itinerary: 'Day1 南山科技园；Day2 华强北',
      initialQuery: '济南到深圳两日轻漫行',
    });
    expect(cover?.src).toContain('/plan-scenes/shenzhen/cover-sz.jpg');
  });

  it('Shenzhen spots bind distinct local files', () => {
    const used = new Set<string>();
    const a = resolvePlanSpotImage('南山科技园', { usedIds: used, dayLabel: 'Day1' });
    const b = resolvePlanSpotImage('海岸城商圈', { usedIds: used, dayLabel: 'Day1' });
    const c = resolvePlanSpotImage('华强北数码市井', { usedIds: used, dayLabel: 'Day2' });
    expect(a?.src).toContain('nanshan-tech.jpg');
    expect(b?.src).toContain('coast-city.jpg');
    expect(c?.src).toContain('huaqiangbei.jpg');
  });

  it('kit city cover uses exclusive city-kit path', () => {
    const cover = resolvePlanCoverImage({
      intro: '去杭州近郊慢行',
      itinerary: '西湖绿道',
      initialQuery: '杭州两日',
    });
    expect(cover?.src).toContain('/city-kit/hangzhou/cover.jpg');
  });

  it('kit spot title maps to local photo', () => {
    const img = resolvePlanSpotImage('西湖绿道', {
      context: '杭州近郊慢行',
      usedIds: new Set(),
    });
    expect(img?.src).toContain('/city-kit/hangzhou/spot-westlake.jpg');
  });

  it('unmatched title returns null (no shared fallback)', () => {
    expect(resolvePlanSpotImage('漫行小站', { context: '未知城市' })).toBeNull();
  });
});
