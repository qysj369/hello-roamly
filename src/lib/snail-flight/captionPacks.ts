import type { SnailFlightNarration } from '@/lib/snail-flight/routes';

export type CaptionPackId = 'story' | 'verse' | 'guide';

export type CaptionCue = {
  id: string;
  from: number;
  to: number;
};

/** 进度区间只决定何时触发；屏上仍只停留 6～8 秒。 */
export const SNAIL_FLIGHT_CAPTION_CUES: readonly CaptionCue[] = [
  { id: 'takeoff', from: 0, to: 0.08 },
  { id: 'daming', from: 0.2, to: 0.3 },
  { id: 'qianfo', from: 0.42, to: 0.52 },
  { id: 'heihu', from: 0.63, to: 0.73 },
  { id: 'jiuru-land', from: 0.9, to: 1 },
];

const STORY: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜趵突泉】',
    lines: [
      '登机完毕，蜗牛号从趵突泉畔缓缓离地。',
      '三股清泉日夜翻涌，泉城的千年文脉在脚下展开。',
      '我们掠过老城，开启这场低空泉城漫游。',
    ],
  },
  daming: {
    id: 'daming',
    at: 0.2,
    title: '【掠过明湖】',
    lines: ['前方就是大明湖，水面在柳堤间铺开。', '超然楼与历下亭静立湖岸，荷叶连天，船影缓缓。'],
  },
  qianfo: {
    id: 'qianfo',
    at: 0.42,
    title: '【飞越千佛山】',
    lines: [
      '向南望，千佛山的轮廓卧在城市边缘。',
      '舜耕历山的传说与隋唐造像叠在山间，',
      '从空中看，山与城之间就是济南的底色。',
    ],
  },
  heihu: {
    id: 'heihu',
    at: 0.63,
    title: '【俯瞰黑虎泉】',
    lines: [
      '护城河畔，黑虎泉群的水声隐约可闻。',
      '清晨的打水人、解放阁的影子，都收在粼粼水面里。',
      '我们继续向南，奔赴山谷。',
    ],
  },
  'jiuru-land': {
    id: 'jiuru-land',
    at: 0.9,
    title: '【抵达九如山｜降落阶段】',
    lines: [
      '济南南部山区的溪谷已在眼前，九如山瀑布群层层叠落。',
      '蜗牛号准备缓缓降落，这段泉城山河漫游到此收尾。',
      '落地后，为你生成这趟山野之旅的旅行灵感。',
    ],
  },
};

const VERSE: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜趵突泉】',
    lines: ['蜗牛号升空，三股清泉在脚下翻涌。', '泉城千年文脉，自此启程。'],
  },
  daming: {
    id: 'daming',
    at: 0.2,
    title: '【掠过明湖】',
    lines: ['湖光铺在柳堤之间，超然楼灯火相映。'],
  },
  qianfo: {
    id: 'qianfo',
    at: 0.42,
    title: '【飞越千佛山】',
    lines: ['山影卧城边，历山传说与隋唐造像俱在。'],
  },
  heihu: {
    id: 'heihu',
    at: 0.63,
    title: '【俯瞰黑虎泉】',
    lines: ['护城河畔泉声如虎啸，水光里映着解放阁。'],
  },
  'jiuru-land': {
    id: 'jiuru-land',
    at: 0.9,
    title: '【抵达九如山｜降落阶段】',
    lines: ['溪谷层叠，瀑布连潭。漫游落幕，山野行程待启。'],
  },
};

