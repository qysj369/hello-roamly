import { describe, expect, it } from 'vitest';
import { collectSitemapEntries } from '@/lib/seo/sitemap';
import { listTravelKnowledgeArticles, TRAVEL_KNOWLEDGE_PILLARS } from '@/lib/seo/travelKnowledgeBase';
import { paths } from '@/router/paths';
import { BANNED_ECOMMERCE_WORDS } from '@/lib/config/productPositioning';

describe('travel knowledge base', () => {
  it('covers weekend, solo and family long-tails plus city weekend pages', () => {
    expect(TRAVEL_KNOWLEDGE_PILLARS.map((item) => item.id)).toEqual(['weekend', 'solo', 'family']);
    const articles = listTravelKnowledgeArticles();
    const text = JSON.stringify(articles);
    expect(text).toContain('城市周末漫游');
    expect(text).toContain('单人短途旅行灵感');
    expect(text).toContain('亲子出游思路');
    expect(text).toContain('杭州周末漫游');
    for (const word of BANNED_ECOMMERCE_WORDS) {
      expect(text).not.toContain(word);
    }
  });

  it('puts the knowledge library and legal pages on the sitemap', () => {
    const listed = collectSitemapEntries().map((entry) => entry.path);
    expect(listed).toContain(paths.inspire);
    expect(listed).toContain(paths.mp);
    expect(listed).toContain(paths.privacy);
    expect(listed).toContain(paths.feedback);
  });
});
