import type { TravelPlanActivity } from '@/types/domain/travelPlan';

export type CityActivitySeed = {
  time: string;
  description: string;
  location: string;
  costWeight: number;
};

export type CityDaySeed = {
  title: string;
  activities: CityActivitySeed[];
};

/** 演示模式：部分城市的按日行程要点（无 DeepSeek 时） */
const CITY_DAY_SEEDS: Record<string, CityDaySeed[]> = {
  济南: [
    {
      title: '泉城核心 · 趵突泉与老城',
      activities: [
        {
          time: '09:00',
          description:
            '趵突泉公园晨游：建议 8:30 前到南门，避开旅行团高峰。重点看趵突泉、李清照纪念堂；园内步行约 2 小时。门票约 ¥40，可现场购票。',
          location: '历下区趵突泉南路 · 趵突泉公园',
          costWeight: 0.35,
        },
        {
          time: '12:30',
          description:
            '芙蓉街 / 宽厚里午餐：步行或公交至泉城路商圈。推荐把子肉、甜沫、油旋；人均 ¥35–50，避开 12:00–13:00 排队高峰。',
          location: '历下区芙蓉街 · 小吃街',
          costWeight: 0.25,
        },
        {
          time: '15:00',
          description:
            '泉城广场 → 黑虎泉一线：免费步行游览，黑虎泉可接泉水（带空瓶）。傍晚可看音乐喷泉（季节开放，以现场公告为准）。',
          location: '历下区泉城路 · 泉城广场',
          costWeight: 0.1,
        },
        {
          time: '19:30',
          description:
            '解放阁夜景 + 环城公园散步：沿护城河步行，灯光夜景适合拍照。晚餐可在附近简餐解决。',
          location: '历下区环城公园 · 解放阁',
          costWeight: 0.3,
        },
      ],
    },
    {
      title: '大明湖与老城街巷',
      activities: [
        {
          time: '09:00',
          description:
            '大明湖免费开放区：从西南门进，沿湖步行至北极阁。可租自行车环湖（约 ¥20/小时）。若想登超然楼需另购联票。',
          location: '历下区大明湖路 · 大明湖景区',
          costWeight: 0.2,
        },
        {
          time: '12:30',
          description:
            '曲水亭街 / 百花洲：老济南胡同拍照，咖啡与小馆集中。午餐可选鲁菜小馆，人均 ¥50 左右。',
          location: '历下区曲水亭街 · 历史街区',
          costWeight: 0.3,
        },
        {
          time: '15:00',
          description:
            '山东省博物馆（免费，需预约）：适合雨天备选，看青铜器和汉代文物。地铁 2 号线「二环东路」站步行约 10 分钟。',
          location: '历下区经十路 · 山东省博物馆',
          costWeight: 0.15,
        },
        {
          time: '19:30',
          description:
            '洪家楼天主教堂夜景或回泉城路商圈：教堂外观免费参观；结束可在恒隆广场周边休息。',
          location: '历城区洪家楼 · 天主教堂',
          costWeight: 0.35,
        },
      ],
    },
    {
      title: '千佛山与返程整理',
      activities: [
        {
          time: '09:00',
          description:
            '千佛山公园：索道或步行上山，俯瞰济南全城。门票约 ¥30，周末建议早到。下山后可在山脚下简餐。',
          location: '历下区经十一路 · 千佛山',
          costWeight: 0.4,
        },
        {
          time: '12:30',
          description:
            '英雄山文化市场 / 周边午餐：可淘旧书与小物件；适合作为离开前的轻松一站。',
          location: '市中区英雄山路 · 文化市场',
          costWeight: 0.25,
        },
        {
          time: '15:00',
          description:
            '采购伴手礼：推荐福胶、平阴玫瑰、把子肉真空装等。可在超市或老字号门店集中购买，控制行李重量。',
          location: '历下区泉城路 · 商业区',
          costWeight: 0.35,
        },
      ],
    },
  ],
  银川: [
    {
      title: '银川市区文化探索',
      activities: [
        {
          time: '09:00',
          description:
            '宁夏博物馆（免费，需预约）：重点看西夏历史与回族文化展，建议 2 小时。地铁 1 号线「人民广场」站步行 8 分钟。',
          location: '金凤区人民广场东街 · 宁夏博物馆',
          costWeight: 0.1,
        },
        {
          time: '12:00',
          description:
            '鼓楼 / 玉皇阁老城午餐：推荐羊肉搓面、烩小吃；人均 ¥30–45，老城步行即可串联。',
          location: '兴庆区解放西街 · 鼓楼商圈',
          costWeight: 0.25,
        },
        {
          time: '15:00',
          description:
            '承天寺塔 + 南门广场：免费外观参观，适合拍照；可顺路逛南薰门老街小店。',
          location: '兴庆区南门广场 · 承天寺塔',
          costWeight: 0.15,
        },
        {
          time: '19:00',
          description:
            '怀远夜市：小吃集中，推荐辣糊糊、烤羊肉串、八宝茶；控制人均 ¥40 左右。',
          location: '西夏区怀远路 · 怀远夜市',
          costWeight: 0.5,
        },
      ],
    },
    {
      title: '贺兰山岩画 · 镇北堡影城',
      activities: [
        {
          time: '08:30',
          description:
            '贺兰山岩画：包车或旅游专线约 1 小时；看史前岩画与贺兰口风光，门票约 ¥70，穿防滑鞋。',
          location: '贺兰县贺兰山 · 贺兰山岩画',
          costWeight: 0.45,
        },
        {
          time: '13:30',
          description:
            '镇北堡西部影城：下午光线适合拍照，《大话西游》取景地；门票约 ¥80，园内简餐人均 ¥40。',
          location: '西夏区镇北堡 · 西部影城',
          costWeight: 0.4,
        },
        {
          time: '18:30',
          description:
            '返回市区晚餐：建议兴庆区新华街周边，早回休息为次日留力。',
          location: '兴庆区新华东街 · 商业区',
          costWeight: 0.15,
        },
      ],
    },
    {
      title: '沙湖 / 水洞沟（轻松收尾）',
      activities: [
        {
          time: '09:00',
          description:
            '水洞沟遗址（可选）：史前遗址 + 藏兵洞，适合对历史感兴趣者；距市区约 40 分钟车程。',
          location: '灵武市 · 水洞沟旅游区',
          costWeight: 0.5,
        },
        {
          time: '14:00',
          description:
            '市区伴手礼：枸杞、八宝茶、羊绒小件；超市或老字号集中采购，注意行李重量。',
          location: '金凤区正源北街 · 商业区',
          costWeight: 0.3,
        },
        {
          time: '17:00',
          description:
            '提前到火车站/机场：银川站地铁可达，机场大巴建议预留 2 小时提前量。',
          location: '银川 · 交通枢纽',
          costWeight: 0.2,
        },
      ],
    },
  ],
};

