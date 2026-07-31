/** 用户指定的交通方式（未指定时 auto = 顾问择优组合） */
export type TransportMode =
  | 'auto'
  | 'self_drive'
  | 'high_speed_rail'
  | 'train'
  | 'bus'
  | 'flight'
  | 'mixed';

const TRANSPORT_RULES: { pattern: RegExp; mode: TransportMode }[] = [
  { pattern: /自驾|租车|开车|私家车|SUV|小汽车/, mode: 'self_drive' },
  { pattern: /高铁|动车|G\d+|D\d+|复兴号/, mode: 'high_speed_rail' },
  { pattern: /普快|火车|硬座|硬卧|软卧|K\d+|T\d+|Z\d+/, mode: 'train' },
  { pattern: /大巴|长途汽车|班车|客运|巴士/, mode: 'bus' },
  { pattern: /飞机|航班|航空|机票|飞过去|坐飞机/, mode: 'flight' },
];

/** 从搜索词解析交通方式；多种同时出现 → mixed */
export function parseTransportMode(text: string): TransportMode {
  const matched = new Set<TransportMode>();
  for (const rule of TRANSPORT_RULES) {
    if (rule.pattern.test(text)) {
      matched.add(rule.mode);
    }
  }
  if (matched.size === 0) {
    return 'auto';
  }
  if (matched.size === 1) {
    return [...matched][0]!;
  }
  return 'mixed';
}

export function buildTransportModeStandards(mode: TransportMode): string {
  switch (mode) {
    case 'self_drive':
      return [
        '【交通：自驾】全程以自驾为主，禁止默认高铁/火车/飞机。',
        '须写：高速/国道路线、里程、过路费、油费估算、停车点与限行提示。',
      ].join('\n');
    case 'high_speed_rail':
      return [
        '【交通：高铁/动车】大交通以高铁/动车为主。',
        '须写：具体出发站→到达站、车次类型(G/D)、参考票价、接驳地铁/公交/打车方案。',
      ].join('\n');
    case 'train':
      return [
        '【交通：普快/火车】大交通以普快/普列为主（可含硬座/硬卧）。',
        '须写：具体车站、车次类型(K/T/Z)、参考票价、夜间卧铺与接驳方案。',
      ].join('\n');
    case 'bus':
      return [
        '【交通：大巴/客运】跨城以长途大巴/客运班车为主。',
        '须写：具体客运站、班次时段、票价、到站后接驳与步行距离。',
      ].join('\n');
    case 'flight':
      return [
        '【交通：航空】跨城以飞机为主。',
        '须写：机场、航班时段、参考票价、机场大巴/地铁/打车接驳与行李提示。',
      ].join('\n');
    case 'mixed':
      return [
        '【交通：组合出行】用户提及多种交通方式，须按段写清每种方式（如去程高铁、返程大巴）。',
        '每段须写具体站点/车次类型/票价与门到门接驳，禁止混为一谈。',
      ].join('\n');
    default:
      return [
        '【交通：门到门】未指定单一方式时，按距离与预算择优组合：大巴/普快/高铁/航空/自驾均可。',
        '每段须写三方案（地铁/公交/打车）+ 🐌 推荐，跨城须写具体车站/机场与接驳。',
      ].join('\n');
  }
}

export function buildThemeStandards(preferences: string[]): string {
  if (preferences.length === 0) {
    return '';
  }

  const blocks: string[] = [`【主题玩法】用户偏好：${preferences.join('、')}。须融入每日行程：`];

  if (preferences.includes('露营')) {
    blocks.push('- 露营：推荐具体营地/露营地、装备清单、费用、天气与禁火提示。');
  }
  if (preferences.includes('美食')) {
    blocks.push('- 美食：早/午/晚各至少1个具体店名或街区，含人均参考价。');
  }
  if (preferences.includes('垂钓')) {
    blocks.push('- 垂钓：推荐具体水库/河段/钓点、季节鱼种、装备租赁与收费。');
  }
  if (preferences.includes('亲子')) {
    blocks.push('- 亲子：适合儿童的景点/活动、推车友好、休息点与注意事项。');
  }
  if (preferences.includes('研学')) {
    blocks.push('- 研学：博物馆/红色/科普线路，含预约、讲解与适龄提示。');
  }
  if (preferences.includes('采摘')) {
    blocks.push('- 采摘：具体果园/农家、季节、采摘价与交通接驳。');
  }
  if (preferences.includes('摄影打卡')) {
    blocks.push('- 摄影：具体机位/时段/光线建议与出片路线。');
  }
  if (preferences.includes('自然风光')) {
    blocks.push('- 自然：徒步/观湖/看海路线与装备建议。');
  }
  if (preferences.includes('历史文化')) {
    blocks.push('- 历史：古迹/博物馆/非遗体验，含门票与讲解。');
  }

  return blocks.join('\n');
}