const GUIDE: Record<string, SnailFlightNarration> = {
  takeoff: {
    id: 'takeoff',
    at: 0,
    title: '【起飞｜趵突泉】',
    lines: [
      '蜗牛号自趵突泉畔起飞，这里是泉城济南的核心，趵突泉、大明湖、黑虎泉等名泉环绕，泉文化自此展开。',
    ],
  },
  daming: {
    id: 'daming',
    at: 0.2,
    title: '【掠过明湖】',
    lines: ['下方就是大明湖，济南老城最大的水面，柳堤荷影之间，超然楼与历下亭静立湖畔。'],
  },
  qianfo: {
    id: 'qianfo',
    at: 0.42,
    title: '【飞越千佛山】',
    lines: ['飞越千佛山，舜耕历山的传说与隋唐摩崖造像叠在山间，登顶可望齐烟九点。'],
  },
  heihu: {
    id: 'heihu',
    at: 0.63,
    title: '【俯瞰黑虎泉】',
    lines: ['护城河畔的黑虎泉群水声如虎啸，清晨打水人络绎，泉水一路汇入大明湖。'],
  },
  'jiuru-land': {
    id: 'jiuru-land',
    at: 0.9,
    title: '【抵达九如山｜降落阶段】',
    lines: ['即将降落九如山，济南南部山区的溪谷群，瀑布连潭、秋红冬冰。漫游结束，为你规划本地山野行程。'],
  },
};

export const CAPTION_PACKS: Record<CaptionPackId, Record<string, SnailFlightNarration>> = {
  story: STORY,
  verse: VERSE,
  guide: GUIDE,
};

export const DEFAULT_CAPTION_PACK: CaptionPackId = 'story';

const REGION_BRIEFS: Record<string, string> = {
  takeoff: '此刻在趵突泉上空。三股清泉昼夜翻涌，这里是泉城济南的心脏，泉脉由此向老城铺开。',
  daming: '此刻掠过大明湖。柳堤荷影间，超然楼与历下亭静立湖岸，湖面倒映着济南老城的天际线。',
  qianfo: '此刻飞越千佛山。舜耕历山的传说与隋唐摩崖造像叠在山间，山与城在此相接。',
  heihu: '此刻俯瞰黑虎泉。护城河畔泉声如虎啸，清晨打水人与解放阁的影子，都在粼粼水光里。',
  'jiuru-land': '此刻抵达九如山上空。溪谷群层层叠落，瀑布连潭，蜗牛号正准备缓缓降落。',
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
  const due = cues.filter(
    (cue) => t + 1e-6 >= cue.from && t <= cue.to + 1e-6 && !fired.has(cue.id),
  );
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
  return '我可以为你梳理本次航线沿途的游玩点位，漫游结束后生成旅行灵感。沿途可看：趵突泉的三股清泉与泉池夜色，大明湖的柳堤荷影与超然楼，千佛山的历山传说与隋唐造像，黑虎泉的护城河打水人，以及九如山的溪谷瀑布。';
}

const AHEAD_SIGHTS: Record<string, string> = {
  daming: '大明湖柳堤荷影与超然楼',
  qianfo: '千佛山历山传说与隋唐造像',
  heihu: '黑虎泉护城河泉群与解放阁',
  'jiuru-land': '九如山溪谷瀑布群',
};

/** 管家「前方还有哪些风景」：只答还没飞到的航段，不打断飞行。 */
export function aheadSightsReply(progress: number): string {
  const t = Math.min(1, Math.max(0, progress));
  const remaining = SNAIL_FLIGHT_CAPTION_CUES.filter((cue) => cue.from > t + 0.02)
    .map((cue) => AHEAD_SIGHTS[cue.id])
    .filter((name): name is string => Boolean(name));
  if (!remaining.length) {
    return '前方已接近九如山降落。溪谷瀑布就在眼前，落地后可以沿栈道慢慢看山与潭。';
  }
  return `前方航线上还能看到：${remaining.join('、')}。想慢慢看的话，落地后我可以帮你排一版山野慢游灵感。`;
}

/** 管家「帮我生成目的地行程」：落地灵感，不含订票组团。 */
export function destinationPlanReply(): string {
  return '落地九如山后可以按慢游来走：第一天沿瀑群栈道慢慢爬，把时间留给水声与树荫；第二天去趵突泉和大明湖沿湖散步，傍晚看超然楼亮灯；第三天量力去黑虎泉看清晨打水，或近郊补点山野。这是灵感参考，不含订票、组团服务。飞行不会暂停。';
}
