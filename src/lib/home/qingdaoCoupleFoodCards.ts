export type QingdaoCoupleCardBlock = {
  label: string;
  body: string;
  address?: string;
  tips?: string[];
};

export type QingdaoCoupleDayCard = {
  id: string;
  title: string;
  lodging: string;
  blocks: QingdaoCoupleCardBlock[];
};

export function isQingdaoCoupleFoodCardPlan(
  initialQuery?: string | null,
  content?: string | null,
): boolean {
  const blob = `${initialQuery ?? ''}\n${content ?? ''}`;
  return /青岛/.test(blob) && /情侣/.test(blob) && /美食/.test(blob);
}

export const QINGDAO_COUPLE_FOOD_META = {
  eyebrow: '情侣青岛3日',
  subtitle: '出行：情侣｜人均预算4000｜全程住中山路/栈桥，不换酒店｜美食探店+老城松弛漫游',
};

export const QINGDAO_COUPLE_FOOD_DAYS: QingdaoCoupleDayCard[] = [
  {
    id: 'd1',
    title: '第1天 济南出发｜老城漫步·海鲜啤酒之夜',
    lodging: '今晚住宿片区：中山路/栈桥周边',
    blocks: [
      {
        label: '交通｜济南→青岛',
        body: '绿城百合花园步行至地铁3号线花园东路站，八涧堡换乘2号线到济南站北。高铁约1.5小时，优先青岛站，3号线一站到中山路寄存行李。',
        address: '花园东路站 → 济南站 → 青岛站 → 中山路站',
      },
      {
        label: '午餐｜春和楼',
        body: '百年鲁菜老店，创立于1891年。必点香酥鸡、九转大肠、海鲜疙瘩汤。双人约240元，人均80+。',
        address: '中山路146号',
      },
      {
        label: '午后｜老城免费打卡',
        body: '圣弥厄尔天主教堂石阶广场拍照，看欧式钟楼与云影；进堂以当日窗口为准。大学路、龙江路避开网红拐角，钻小巷逛涂鸦墙和旧书店，坡道牵手慢逛。',
        address: '浙江路天主教堂 · 大学路 / 龙江路',
      },
      {
        label: '傍晚｜栈桥看海',
        body: '走到回澜阁。红嘴鸥仅冬春季节大量出没，其余时段看海岸礁石即可。',
        address: '栈桥 / 回澜阁',
        tips: ['涨潮栈道湿滑，拍照留意脚下。'],
      },
      {
        label: '黄昏｜团岛市场海鲜加工',
        body: '市场自选梭子蟹、蛤蜊、扇贝，周边小店加工费约20–30元。现蒸现炒配本地啤酒。',
        address: '团岛农贸市场',
      },
      {
        label: '夜晚｜营口路啤酒屋',
        body: '露天小桌，野馄饨、烤鱿鱼配原浆扎啤，听街坊闲谈。',
        address: '营口路啤酒街',
        tips: [
          '奥帆游船请到官方窗口购票，不要路边黄牛。',
          '青岛啤酒博物馆（登州路56号）须公众号提前预约，16点停止检票。',
          '从青岛站返程预留2.5小时进站缓冲。',
        ],
      },
    ],
  },
  {
    id: 'd2',
    title: '第2天 信号山登高｜啤酒博物馆｜海边漫步',
    lodging: '今晚住宿片区：中山路/栈桥周边',
    blocks: [
      {
        label: '上午｜信号山公园',
        body: '登高旋转观景台，俯瞰红瓦绿树、碧海蓝天。门票计入预算。',
        address: '信号山公园',
      },
      {
        label: '中午–下午｜青岛啤酒博物馆',
        body: '了解啤酒历史，可品尝原浆与啤酒豆。',
        address: '登州路56号',
        tips: ['须官方公众号实名预约，每日16点停止检票入场。'],
      },
      {
        label: '傍晚｜八大关滨海散步',
        body: '万国建筑群外缘和海边步道慢慢走，看日落，步道免费，适合拍照。',
        address: '八大关 / 太平角外缘',
      },
    ],
  },
  {
    id: 'd3',
    title: '第3天 闲逛采购｜奥帆中心｜返程济南',
    lodging: '今晚住宿片区：返程回家，无需住宿',
    blocks: [
      {
        label: '上午｜奥帆中心',
        body: '看五四广场海岸线。若坐游船，只在奥帆官方售票窗口买票。',
        address: '奥帆中心官方售票窗口',
        tips: ['切勿轻信路边拉客黄牛低价揽客。'],
      },
      {
        label: '中午｜采购伴手礼',
        body: '选购海产干货、青岛啤酒周边。脂渣、流亭猪蹄可作伴手礼。',
      },
      {
        label: '下午｜返程',
        body: '下午14:00前动身取回行李前往青岛站，全程预留2.5小时充足缓冲，用于行李寄存、安检、候车。高铁回济南后，地铁公交回到绿城百合花园。',
        address: '青岛站',
      },
    ],
  },
];
