import { describe, expect, it } from 'vitest';
import { isAllowedWechatJsUrl, signWechatJsConfig } from '../../../server/lib/wechatJsSdk';

describe('wechat JS-SDK signature', () => {
  it('signs the official jsapi string', () => {
    expect(signWechatJsConfig('ticket', 'https://helloroamly.com/', 'nonce', 1710000000)).toMatch(
      /^[a-f0-9]{40}$/,
    );
  });

  it('only signs this site or local pages', () => {
    expect(isAllowedWechatJsUrl('https://helloroamly.com/')).toBe(true);
    expect(isAllowedWechatJsUrl('http://127.0.0.1:5174/?share=1')).toBe(true);
    expect(isAllowedWechatJsUrl('https://evil.example/steal')).toBe(false);
  });
});
