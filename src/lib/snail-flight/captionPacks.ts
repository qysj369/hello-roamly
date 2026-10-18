import type { SnailFlightNarration } from '@/lib/snail-flight/routes';

export type CaptionPackId = 'story' | 'verse' | 'guide';

export type CaptionCue = {
  id: string;
  from: number;
  to: number;
};

/** 进度区间只决定何时触发；屏上仍只停留 6～8 秒。 */
export const SNAIL_FLIGHT_CAPTION_CUES: readonly CaptionCue[] = [
  { id: 'takeoff', from: 0, to: 0.05 },
  { id: 'lakes', from: 0.12, to: 0.18 },
  { id: 'zhangqiu', from: 0.15, to: 0.2 },
  { id: 'zibo', from: 0.35, to: 0.4 },
  { id: 'weifang', from: 0.6, to: 0.65 },
  { id: 'laizhou', from: 0.75, to: 0.8 },
  { id: 'qingdao-land', from: 0.92, to: 1 },
];

const STORY: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜济南历下】',
    lines: [
      '登机完毕，蜗牛号缓缓离地。',
      '脚下历下，是泉城千年文脉所在。',
      '趵突泉、大明湖静卧于此，我们向东启程，开启一场低空山河漫游。',
    ],
  },
  lakes: {
    id: 'lakes',
    at: 0.12,
    title: '【掠过湖泽】',
    lines: [
      '湖水静卧在齐鲁大地，',
      '田畴阡陌向远方延展，',
      '蜗牛号继续向东，奔赴群山与城镇。',
    ],
  },
  zhangqiu: {
    id: 'zhangqiu',
    at: 0.15,
    title: '【飞越章丘】',
    lines: [
      '告别济南城区，向东掠过章丘。',
      '群山慢慢舒展，田野铺向远方，齐鲁大地的底色，就在这片平原与山丘之间。',
    ],
  },
  zibo: {
    id: 'zibo',
    at: 0.35,
    title: '【途经淄博】',
    lines: [
      '前方抵达淄博上空。',
      '城镇连绵铺开，土地厚重，藏着烟火与故事。',
      '古齐国的风，至今还吹在这片老城与工矿之间。',
    ],
  },
  weifang: {
    id: 'weifang',
    at: 0.6,
    title: '【飞越潍坊】',
    lines: [
      '进入潍坊空域，大地愈发开阔。',
      '一望无垠的齐鲁平原，河道交错，良田万顷。',
      '这里是风筝的故乡，风，从陆地向着海洋奔去。',
    ],
  },
  laizhou: {
    id: 'laizhou',
    at: 0.75,
    title: '【近海初见｜莱州湾】',
    lines: [
      '前方望见海岸线，渤海湾就在眼前。',
      '陆地到此收束，我们即将告别平原，奔赴海滨之城。',
    ],
  },
  'qingdao-land': {
    id: 'qingdao-land',
    at: 0.92,
    title: '【抵达青岛｜降落阶段】',
    lines: [
      '我们抵达青岛上空，蜗牛号准备缓缓降落。',
      '红瓦、碧海与山峦相拥，海风迎面而来。',
      '这段山河漫游到此结束，接下来，为你生成这座海滨之城的旅行灵感。',
    ],
  },
};

const VERSE: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜历下】',
    lines: ['蜗牛号升空，俯瞰泉城历下。', '泉水流淌千年，我们向东出发。'],
  },
  lakes: {
    id: 'lakes',
    at: 0.12,
    title: '【掠过湖泽】',
    lines: ['湖光嵌在田野之间，平原一路向东。'],
  },
  zhangqiu: {
    id: 'zhangqiu',
    at: 0.15,
    title: '【飞越章丘】',
    lines: ['山峦渐缓，万亩田畴铺开齐鲁画卷。'],
  },
  zibo: {
    id: 'zibo',
    at: 0.35,
    title: '【途经淄博】',
    lines: ['齐国故土，城镇连绵，厚重土地藏着人间烟火。'],
  },
  weifang: {
    id: 'weifang',
    at: 0.6,
    title: '【飞越潍坊】',
    lines: ['辽阔平原，风起于此，风筝飞向天际。'],
  },
  laizhou: {
    id: 'laizhou',
    at: 0.75,
    title: '【近海初见｜莱州湾】',
    lines: ['平原尽头，渤海海岸映入眼帘。'],
  },
  'qingdao-land': {
    id: 'qingdao-land',
    at: 0.92,
    title: '【抵达青岛｜降落阶段】',
    lines: ['海风拂面，红瓦碧海相见。山河漫游落幕，开启海滨行程。'],
  },
};

