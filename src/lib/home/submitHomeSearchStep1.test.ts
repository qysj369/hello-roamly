import { describe, expect, it, vi } from 'vitest';
import {
  HOME_SEARCH_EMPTY_HINT,
  recordHomeSearchSubmit,
  validateHomeSearchInput,
} from '@/lib/home/submitHomeSearchStep1';

describe('validateHomeSearchInput', () => {
  it('rejects empty or whitespace-only input', () => {
    expect(validateHomeSearchInput('')).toEqual({ ok: false, hint: HOME_SEARCH_EMPTY_HINT });
    expect(validateHomeSearchInput('   ')).toEqual({ ok: false, hint: HOME_SEARCH_EMPTY_HINT });
  });

  it('keeps trimmed Chinese query for submit', () => {
    expect(validateHomeSearchInput('  青岛  ')).toEqual({ ok: true, query: '青岛' });
  });
});

describe('recordHomeSearchSubmit', () => {
  it('logs the query to the console', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.useFakeTimers();
    const pending = recordHomeSearchSubmit('济南情侣青岛3天');
    await vi.runAllTimersAsync();
    await pending;
    expect(info).toHaveBeenCalledWith('[home-search] submit', '济南情侣青岛3天');
    expect(info).toHaveBeenCalledWith('[home-search] extract', {
      startCity: '济南历下绿城百合花园',
      targetCity: '青岛',
      days: 3,
      peopleType: '情侣',
      budget: undefined,
      theme: undefined,
    });
    info.mockRestore();
    vi.useRealTimers();
  });
});
