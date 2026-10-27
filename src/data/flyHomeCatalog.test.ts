import { describe, expect, it } from 'vitest';
import { flyGlobalRoutes, flyHomeFares, flyJinanRoutes } from '@/data/flyHomeCatalog';
import { flyHomeCopy } from '@/i18n/flyHomeCopy';
import {
  FLY_HOME_OG_DESCRIPTION,
  FLY_HOME_OG_TITLE,
  FLY_HOME_SHARE_CARD_TITLE,
} from '@/lib/seo/pageSeoPresets';

const QUOTES = [
  '「泉，昼夜不停，老那么翻滚」——老舍《趵突泉的欣赏》',
  '「四面荷花三面柳，一城山色半城湖」',
  '「山是一城靠，佛在云里笑」',
  '「冬天更好，泉上起了一片热气」——老舍笔下济南的冬',
  '「九如听瀑，山不见我，我自去见山」',
] as const;

describe('flyHomeCatalog', () => {
  it('keeps global routes as covers without video', () => {
    expect(flyGlobalRoutes).toHaveLength(4);
    expect(flyGlobalRoutes.every((route) => route.image.endsWith('.jpg'))).toBe(true);
  });

  it('ships five Jinan flight clips with content links', () => {
    expect(flyJinanRoutes.map((route) => route.id)).toEqual([
      'baotu',
      'daming',
      'qianfo',
      'heihu',
      'jiuru',
    ]);
    expect(
      flyJinanRoutes.every(
        (route) =>
          route.video.split('?')[0].endsWith('.mp4') && route.href.startsWith('/fly-spots/'),
      ),
    ).toBe(true);
  });

  it('prints official fares from the data file', () => {
    expect(flyHomeCopy.zh.pp1).toContain(String(flyHomeFares.baotuNightYuan));
    expect(flyHomeCopy.zh.pp2).toContain(String(flyHomeFares.qianfoStudentYuan));
    expect(flyHomeCopy.en.pn4).toContain(String(flyHomeFares.chaoranStudentYuan));
    expect(flyHomeCopy.zh.footNote).toContain(flyHomeFares.source);
  });

  it('keeps the fly-home slogan and the five literary lines verbatim', () => {
    expect(flyHomeCopy.zh.slogan).toBe('极简于心，方能致远 · 逐梦星河，万千世界');
    expect([
      flyHomeCopy.zh.jk1,
      flyHomeCopy.zh.jk2,
      flyHomeCopy.zh.jk3,
      flyHomeCopy.zh.jk4,
      flyHomeCopy.zh.jk5,
    ]).toEqual(['趵突泉', '大明湖', '千佛山', '黑虎泉', '九如山']);
    expect([
      flyHomeCopy.zh.jd1,
      flyHomeCopy.zh.jd2,
      flyHomeCopy.zh.jd3,
      flyHomeCopy.zh.jd4,
      flyHomeCopy.zh.jd5,
    ]).toEqual([...QUOTES]);
    expect(flyHomeCopy.zh.jp1).toBe('济南 · 山东 · 天下第一泉 · 5A');
    expect(flyHomeCopy.zh.jp2).toBe('济南 · 山东 · 众泉汇流 · 环湖免费');
    expect(flyHomeCopy.zh.jp3).toBe('济南 · 山东 · 舜耕历山 · 登高远眺');
    expect(flyHomeCopy.zh.jp4).toBe('济南 · 山东 · 环城公园 · 免费取水');
    expect(flyHomeCopy.zh.jp5).toBe('济南 · 山东 · 瀑布群 · 山野慢行');
  });

  it('keeps the share card title inside 36 characters and one 375px line', () => {
    expect(FLY_HOME_OG_TITLE).toBe('蜗牛旅行 · 飞遍济南的冬天');
    expect(FLY_HOME_OG_DESCRIPTION).toBe(
      '趵突泉、黑虎泉、大明湖、千佛山、九如山——跟着老舍的笔，慢飞一次泉城。',
    );
    expect(FLY_HOME_SHARE_CARD_TITLE).toBe(FLY_HOME_OG_DESCRIPTION.slice(0, 36));
    expect(FLY_HOME_SHARE_CARD_TITLE.length).toBeLessThanOrEqual(36);
    expect(FLY_HOME_OG_TITLE.length).toBeLessThanOrEqual(36);

    const title = document.createElement('div');
    title.textContent = FLY_HOME_OG_TITLE;
    title.style.cssText = 'width:375px;white-space:nowrap;font-size:16px;font-family:sans-serif';
    document.body.appendChild(title);
    expect(title.scrollWidth).toBeLessThanOrEqual(375);
    title.remove();
  });
});
