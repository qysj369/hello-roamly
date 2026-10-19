import {
  aheadSightsReply,
  destinationPlanReply,
  regionBriefAt,
  type CaptionPackId,
} from '@/lib/snail-flight/captionPacks';

export const SNAIL_FLIGHT_BUTLER_WELCOME =
  '这次是蜗牛号低空漫游。点下面切换旁白，或问我沿途看到的地方。切换字幕不会打断飞行。';

export const SNAIL_FLIGHT_BUTLER_LEAD = '飞行途中可切换字幕，不会打断漫游。';

export const SNAIL_FLIGHT_BUTLER_FALLBACK =
  '这次是飞行漫游。可以说「介绍眼前这片区域」「前方还有哪些风景」或「帮我生成目的地行程」。切换字幕不会打断飞行。';

export const SNAIL_FLIGHT_SCENE_CHIPS = [
  { label: '介绍眼前这片区域', text: '介绍眼前这片区域' },
  { label: '前方还有哪些风景', text: '前方还有哪些风景' },
  { label: '帮我生成目的地行程', text: '帮我生成目的地行程' },
] as const;

export const SNAIL_FLIGHT_PACK_NOTICE = {
  story: '已切换至【人文画面主版本】，继续本次山河漫游。',
  verse: '已切换至【极简诗意版】，旁白变得更简洁轻盈。',
  guide: '已切换至【科普轻叙事版】，为你带来更丰富的地理与人文解说。',
} as const;

export type SnailFlightButlerHit = {
  message: string;
  packId?: CaptionPackId;
};

export function isPackSwitchNotice(text: string): boolean {
  return (
    text.includes('已切换至【人文画面主版本】') ||
    text.includes('已切换至【极简诗意版】') ||
    text.includes('已切换至【科普轻叙事版】')
  );
}

function normalize(text: string): string {
  return text.replace(/[\s，。！？、,.!?;:：；“”"'`]+/g, '').toLowerCase();
}

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(normalize(needle)));
}

const STORY_KEYS = [
  '切换为主版本文案',
  '换回默认字幕',
  '用人文画面风格',
  '恢复原来的旁白',
  '切换成带历史文化的版本',
  '人文画面',
  '主版本文案',
  '默认字幕',
  '原来的旁白',
  '历史文化的版本',
] as const;

const VERSE_KEYS = [
  '切换极简诗意版',
  '用简短文案',
  '字幕精简一点',
  '换成诗意风格旁白',
  '短句模式',
  '极简诗意',
  '简短文案',
  '诗意风格',
  '字幕精简',
] as const;

const GUIDE_KEYS = [
  '切换科普叙事版',
  '增加地理人文介绍',
  '换成科普风格',
  '给我详细一点的讲解',
  '地理讲解模式',
  '科普叙事',
  '科普风格',
  '地理人文介绍',
  '详细一点的讲解',
  '地理讲解',
] as const;

export function matchSnailFlightButler(
  text: string,
  progress: number,
): SnailFlightButlerHit | null {
  const raw = text.trim();
  if (!raw) return null;
  const key = normalize(raw);

  if (includesAny(key, VERSE_KEYS)) {
    return { packId: 'verse', message: SNAIL_FLIGHT_PACK_NOTICE.verse };
  }
  if (includesAny(key, GUIDE_KEYS)) {
    return { packId: 'guide', message: SNAIL_FLIGHT_PACK_NOTICE.guide };
  }
  if (includesAny(key, STORY_KEYS)) {
    return { packId: 'story', message: SNAIL_FLIGHT_PACK_NOTICE.story };
  }

  if (includesAny(key, ['放慢飞行速度', '飞慢一点', '飞慢点', '降低漫游速度'])) {
    return { message: '收到，正在降低漫游速度。' };
  }
  if (includesAny(key, ['加快飞行速度', '飞快一点', '飞快点', '提升漫游速度'])) {
    return { message: '收到，正在提升漫游速度。' };
  }
  if (includesAny(key, ['暂停飞行', '暂停漫游'])) {
    return { message: '漫游已暂停，你可以继续提问。' };
  }
  if (includesAny(key, ['继续飞行', '继续漫游'])) {
    return { message: '漫游继续，我们向前出发。' };
  }
  if (
    includesAny(key, [
      '介绍眼前这片区域',
      '介绍当前这片区域',
      '介绍当前区域',
      '眼前这片区域',
      '这是哪里',
      '现在飞到哪',
    ])
  ) {
    return { message: regionBriefAt(progress) };
  }
  if (
    includesAny(key, [
      '前方还有哪些风景',
      '前方还有什么风景',
      '这条路线沿途有什么景点',
      '沿途有什么景点',
      '沿途景点',
      '航线沿途',
    ])
  ) {
    return { message: aheadSightsReply(progress) };
  }
  if (includesAny(key, ['帮我生成目的地行程', '生成目的地行程', '目的地行程'])) {
    return { message: destinationPlanReply() };
  }
  return null;
}

export function isSnailFlightPageActive(): boolean {
  return (
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('snail-flight-active')
  );
}
