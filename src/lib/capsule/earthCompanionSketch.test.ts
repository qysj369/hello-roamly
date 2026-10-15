import { describe, expect, it } from 'vitest';
import {
  buildCompanionSketchMessages,
  sanitizeCompanionSketchText,
} from '@/lib/capsule/earthCompanionSketch';

describe('earthCompanionSketch', () => {
  it('asks for a light companion trip without booking language', () => {
    const { system, user } = buildCompanionSketchMessages('巴黎');
    expect(system).toContain('结伴');
    expect(system).toMatch(/预订|下单/);
    expect(user).toContain('巴黎');
    expect(user).toContain('2-3天');
    expect(user).toContain('轻松治愈');
  });

  it('strips markdown fences from model output', () => {
    expect(sanitizeCompanionSketchText('```md\n**Day1** 河边走走\n```')).toBe('Day1 河边走走');
  });
});
