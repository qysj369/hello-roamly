import { describe, expect, it } from 'vitest';
import { buildCityKnowledgePrompt, getCityTravelKnowledge } from '@/lib/agent/cityTravelKnowledge';

describe('cityTravelKnowledge', () => {
  it('locks Shanghai spots, signs and rain/holiday tips', () => {
    const shanghai = getCityTravelKnowledge('上海市');
    expect(shanghai?.foods.some((item) => item.shop === '沈大成')).toBe(true);
    expect(shanghai?.rainAlts.join('')).toContain('上海博物馆');
    expect(shanghai?.holidayAlts.join('')).toContain('北外滩');
    expect(shanghai?.transit).toContain('Metro大都会');
  });

  it('covers Hangzhou, Chengdu and Beijing rain alts', () => {
    expect(getCityTravelKnowledge('杭州市')?.rainAlts[0]).toContain('茶叶博物馆');
    expect(getCityTravelKnowledge('成都')?.foods.some((item) => item.shop === '陈麻婆豆腐')).toBe(true);
    expect(getCityTravelKnowledge('北京')?.rainAlts.join('')).toContain('国家博物馆');
    expect(getCityTravelKnowledge('西安')?.spots.some((spot) => spot.name.includes('城墙'))).toBe(true);
    expect(getCityTravelKnowledge('深圳')?.rainAlts[0]).toContain('深圳博物馆');
    expect(getCityTravelKnowledge('青岛市')?.holidayAlts.join('')).toContain('八大关');
    expect(getCityTravelKnowledge('苏州')?.foods.some((item) => item.shop === '黄天源')).toBe(true);
    expect(getCityTravelKnowledge('黄山')?.rainAlts[0]).toContain('博物馆');
    expect(getCityTravelKnowledge('泉州')?.foods.some((item) => item.dish === '牛肉羹')).toBe(true);
    expect(getCityTravelKnowledge('重庆市')?.rainAlts[0]).toContain('三峡博物馆');
    expect(getCityTravelKnowledge('大理')?.spots.some((spot) => spot.name.includes('洱海'))).toBe(true);
    expect(getCityTravelKnowledge('昆明')?.foods.some((item) => item.dish.includes('米线'))).toBe(true);
    expect(getCityTravelKnowledge('丽江')?.holidayAlts.join('')).toContain('束河');
    expect(getCityTravelKnowledge('长沙')?.rainAlts[0]).toContain('湖南省博物馆');
    expect(getCityTravelKnowledge('武汉')?.spots.some((spot) => spot.name.includes('东湖'))).toBe(true);
    expect(getCityTravelKnowledge('天津')?.holidayAlts.join('')).toContain('五大道');
    expect(getCityTravelKnowledge('拉萨')).toBeNull();
  });

  it('injects the knowledge block into the prompt', () => {
    const prompt = buildCityKnowledgePrompt('上海');
    expect(prompt).toContain('分层私有知识库');
    expect(prompt).toContain('动态时效库');
    expect(prompt).toContain('沈大成');
    expect(prompt).toContain('雨天替代');
  });
});
