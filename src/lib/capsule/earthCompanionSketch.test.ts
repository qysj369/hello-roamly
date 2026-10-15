import { describe, expect, it } from 'vitest';
import {
  buildCompanionSketchMessages,
  sanitizeCompanionSketchText,
} from '@/lib/capsule/earthCompanionSketch';

describe('earthCompanionSketch', () => {
  it('asks for a realistic companion trip without booking or scenery hype', () => {
    const { system, user } = buildCompanionSketchMessages(
      '巴黎',
      '塞纳河把巴黎分成两岸：一边是行政中心和19世纪林荫道，一边是普通街区与博物馆。',
    );
    expect(system).toContain('结伴');
    expect(system).toMatch(/酒店|票务|组团/);
    expect(system).toContain('写实');
    expect(system).toContain('人文');
    expect(system).not.toContain('轻松治愈');
    expect(user).toContain('巴黎');
    expect(user).toContain('2-3天');
    expect(user).toContain('塞纳河');
    expect(user).toMatch(/酒店|门票|组团/);
  });

  it('strips markdown fences from model output', () => {
    expect(sanitizeCompanionSketchText('```md\n**Day1** 河边走走\n```')).toBe('Day1 河边走走');
  });
});
