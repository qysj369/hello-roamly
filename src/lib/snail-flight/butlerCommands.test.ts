import { describe, expect, it } from 'vitest';
import {
  matchSnailFlightButler,
  SNAIL_FLIGHT_BUTLER_FALLBACK,
  SNAIL_FLIGHT_BUTLER_WELCOME,
  SNAIL_FLIGHT_PACK_NOTICE,
  SNAIL_FLIGHT_SCENE_CHIPS,
} from '@/lib/snail-flight/butlerCommands';
import { useFlightButlerStore } from '@/lib/snail-flight/flightButlerStore';

describe('snail-flight butler commands', () => {
  it('switches three caption packs from fuzzy phrases', () => {
    expect(matchSnailFlightButler('换回默认字幕', 0)?.packId).toBe('story');
    expect(matchSnailFlightButler('换回默认字幕', 0)?.message).toContain('人文画面主版本');
    expect(matchSnailFlightButler('字幕精简一点', 0)?.packId).toBe('verse');
    expect(matchSnailFlightButler('增加地理人文介绍', 0)?.packId).toBe('guide');
    expect(matchSnailFlightButler('切换科普叙事版', 0)?.message).toBe(
      SNAIL_FLIGHT_PACK_NOTICE.guide,
    );
    expect(matchSnailFlightButler('切换科普叙事版', 0)?.message).toContain('地理与人文解说');
  });

  it('only replies in text for speed and pause', () => {
    expect(matchSnailFlightButler('飞慢一点', 0.2)).toEqual({
      message: '收到，正在降低漫游速度。',
    });
    expect(matchSnailFlightButler('加快飞行速度', 0.2)).toEqual({
      message: '收到，正在提升漫游速度。',
    });
    expect(matchSnailFlightButler('暂停飞行', 0.2)?.message).toBe('漫游已暂停，你可以继续提问。');
    expect(matchSnailFlightButler('继续飞行', 0.2)?.message).toBe('漫游继续，我们向前出发。');
  });

  it('briefs the current region and lists route sights', () => {
    expect(matchSnailFlightButler('介绍当前这片区域', 0.36)?.message).toContain('淄博');
    expect(matchSnailFlightButler('介绍眼前这片区域', 0.36)?.message).toContain('淄博');
    expect(matchSnailFlightButler('这条路线沿途有什么景点', 0.1)?.message).toContain(
      '前方航线上还能看到',
    );
    expect(matchSnailFlightButler('前方还有哪些风景', 0.36)?.message).toContain('潍坊');
    expect(matchSnailFlightButler('帮我生成目的地行程', 0.9)?.message).toContain('八大关');
    expect(matchSnailFlightButler('帮我生成目的地行程', 0.9)?.message).toContain(
      '不含订票、组团服务',
    );
  });

  it('keeps a flight-only transcript instead of trip-planning chat', () => {
    useFlightButlerStore.getState().reset();
    expect(useFlightButlerStore.getState().messages[0]?.text).toBe(SNAIL_FLIGHT_BUTLER_WELCOME);
    useFlightButlerStore.getState().send('杭州3天亲子');
    const log = useFlightButlerStore.getState().messages.map((item) => item.text);
    expect(log.at(-1)).toBe(SNAIL_FLIGHT_BUTLER_FALLBACK);
    expect(log.join('')).not.toContain('杭州3天亲子。我来规划');
  });

  it('replies to flight scene chips without treating them as pack switches', () => {
    useFlightButlerStore.getState().reset();
    SNAIL_FLIGHT_SCENE_CHIPS.forEach((chip) => {
      expect(matchSnailFlightButler(chip.text, 0.1)?.message).toBeTruthy();
      useFlightButlerStore.getState().send(chip.text);
    });
    const log = useFlightButlerStore.getState().messages;
    expect(log.filter((item) => item.role === 'user')).toHaveLength(3);
    expect(
      log.filter((item) => item.role === 'assistant' && item.kind !== 'pack-switch'),
    ).toHaveLength(4);
    expect(log.at(-1)?.text).toContain('落地青岛');
    expect(log.filter((item) => item.kind === 'pack-switch')).toHaveLength(0);
  });

  it('keeps only the latest caption-pack notice and retains user lines', () => {
    useFlightButlerStore.getState().reset();
    useFlightButlerStore.getState().send('切换极简诗意版');
    useFlightButlerStore.getState().send('切换科普叙事版');
    const log = useFlightButlerStore.getState().messages;
    expect(log.filter((item) => item.role === 'user').map((item) => item.text)).toEqual([
      '切换极简诗意版',
      '切换科普叙事版',
    ]);
    const notices = log.filter((item) => item.kind === 'pack-switch');
    expect(notices).toHaveLength(1);
    expect(notices[0]?.text).toContain('科普轻叙事版');
    expect(
      log.filter((item) => item.text.includes('极简诗意版') && item.role === 'assistant'),
    ).toHaveLength(0);
  });
});
