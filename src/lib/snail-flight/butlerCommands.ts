import {
  regionBriefAt,
  routeSightsReply,
  type CaptionPackId,
} from '@/lib/snail-flight/captionPacks';

export const SNAIL_FLIGHT_BUTLER_WELCOME =
  '这次是蜗牛号低空漫游。点下面切换旁白，或问我沿途看到的地方。切换字幕不会打断飞行。';

export const SNAIL_FLIGHT_BUTLER_LEAD = '飞行途中可切换字幕，不会打断漫游。';

export const SNAIL_FLIGHT_BUTLER_FALLBACK =
  '这次是飞行漫游。可以说「切换极简诗意版」「介绍当前这片区域」或「沿途有什么景点」。';

export const SNAIL_FLIGHT_FAQ_CHIPS = [
  {
    label: '它的劣势有哪些？',
    text: '它的劣势有哪些？',
    reply:
      '沉浸式飞行漫游对设备与网络有一定要求，低配设备加载会卡顿；目前航线数量有限，需要持续扩充；侧重旅行灵感规划，不直接提供订票、酒店预订等交易服务。',
  },
  {
    label: '它的目标用户群体是谁？',
    text: '它的目标用户群体是谁？',
    reply:
      '喜欢结伴出游、寻找旅行灵感的年轻游客；旅游自媒体创作者；亲子家庭做地理云研学；还有爱好云旅游、提前预览目的地的旅行爱好者。',
  },
  {
    label: '它的商业模式是怎样的？',
    text: '它的商业模式是怎样的？',
    reply:
      '基础漫游和简易行程免费使用；高级航线、高清种草素材、深度定制行程采用增值付费；面向自媒体创作者提供素材包服务。',
  },
] as const;

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
    return { packId: 'verse', message: '已切换至【极简诗意版】，旁白变得更简洁轻盈。' };
  }
  if (includesAny(key, GUIDE_KEYS)) {
    return {
      packId: 'guide',
      message: '已切换至【科普轻叙事版】，为你带来更丰富的地理人文解说。',
    };
  }
  if (includesAny(key, STORY_KEYS)) {
    return { packId: 'story', message: '已切换至【人文画面主版本】，继续本次山河漫游。' };
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
  if (includesAny(key, ['介绍当前这片区域', '介绍当前区域', '这是哪里', '现在飞到哪'])) {
    return { message: regionBriefAt(progress) };
  }
  if (includesAny(key, ['这条路线沿途有什么景点', '沿途有什么景点', '沿途景点', '航线沿途'])) {
    return { message: routeSightsReply() };
  }
  const faq = SNAIL_FLIGHT_FAQ_CHIPS.find(
    (item) => key.includes(normalize(item.text)) || key.includes(normalize(item.label)),
  );
  if (faq) {
    return { message: faq.reply };
  }
  return null;
}

export function isSnailFlightPageActive(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('snail-flight-active');
}
