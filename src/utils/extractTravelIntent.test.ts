import { describe, expect, it } from 'vitest';
import { extractDaysFromPrompt, extractDestinationFromPrompt } from '@/utils/extractTravelIntent';

describe('extractTravelIntent', () => {
  it('extracts jinan and 3 days from home dream text', () => {
    const text = '我想去济南玩三天帮我规划一下省钱的行程';
    expect(extractDestinationFromPrompt(text)).toBe('济南');
    expect(extractDaysFromPrompt(text)).toBe(3);
  });
});