const GUIDE: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜济南历下】',
    lines: [
      '蜗牛号自济南历下起飞，这片土地是泉城核心，承载大明湖与众多泉水古迹，齐鲁文化自此启程。',
    ],
  },
  lakes: {
    id: 'lakes',
    at: 0.12,
    title: '【掠过湖泽】',
    lines: ['下方湖泊镶嵌在农田之间，鲁中平原的肌理在机翼下缓缓展开。'],
  },
  zhangqiu: {
    id: 'zhangqiu',
    at: 0.15,
    title: '【飞越章丘】',
    lines: ['飞越章丘，泰沂余脉慢慢消散，广袤的农耕平原铺展开来。'],
  },
  zibo: {
    id: 'zibo',
    at: 0.35,
    title: '【途经淄博】',
    lines: ['抵达淄博，古齐国故都，工业老城与村落交织，延续着数千年的文明。'],
  },
  weifang: {
    id: 'weifang',
    at: 0.6,
    title: '【飞越潍坊】',
    lines: ['来到潍坊，山东最大的平原腹地，河道密布，是享誉世界的风筝之都。'],
  },
  laizhou: {
    id: 'laizhou',
    at: 0.75,
    title: '【近海初见｜莱州湾】',
    lines: ['前方就是莱州湾，陆地在这里和渤海相接。'],
  },
  'qingdao-land': {
    id: 'qingdao-land',
    at: 0.92,
    title: '【抵达青岛｜降落阶段】',
    lines: ['即将降落青岛，山海相依的滨海城市。漫游结束，为你规划本地旅行。'],
  },
};

export const CAPTION_PACKS: Record<CaptionPackId, Record<string, SnailFlightNarration>> = {
  story: STORY,
  verse: VERSE,
  guide: GUIDE,
};

export const DEFAULT_CAPTION_PACK: CaptionPackId = 'story';

const REGION_BRIEFS: Record<string, string> = {
  takeoff: '此刻在济南历下上空。这里是泉城核心，趵突泉与大明湖静卧其间，齐鲁文脉由此向东铺开。',
  lakes: '此刻掠过齐鲁大地上的湖泽。湖泊镶在田畴之间，平原肌理正缓缓向东延展。',
  zhangqiu: '此刻飞越章丘。泰沂余脉渐渐舒缓，农耕平原铺成齐鲁大地的底色。',
  zibo: '此刻途经淄博上空。古齐故都，老城烟火与工矿交织，土地厚重。',
  weifang: '此刻飞越潍坊。开阔平原河道交错，风筝之乡的风正从陆地吹向海洋。',
  laizhou: '此刻望见莱州湾。陆地在此收束，渤海海岸线已经映入眼前。',
  'qingdao-land': '此刻抵达青岛上空。山海相依，红瓦碧海，蜗牛号正准备缓缓降落。',
};

export function isCaptionPackId(value: string | null | undefined): value is CaptionPackId {
  return value === 'story' || value === 'verse' || value === 'guide';
}

export function captionById(
  packId: CaptionPackId,
  beatId: string,
): SnailFlightNarration | undefined {
  return CAPTION_PACKS[packId][beatId];
}

export function captionVoiceText(narration: SnailFlightNarration): string {
  return [narration.title, ...narration.lines].join('\n');
}

export function captionCueToFire(
  progress: number,
  fired: ReadonlySet<string>,
  cues: readonly CaptionCue[] = SNAIL_FLIGHT_CAPTION_CUES,
): CaptionCue | null {
  const t = Math.min(1, Math.max(0, progress));
  const due = cues.filter((cue) => t + 1e-6 >= cue.from && t <= cue.to + 1e-6 && !fired.has(cue.id));
  if (!due.length) return null;
  return due.reduce((latest, cue) => (cue.from >= latest.from ? cue : latest));
}

/** 当前所在航段（含字幕间隙），用于管家「介绍当前这片区域」。 */
export function regionCueAt(
  progress: number,
  cues: readonly CaptionCue[] = SNAIL_FLIGHT_CAPTION_CUES,
): CaptionCue {
  const t = Math.min(1, Math.max(0, progress));
  return cues.reduce((current, cue) => (t + 1e-6 >= cue.from ? cue : current), cues[0]!);
}

export function regionBriefAt(progress: number): string {
  return REGION_BRIEFS[regionCueAt(progress).id] ?? REGION_BRIEFS.takeoff!;
}

export function routeSightsReply(): string {
  return '我可以为你梳理本次航线沿途的游玩点位，漫游结束后生成旅行灵感。沿途可看：济南历下的趵突泉与大明湖，章丘田野，淄博齐文化与老城烟火，潍坊风筝与平原，莱州湾海岸，以及青岛的红瓦碧海。';
}
