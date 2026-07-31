/**
 * 蜗牛社区文化与黑话 — 全站文案宪法（提示词5）
 * 统一蜗友称谓、黑话词典、蜗阶称号与社区公约。
 */

export const SNAIL_COMMUNITY = {
  name: '蜗牛社区',
  memberTerm: '蜗友',
  defaultAuthorName: '蜗牛旅人',
  glossaryTitle: '蜗牛黑话手册',
  glossarySubtitle: '懂黑话，才像自己人 — 穷游路上的蜗牛暗号',
  creedTitle: '蜗牛公约',
} as const;

export type SnailSlangCategory = 'guide' | 'budget' | 'social' | 'action';

export type SnailSlangEntry = {
  id: string;
  term: string;
  meaning: string;
  example?: string;
  category: SnailSlangCategory;
};

export const SNAIL_SLANG_CATEGORY_LABELS: Record<SnailSlangCategory, string> = {
  guide: '攻略黑话',
  budget: '预算黑话',
  social: '社区黑话',
  action: '行动黑话',
};

/** 蜗牛黑话词典 — 站内统一释义 */
export const SNAIL_SLANG_GLOSSARY: readonly SnailSlangEntry[] = [
  {
    id: 'slime-trail',
    term: '黏液轨迹',
    meaning: '蜗友发布的结构化穷游攻略，含花费清单、行程流水账与蜗牛启示。',
    example: '「我刚留下一条西安三天的黏液轨迹。」',
    category: 'guide',
  },
  {
    id: 'snail-trail',
    term: '蜗牛轨迹',
    meaning: '攻略库里最新发布的黏液轨迹流，首页「最新蜗牛轨迹」即此。',
    category: 'guide',
  },
  {
    id: 'snail-insights',
    term: '蜗牛启示',
    meaning: '攻略第三卡：避坑雷达与宝藏点，帮后来者少踩坑、多省钱。',
    category: 'guide',
  },
  {
    id: 'constitution-cards',
    term: '宪法三卡',
    meaning: '结构化攻略固定三板块：花费清单、行程流水账、蜗牛启示。',
    category: 'guide',
  },
  {
    id: 'shell',
    term: '蜗壳',
    meaning: '本次行程的总预算上限，花超了就算「破壳」。',
    example: '「蜗壳就 1500，不能再加了。」',
    category: 'budget',
  },
  {
    id: 'shell-balance',
    term: '壳内余额',
    meaning: '预算里还没花掉的钱；余额越多，蜗壳越硬。',
    category: 'budget',
  },
  {
    id: 'hard-shell',
    term: '硬壳穷游',
    meaning: '极限压低花费的玩法：青旅、公交、免费景点为主。',
    category: 'budget',
  },
  {
    id: 'crash-hostel',
    term: '蹭宿',
    meaning: '住青旅、沙发客等低成本住宿，能睡就行。',
    category: 'budget',
  },
  {
    id: 'pitfall-radar',
    term: '避坑雷达',
    meaning: '本地人视角的踩坑提醒，写在蜗牛启示里。',
    category: 'social',
  },
  {
    id: 'treasure-spot',
    term: '宝藏点',
    meaning: '小众、高性价比的去处，往往不在网红攻略里。',
    category: 'social',
  },
  {
    id: 'slow-crawl',
    term: '慢爬',
    meaning: '不赶景点、按自己节奏慢行，符合「极简于心，慢行致远」。',
    category: 'social',
  },
  {
    id: 'trail-point',
    term: '轨迹点',
    meaning: '发布一条黏液轨迹；轨迹点越多，蜗阶越高。',
    category: 'action',
  },
  {
    id: 'trail-master',
    term: '轨迹主',
    meaning: '经常留下黏液轨迹、帮蜗友省钱的资深贡献者。',
    category: 'social',
  },
  {
    id: 'ai-snail',
    term: 'AI蜗牛',
    meaning: '站内 AI 助手，帮你生成结构化攻略草稿，发布前仍需自己核验。',
    category: 'action',
  },
  {
    id: 'sprinkle-salt',
    term: '撒盐',
    meaning: '给瞬间或计划「点赞」— 蜗友表达认可的方式。',
    category: 'social',
  },
  {
    id: 'shell-keep',
    term: '收进壳里',
    meaning: '收藏喜欢的攻略或计划，像把宝贝藏进蜗壳。',
    category: 'action',
  },
  {
    id: 'snail-den',
    term: '蜗居',
    meaning: '蜗友的个人主页，展示轨迹、计划与壳里珍藏。',
    category: 'social',
  },
] as const;

