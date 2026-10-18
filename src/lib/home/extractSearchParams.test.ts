import { describe, expect, it } from 'vitest';
import { extractSearchParams } from '@/lib/home/extractSearchParams';

const EMPTY = {
  startCity: undefined,
  targetCity: undefined,
  days: undefined,
  peopleType: undefined,
  budget: undefined,
  theme: undefined,
};

describe('extractSearchParams 环节2验收', () => {
  it('测试1：济南情侣青岛3天人均4000美食探店', () => {
    expect(extractSearchParams('济南情侣青岛3天人均4000美食探店')).toEqual({
      startCity: '济南历下绿城百合花园',
      targetCity: '青岛',
      days: 3,
      peopleType: '情侣',
      budget: 4000,
      theme: '美食探店',
    });
  });

  it('测试2：济南出发杭州3天山水游，人均1950', () => {
    expect(extractSearchParams('济南出发杭州3天山水游，人均1950')).toEqual({
      startCity: '济南历下绿城百合花园',
      targetCity: '杭州',
      days: 3,
      peopleType: undefined,
      budget: 1950,
      theme: '山水徒步',
    });
  });

  it('测试3：去杭州玩3天', () => {
    expect(extractSearchParams('去杭州玩3天')).toEqual({
      ...EMPTY,
      targetCity: '杭州',
      days: 3,
    });
  });

  it('完整句：6 个字段都能抽出，住宿站名不当目的地', () => {
    expect(extractSearchParams('济南情侣杭州3天山水游，人均1950，住西溪湿地北站')).toEqual({
      startCity: '济南历下绿城百合花园',
      targetCity: '杭州',
      days: 3,
      peopleType: '情侣',
      budget: 1950,
      theme: '山水徒步',
    });
  });

  it('环节3前置：去杭州玩 / 情侣去青岛 / 去玩', () => {
    expect(extractSearchParams('去杭州玩')).toEqual({
      ...EMPTY,
      targetCity: '杭州',
    });
    expect(extractSearchParams('从济南去上海玩三天，好友结伴')).toMatchObject({
      startCity: '济南历下绿城百合花园',
      targetCity: '上海',
      days: 3,
      peopleType: '好友结伴',
    });
    expect(extractSearchParams('情侣去青岛')).toEqual({
      ...EMPTY,
      targetCity: '青岛',
      peopleType: '情侣',
    });
    expect(extractSearchParams('去玩')).toEqual(EMPTY);
  });

  it('支持三天、2晚3天、两大一小、看海', () => {
    expect(extractSearchParams('去苏州玩三天两大一小看海')).toEqual({
      ...EMPTY,
      targetCity: '苏州',
      days: 3,
      peopleType: '亲子',
      theme: '山水徒步',
    });
    expect(extractSearchParams('北京2晚3天古迹')).toMatchObject({
      targetCity: '北京',
      days: 3,
      theme: '古迹观光',
    });
    expect(extractSearchParams('重庆周末3天')).toMatchObject({
      targetCity: '重庆',
      days: 3,
      theme: '节假日分流',
    });
    expect(extractSearchParams('明天有雨去武汉')).toMatchObject({
      targetCity: '武汉',
      theme: '雨天改线',
    });
  });
});
