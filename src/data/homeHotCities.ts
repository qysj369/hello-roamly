export type HomeHotCity = {
  id: string;
  label: string;
  query: string;
  days: string;
  budget: string;
  tags: readonly string[];
};

/** 首页热门城市（与顾问页首行 12 城对齐） */
export const homeHotCities: readonly HomeHotCity[] = [
  {
    id: 'xian',
    label: '西安',
    query: '西安 三天 1500',
    days: '3 天',
    budget: '约 ¥1480',
    tags: ['兵马俑', '城墙', '硬壳穷游'],
  },
  {
    id: 'chengdu',
    label: '成都',
    query: '成都 三天 1200',
    days: '3 天',
    budget: '约 ¥1200',
    tags: ['熊猫', '火锅', '慢游'],
  },
  {
    id: 'chongqing',
    label: '重庆',
    query: '重庆 三天 1000',
    days: '3 天',
    budget: '约 ¥980',
    tags: ['洪崖洞', '轻轨', '夜景'],
  },
  {
    id: 'hangzhou',
    label: '杭州',
    query: '杭州 三天 1300',
    days: '3 天',
    budget: '约 ¥1300',
    tags: ['西湖', '江南', '骑行'],
  },
  {
    id: 'nanjing',
    label: '南京',
    query: '南京 三天 1100',
    days: '3 天',
    budget: '约 ¥1100',
    tags: ['夫子庙', '秦淮河', '民国'],
  },
  {
    id: 'suzhou',
    label: '苏州',
    query: '苏州 三天 1200',
    days: '3 天',
    budget: '约 ¥1180',
    tags: ['拙政园', '园林', '水乡'],
  },
  {
    id: 'xiamen',
    label: '厦门',
    query: '厦门 四天 1500',
    days: '4 天',
    budget: '约 ¥1520',
    tags: ['鼓浪屿', '海边', '拍照'],
  },
  {
    id: 'qingdao',
    label: '青岛',
    query: '青岛 三天 1200',
    days: '3 天',
    budget: '约 ¥1200',
    tags: ['栈桥', '啤酒', '海滨'],
  },
  {
    id: 'dali',
    label: '大理',
    query: '大理 四天 1400',
    days: '4 天',
    budget: '约 ¥1400',
    tags: ['洱海', '古城', '慢游'],
  },
  {
    id: 'jinan',
    label: '济南',
    query: '济南 三天 900',
    days: '3 天',
    budget: '约 ¥900',
    tags: ['趵突泉', '泉水', '周末'],
  },
  {
    id: 'yangzhou',
    label: '扬州',
    query: '扬州 两天 800',
    days: '2 天',
    budget: '约 ¥780',
    tags: ['瘦西湖', '早茶', '慢游'],
  },
  {
    id: 'changsha',
    label: '长沙',
    query: '长沙 三天 1000',
    days: '3 天',
    budget: '约 ¥1000',
    tags: ['橘子洲', '湘菜', '夜生活'],
  },
] as const;

export const HOME_HOT_CITY_COUNT = homeHotCities.length;
