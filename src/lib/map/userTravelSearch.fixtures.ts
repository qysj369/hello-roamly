/**
 * 用户搜索解析黄金用例 — 新增/修改解析逻辑时必须全部通过。
 * 覆盖常见随意输入习惯，防止「修一个坏一个」。
 */
export type UserTravelSearchFixture = {
  input: string;
  primaryPlace: string | null;
  multiStops?: string[];
  days?: number | null;
  preferences?: string[];
};

export const USER_TRAVEL_SEARCH_FIXTURES: UserTravelSearchFixture[] = [
  { input: '西安 三天 1500', primaryPlace: '西安', days: 3 },
  { input: '扬州 三天 600元', primaryPlace: '扬州', days: 3 },
  { input: '济南 美食 四天', primaryPlace: '济南', days: 4, preferences: ['美食'] },
  { input: '成都 火锅 三天 1200', primaryPlace: '成都', days: 3, preferences: ['美食'] },
  { input: '开封亲子游四天', primaryPlace: '开封', days: 4, preferences: ['亲子'] },
  { input: '洛阳研学三天', primaryPlace: '洛阳', days: 3, preferences: ['研学'] },
  { input: '郑州 亲子 五天', primaryPlace: '郑州', days: 5, preferences: ['亲子'] },
  { input: '济南到莆田 三天 1500', primaryPlace: '莆田', days: 3 },
  { input: '从济南去成都吃火锅', primaryPlace: '成都', preferences: ['美食'] },
  { input: '济南飞成都 三天 1200', primaryPlace: '成都', days: 3 },
  {
    input: '曲阜微山湖台儿庄三日游预算1500',
    primaryPlace: '曲阜',
    multiStops: ['曲阜', '微山湖', '台儿庄'],
    days: 3,
  },
  {
    input: '周村古城青州潍坊四天游自驾',
    primaryPlace: '周村古城',
    multiStops: ['周村古城', '青州', '潍坊'],
    days: 4,
  },
  {
    input: '从济南历下区去曲阜微山湖台儿庄三天1500',
    primaryPlace: '曲阜',
    multiStops: ['曲阜', '微山湖', '台儿庄'],
    days: 3,
  },
  { input: '成都', primaryPlace: '成都' },
  { input: '去大理', primaryPlace: '大理' },
  { input: '想去厦门', primaryPlace: '厦门' },
  {
    input: '大理 摄影 漫行 2000',
    primaryPlace: '大理',
    preferences: ['摄影打卡', '省钱优先'],
  },
  { input: '青岛 海鲜 露营 三天', primaryPlace: '青岛', days: 3, preferences: ['露营'] },
  { input: '扬州镇江溧阳三天游，预算600元', primaryPlace: '扬州', multiStops: ['扬州', '镇江', '溧阳'], days: 3 },
  { input: '山东省济宁市曲阜市', primaryPlace: '曲阜' },
  {
    input: '苏杭三日游',
    primaryPlace: '苏州',
    multiStops: ['苏州', '杭州'],
    days: 3,
  },
];

export const USER_TRAVEL_SEARCH_SYNC_RESOLVE_FIXTURES: { input: string; label: string }[] = [
  { input: '开封亲子游四天', label: '开封' },
  { input: '西安 三天 1500', label: '西安' },
  { input: '济南到莆田', label: '莆田' },
  { input: '成都', label: '成都' },
  { input: '曲阜微山湖台儿庄', label: '曲阜' },
];
