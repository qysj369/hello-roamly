import type { AiTravelParams } from '@/types/domain/aiTravelParams';

export type AiChatHotCity = {
  id: string;
  name: string;
};

/** 顾问页底部首行：单行展示的热门城市 */
export const AI_CHAT_FEATURED_CITIES: AiChatHotCity[] = [
  { id: 'beijing', name: '北京' },
  { id: 'shanghai', name: '上海' },
  { id: 'xian', name: '西安' },
  { id: 'chengdu', name: '成都' },
  { id: 'chongqing', name: '重庆' },
  { id: 'hangzhou', name: '杭州' },
  { id: 'qingdao', name: '青岛' },
];

/** 点「更多」后展开的城市（按区域大致排序，可继续扩充） */
export const AI_CHAT_MORE_CITIES: AiChatHotCity[] = [
  { id: 'nanjing', name: '南京' },
  { id: 'suzhou', name: '苏州' },
  { id: 'xiamen', name: '厦门' },
  { id: 'dali', name: '大理' },
  { id: 'jinan', name: '济南' },
  { id: 'yangzhou', name: '扬州' },
  { id: 'changsha', name: '长沙' },
  // 华北东北
  { id: 'tianjin', name: '天津' },
  { id: 'qinhuangdao', name: '秦皇岛' },
  { id: 'chengde', name: '承德' },
  { id: 'datong', name: '大同' },
  { id: 'pingyao', name: '平遥' },
  { id: 'taiyuan', name: '太原' },
  { id: 'hohhot', name: '呼和浩特' },
  { id: 'harbin', name: '哈尔滨' },
  { id: 'changchun', name: '长春' },
  { id: 'shenyang', name: '沈阳' },
  { id: 'dalian', name: '大连' },
  { id: 'dandong', name: '丹东' },
  // 华东
  { id: 'wuxi', name: '无锡' },
  { id: 'ningbo', name: '宁波' },
  { id: 'wenzhou', name: '温州' },
  { id: 'jiaxing', name: '嘉兴' },
  { id: 'shaoxing', name: '绍兴' },
  { id: 'wuyuan', name: '婺源' },
  { id: 'huangshan', name: '黄山' },
  { id: 'mount-lu', name: '庐山' },
  { id: 'fuzhou', name: '福州' },
  { id: 'xiamen-gulangyu', name: '鼓浪屿' },
  { id: 'quanzhou', name: '泉州' },
  { id: 'wuyishan', name: '武夷山' },
  { id: 'weihai', name: '威海' },
  { id: 'yantai', name: '烟台' },
  { id: 'taishan', name: '泰山' },
  { id: 'qufu', name: '曲阜' },
  { id: 'luoyang', name: '洛阳' },
  { id: 'kaifeng', name: '开封' },
  { id: 'zhengzhou', name: '郑州' },
  // 华中华南
  { id: 'wuhan', name: '武汉' },
  { id: 'yichang', name: '宜昌' },
  { id: 'zhangjiajie', name: '张家界' },
  { id: 'fenghuang', name: '凤凰' },
  { id: 'changde', name: '常德' },
  { id: 'nanchang', name: '南昌' },
  { id: 'jingdezhen', name: '景德镇' },
  { id: 'guangzhou', name: '广州' },
  { id: 'shenzhen', name: '深圳' },
  { id: 'zhuhai', name: '珠海' },
  { id: 'shantou', name: '汕头' },
  { id: 'chaozhou', name: '潮州' },
  { id: 'guilin', name: '桂林' },
  { id: 'yangshuo', name: '阳朔' },
  { id: 'beihai', name: '北海' },
  { id: 'sanya', name: '三亚' },
  { id: 'haikou', name: '海口' },
  // 西南西北
  { id: 'chengdu-leshan', name: '乐山' },
  { id: 'emei', name: '峨眉山' },
  { id: 'jiuzhaigou', name: '九寨沟' },
  { id: 'kunming', name: '昆明' },
  { id: 'tengchong', name: '腾冲' },
  { id: 'lijiang', name: '丽江' },
  { id: 'shangrila', name: '香格里拉' },
  { id: 'xishuangbanna', name: '西双版纳' },
  { id: 'guiyang', name: '贵阳' },
  { id: 'zunyi', name: '遵义' },
  { id: 'chongqing-wulong', name: '武隆' },
  { id: 'lanzhou', name: '兰州' },
  { id: 'dunhuang', name: '敦煌' },
  { id: 'zhangye', name: '张掖' },
  { id: 'xining', name: '西宁' },
  { id: 'lhasa', name: '拉萨' },
  { id: 'urumqi', name: '乌鲁木齐' },
  { id: 'kashgar', name: '喀什' },
  { id: 'yining', name: '伊犁' },
];

/** 顾问页首行 +「更多」展开的全部城市（去重） */
export const AI_CHAT_ALL_CITIES: AiChatHotCity[] = [
  ...AI_CHAT_FEATURED_CITIES,
  ...AI_CHAT_MORE_CITIES.filter(
    (city) => !AI_CHAT_FEATURED_CITIES.some((featured) => featured.name === city.name),
  ),
];

export function buildHotCityPlanPrompt(cityName: string, params: AiTravelParams): string {
  const trimmed = cityName.trim();
  return `帮我规划${trimmed}${params.days}天的穷游行程，预算${params.budgetMin}–${params.budgetMax}元，含交通、住宿和花费清单`;
}