function buildGenericDaySeed(destination: string, day: number, interestLabel: string): CityDaySeed {
  const dayHints = [
    `抵达 ${destination}：办理入住，熟悉地铁/公交；傍晚逛最近商圈，确认次日交通。`,
    `核心景点日：上午排 1 个必去景点，下午 1 个街区步行，留 1 小时弹性拍照。`,
    `轻松收尾：补漏打卡、伴手礼、提前查返程车次/航班。`,
  ];
  const titles = [
    `${destination} · 抵达与初探`,
    `${destination} · 第 ${day} 天深度游`,
    `${destination} · 返程前整理`,
  ];

  return {
    title: titles[Math.min(day - 1, titles.length - 1)] ?? `${destination} · 第 ${day} 天`,
    activities: [
      {
        time: '09:00',
        description: `${dayHints[0]} 可在小红书/高德收藏 2–3 个 POI 再出发。`,
        location: `${destination} · 市区`,
        costWeight: 0.3,
      },
      {
        time: '12:30',
        description: `本地午餐：优先选 ${interestLabel} 类小店或夜市，人均控制在预算 1/3 以内。`,
        location: `${destination} · ${interestLabel}`,
        costWeight: 0.25,
      },
      {
        time: '15:00',
        description: `${dayHints[1]} 地铁/公交一日票通常比多次打车划算。`,
        location: `${destination} · 核心景区`,
        costWeight: 0.25,
      },
      {
        time: '19:30',
        description: `${dayHints[2]} 晚间注意安全，贵重物品随身。`,
        location: `${destination} · 夜景/商圈`,
        costWeight: 0.2,
      },
    ],
  };
}

export function getCityDaySeed(destination: string, day: number, interestLabel: string): CityDaySeed {
  const profile = CITY_DAY_SEEDS[destination.trim()];
  if (profile?.[day - 1]) {
    return profile[day - 1];
  }
  if (profile?.length) {
    return profile[(day - 1) % profile.length];
  }
  return buildGenericDaySeed(destination, day, interestLabel);
}

export function seedsToActivities(
  seeds: CityActivitySeed[],
  perDayBudget: number,
): TravelPlanActivity[] {
  const totalWeight = seeds.reduce((sum, seed) => sum + seed.costWeight, 0) || 1;
  return seeds.map((seed) => ({
    time: seed.time,
    description: seed.description,
    location: seed.location,
    cost: Math.round((perDayBudget * (seed.costWeight / totalWeight)) * 10) / 10,
  }));
}