export type SnailRank = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  minPublishedPlans: number;
};

/** 蜗阶 — 按发布计划数粗略划分（演示环境） */
export const SNAIL_RANKS: readonly SnailRank[] = [
  {
    id: 'rank-wanderer',
    title: '慢行者',
    emoji: '🐌',
    description: '刚入社区，还在摸索自己的蜗壳大小。',
    minPublishedPlans: 0,
  },
  {
    id: 'rank-traveler',
    title: '蜗牛旅人',
    emoji: '🎒',
    description: '已熟悉宪法三卡，开始留下自己的轨迹。',
    minPublishedPlans: 1,
  },
  {
    id: 'rank-trail-rookie',
    title: '轨迹新秀',
    emoji: '✨',
    description: '发布过多条计划或轨迹，愿意分享花费出处。',
    minPublishedPlans: 3,
  },
  {
    id: 'rank-trail-master',
    title: '轨迹主',
    emoji: '🏅',
    description: '持续贡献黏液轨迹，是蜗友眼中的省钱向导。',
    minPublishedPlans: 8,
  },
  {
    id: 'rank-shell-sage',
    title: '壳内达人',
    emoji: '💎',
    description: '预算精算高手，蜗壳用得又快又省。',
    minPublishedPlans: 15,
  },
] as const;

/** 蜗牛公约 — 社区行为准则 */
export const SNAIL_COMMUNITY_CREED: readonly string[] = [
  '每一分花费都有出处 — 不编造、不夸大、不隐瞒。',
  '慢爬优于打卡 — 行程可以紧，但不要骗自己「很轻松」。',
  '避坑要具体 — 蜗牛启示写清地点、金额与替代方案。',
  '尊重在地 — 不鼓吹逃票、占小便宜或伤害环境的行为。',
  'AI 草稿必核验 — 经 AI蜗牛 生成的内容，发布前由作者负责。',
] as const;

/** 全局文案替换（提示词5 · 社区黑话） */
export const SNAIL_GLOBAL_COPY = {
  /** 「用户」→ 蜗友 */
  memberTerm: SNAIL_COMMUNITY.memberTerm,
  /** 「点赞 / 喜欢」→ 撒盐 */
  like: '撒盐',
  unlike: '取消撒盐',
  likeAria: (count: number, liked: boolean) =>
    liked ? `取消撒盐，当前 ${count} 盐` : `撒盐，当前 ${count} 盐`,
  doubleTapLike: '双击撒盐',
  /** 「收藏」→ 收进壳里 */
  favorite: '收进壳里',
  unfavorite: '从壳里取出',
  favorited: '已在壳里',
  favoritesTab: '壳里',
  /** 「个人主页」→ 我的蜗居 */
  myDen: '我的蜗居',
  myDenShort: '蜗居',
  /** 发布成功 */
  publishSuccess: '轨迹已留下！',
  /** 空状态统一文案 */
  emptyState: '这里还没有蜗牛爬过，留下你的第一条轨迹吧！',
  hotMembers: '热门蜗友',
} as const;

/** 各页面社区化文案（提示词5 延伸） */
export const SNAIL_UI_COPY = {
  guidesLibraryTitle: '黏液轨迹库',
  guidesLibrarySubtitle: '蜗友留下的结构化穷游攻略，支持关键词实时筛选。',
  guidesSearchPlaceholder: "城市、蜗壳或关键词，如：'西安 三天 1500'",
  guidesListTitle: '全部蜗牛轨迹',
  guidesListEmpty: SNAIL_GLOBAL_COPY.emptyState,
  guideUnnamed: '未命名黏液轨迹',
  guideDetailGlossaryHint: '看不懂板块名？查蜗牛黑话手册',
  publishChecklist: '留轨迹清单',
  aiWelcome:
    '你好，我是 AI蜗牛 🐌\n\n我会按**宪法三卡**帮你起草黏液轨迹——花费清单、行程流水账、蜗牛启示，每一分花费都有出处。\n\n**第一步：你想去哪里？**\n请告诉我目的地（城市或区域）。',
  inviteTagline: '邀请蜗友加入，一起慢爬看世界',
  insightRegretsPlaceholder: '写下避坑雷达：最后悔的事、需要避开的坑…',
  insightTreasurePlaceholder: '写下宝藏点：最推荐的去处、点单 secret…',
  costTotalHint: '蜗壳总计',
} as const;
