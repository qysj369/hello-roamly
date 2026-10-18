import { describe, expect, it } from 'vitest';
import { parseTravelAgentIntent, shouldRouteToTravelAgent } from '@/lib/agent/parseTravelAgentIntent';

describe('parseTravelAgentIntent', () => {
  it('routes site tools from one sentence', () => {
    expect(parseTravelAgentIntent('帮我保存行程', true)).toEqual({ type: 'save' });
    expect(parseTravelAgentIntent('生成海报', true)).toEqual({ type: 'poster' });
    expect(parseTravelAgentIntent('确认行程，生成图文资产包', true)).toEqual({ type: 'poster' });
    expect(parseTravelAgentIntent('复制分享链接', true)).toEqual({ type: 'copy_link' });
    expect(parseTravelAgentIntent('发给朋友', true)).toEqual({ type: 'share' });
    expect(parseTravelAgentIntent('发微信', true)).toEqual({ type: 'share' });
    expect(parseTravelAgentIntent('重新核算预算', true)).toEqual({ type: 'edit_budget', mode: 'recalc' });
    expect(parseTravelAgentIntent('预算降低怎么改', true)).toEqual({ type: 'edit_budget', mode: 'down' });
  });

  it('keeps questions as ask instead of switching party', () => {
    expect(parseTravelAgentIntent('这条路线适合亲子吗？', true)).toEqual({ type: 'ask' });
  });

  it('switches party locally when asked', () => {
    expect(parseTravelAgentIntent('改成亲子', true)).toEqual({ type: 'edit_party', peopleType: '亲子' });
    expect(parseTravelAgentIntent('带娃走', true)).toEqual({ type: 'edit_party', peopleType: '亲子' });
    expect(parseTravelAgentIntent('换成情侣版', true)).toEqual({ type: 'edit_party', peopleType: '情侣' });
  });

  it('routes rollback, reset and day edits', () => {
    expect(parseTravelAgentIntent('回退上一版', true)).toEqual({ type: 'rollback' });
    expect(parseTravelAgentIntent('重置偏好', true)).toEqual({ type: 'reset_preference' });
    expect(parseTravelAgentIntent('改成2天', true)).toEqual({ type: 'edit_days', days: 2 });
    expect(parseTravelAgentIntent('这次按亲子，别改习惯', true)).toEqual({
      type: 'edit_party',
      peopleType: '亲子',
      temporary: true,
    });
    expect(parseTravelAgentIntent('去掉外滩', true)).toEqual({
      type: 'edit_spots',
      action: 'remove',
      name: '外滩',
    });
    expect(parseTravelAgentIntent('补充景点详情', true)).toEqual({ type: 'edit_spots', action: 'enrich' });
    expect(parseTravelAgentIntent('增加本地美食', true)).toEqual({ type: 'edit_foods' });
    expect(parseTravelAgentIntent('完善出行交通', true)).toEqual({ type: 'edit_traffic' });
    expect(parseTravelAgentIntent('下雨怎么走', true)).toEqual({ type: 'edit_rain' });
    expect(parseTravelAgentIntent('明天有雨', true)).toEqual({ type: 'edit_rain' });
    expect(parseTravelAgentIntent('人多怎么走', true)).toEqual({ type: 'edit_holiday' });
    expect(parseTravelAgentIntent('节假日怎么走', true)).toEqual({ type: 'edit_holiday' });
  });

  it('treats a complete new trip as generate', () => {
    expect(parseTravelAgentIntent('上海3天好友结伴', true)).toEqual({ type: 'generate' });
    expect(parseTravelAgentIntent('上海3天好友结伴', false)).toEqual({ type: 'generate' });
  });

  it('routes edits and share to the butler, new trips stay on search', () => {
    expect(shouldRouteToTravelAgent('下雨怎么走', true)).toBe(true);
    expect(shouldRouteToTravelAgent('发给朋友', true)).toBe(true);
    expect(shouldRouteToTravelAgent('适合亲子吗？', true)).toBe(true);
    expect(shouldRouteToTravelAgent('杭州3天亲子', false)).toBe(false);
    expect(shouldRouteToTravelAgent('杭州3天亲子', true)).toBe(false);
  });
});
