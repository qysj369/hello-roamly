import { describe, expect, it } from 'vitest';
import { buildTravelKnowledgeJsonLd } from '@/lib/seo/jsonLd/travelKnowledgeJsonLd';

describe('buildTravelKnowledgeJsonLd', () => {
  it('exposes weekend, solo and family travel long-tails without booking offers', () => {
    const json = JSON.stringify(buildTravelKnowledgeJsonLd());
    expect(json).toContain('周末漫游');
    expect(json).toContain('单人短途');
    expect(json).toContain('亲子出游');
    expect(json).toContain('/inspire');
    expect(json).toContain('杭州周末漫游');
    expect(json).toContain('"@type":"Article"');
    expect(json).not.toContain('"@type":"Offer"');
    expect(json).not.toContain('特惠');
  });
});
