import { describe, expect, it } from 'vitest';
import { isPlaceholderMapCredential, maskMapCredential, normalizeMapCredential } from '@/lib/map/credentials';

describe('map credentials', () => {
  it('treats example placeholders as unset', () => {
    expect(isPlaceholderMapCredential('粘贴你的Key')).toBe(true);
    expect(isPlaceholderMapCredential('pk.your_mapbox_public_token_here')).toBe(true);
    expect(normalizeMapCredential('粘贴你的Key')).toBeUndefined();
  });

  it('accepts real-looking keys', () => {
    const sample = 'e3767a6e995de0d27e5acdb3c419b5bf';
    expect(normalizeMapCredential(sample)).toBe(sample);
  });

  it('masks credentials for dev UI', () => {
    expect(maskMapCredential(undefined)).toBe('未配置');
    expect(maskMapCredential('abcd1234')).toBe('已配置 (…1234)');
  });
});
