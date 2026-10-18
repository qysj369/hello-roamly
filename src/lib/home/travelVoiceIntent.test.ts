import { describe, expect, it } from 'vitest';
import {
  TRAVEL_VOICE_FOLLOWUP,
  TRAVEL_VOICE_REFUSAL,
  buildTravelVoiceReply,
  classifyTravelVoiceIntent,
} from '@/lib/home/travelVoiceIntent';

describe('classifyTravelVoiceIntent', () => {
  it('rejects non-travel chit-chat with the fixed assistant line', () => {
    expect(classifyTravelVoiceIntent('今天股市怎么样')).toBe('reject');
    expect(classifyTravelVoiceIntent('帮我写作业')).toBe('reject');
    expect(classifyTravelVoiceIntent('讲个笑话')).toBe('reject');
    expect(classifyTravelVoiceIntent('讲个旅游笑话')).toBe('reject');
    expect(classifyTravelVoiceIntent('你好')).toBe('reject');
    expect(classifyTravelVoiceIntent('上海股市怎么样')).toBe('reject');
    expect(TRAVEL_VOICE_REFUSAL).toBe(
      '我是蜗牛旅行专属语音助手，仅能解答旅行出游相关问题，你可以告诉我想去的城市、出行人数，我为你整理游玩灵感',
    );
  });

  it('allows travel planning, edits, food, transit and party styles', () => {
    expect(classifyTravelVoiceIntent('去杭州玩三天')).toBe('travel');
    expect(classifyTravelVoiceIntent('三天')).toBe('travel');
    expect(classifyTravelVoiceIntent('改成亲子')).toBe('travel');
    expect(classifyTravelVoiceIntent('改成三天')).toBe('travel');
    expect(classifyTravelVoiceIntent('成都有什么美食')).toBe('travel');
    expect(classifyTravelVoiceIntent('地铁怎么走比较松弛')).toBe('travel');
    expect(classifyTravelVoiceIntent('单人短途避坑')).toBe('travel');
    expect(classifyTravelVoiceIntent('情侣怎么玩比较松')).toBe('travel');
    expect(classifyTravelVoiceIntent('下雨怎么走')).toBe('travel');
    expect(classifyTravelVoiceIntent('人多怎么走')).toBe('travel');
    expect(classifyTravelVoiceIntent('发给朋友')).toBe('travel');
    expect(classifyTravelVoiceIntent('少走路')).toBe('travel');
  });

  it('detects Xiaohongshu and Douyin export commands', () => {
    expect(classifyTravelVoiceIntent('生成小红书图文')).toBe('export-xhs');
    expect(classifyTravelVoiceIntent('导出抖音短视频素材')).toBe('export-douyin');
    expect(classifyTravelVoiceIntent('做一张微信海报')).toBe('export-wechat');
  });

  it('appends a travel follow-up and strips budgets or links from spoken replies', () => {
    const spoken = buildTravelVoiceReply('西湖先停一停。人均1210元 https://helloroamly.com Day 2 完整攻略');
    expect(spoken).toContain('西湖先停一停');
    expect(spoken).toContain(TRAVEL_VOICE_FOLLOWUP);
    expect(spoken).not.toContain('1210');
    expect(spoken).not.toContain('helloroamly.com');
    expect(spoken).not.toContain('Day 2');
    expect(spoken).not.toContain('完整攻略');
  });
});
