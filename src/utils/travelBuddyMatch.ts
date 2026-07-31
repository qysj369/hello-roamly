import { DEMO_TRAVEL_BUDDY_SEEKING } from '@/data/demoTravelBuddySeeking';
import { DEMO_USERS } from '@/data/demoUsers';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type {
  TravelBuddyMatchCandidate,
  TravelBuddyMatchFactorScores,
  TravelBuddyMatchQuery,
} from '@/types/domain/travelBuddyMatch';
import { TRAVEL_BUDDY_MATCH_WEIGHTS } from '@/types/domain/travelBuddyMatch';
import type { User } from '@/types/domain/user/user';
import type { UserCompanionIntent } from '@/types/domain/user/userCompanion';
import { TravelPersonalityKind } from '@/types/domain/user/userTravel';
import { getPersonalityCompatibilityScore } from '@/utils/travelBuddyPersonalityCompat';
import { getCountryLabel, getInterestLabel } from '@/utils/userProfileView';

/**
 * 旅伴匹配：多因子加权（行程 55% + 兴趣 Jaccard + 性格矩阵 + 预算档）。
 * 分数钳制在 50–99，避免 UI 上出现「0 分」或满分泛滥；缺数据时给中性分而非 0，减少冷启动误杀。
 */
// TODO: 目的地别名改由后端/geo 服务或配置中心下发，避免前端硬编码扩展
const DESTINATION_KEYWORDS: Record<string, string[]> = {
  /** 演示数据：同一目的地可能写在国家码、瞬间文案或 bio 里，用别名表做模糊命中 */
  杭州: ['CN', '杭州', '西湖'],
  成都: ['CN', '成都', '锦里'],
  厦门: ['CN', '厦门', '鼓浪屿'],
  西安: ['CN', '西安', '回民街'],
  冰岛: ['IS', '冰岛', '维克', '极光'],
  越南: ['VN', '越南', '河内', '胡志明'],
  清迈: ['TH', '清迈', '泰国'],
  日本: ['JP', '日本'],
  泰国: ['TH', '泰国', '清迈'],
};

const MS_PER_DAY = 86_400_000;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function getDestinationKeywords(destination: string): string[] {
  const normalized = normalizeText(destination);
  for (const [key, keywords] of Object.entries(DESTINATION_KEYWORDS)) {
    if (normalized.includes(normalizeText(key))) {
      return keywords;
    }
  }
  return [destination];
}

function userTouchesDestination(user: User, destination: string): boolean {
  const keywords = getDestinationKeywords(destination).map(normalizeText);
  const countryHit = user.visitedCountries.some((code) =>
    keywords.includes(normalizeText(code)),
  );
  if (countryHit) {
    return true;
  }
  const momentHit = user.travelMoments.some((moment) => {
    const haystack = [moment.location, moment.countryCode, moment.content, moment.title]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });
  if (momentHit) {
    return true;
  }
  return keywords.some((keyword) => normalizeText(user.bio ?? '').includes(keyword));
}

function parseBudgetNumber(budgetLabel?: string): number | undefined {
  if (!budgetLabel) {
    return undefined;
  }
  const digits = budgetLabel.replace(/[^\d]/g, '');
  if (!digits) {
    return undefined;
  }
  return Number.parseInt(digits, 10);
}

function getSharedInterests(a: TravelInterest[], b: TravelInterest[]): TravelInterest[] {
  return a.filter((interest) => b.includes(interest));
}

function findSeekingIntent(userId: string): UserCompanionIntent | undefined {
  return DEMO_TRAVEL_BUDDY_SEEKING.find(
    (intent) => intent.userId === userId && intent.status === 'open',
  );
}

/** 目的地匹配 0–100 */
function scoreDestinationMatch(queryDest: string, intentDest: string): number {
  const query = normalizeText(queryDest);
  const intent = normalizeText(intentDest);

  if (!query || !intent) {
    return 30; // 缺目的地时仍保留弱匹配，避免列表为空
  }

  if (intent.includes(query) || query.includes(intent)) {
    return 100;
  }

  const keywords = getDestinationKeywords(queryDest).map(normalizeText);
  const regionHit = keywords.some(
    (keyword) => intent.includes(keyword) || query.includes(normalizeText(keyword)),
  );
  if (regionHit) {
    return 72; // 同区域不同城市（如「成都」↔「锦里」）仍算较高相关
  }

  return 25; // 明确不匹配时压低，由其他因子决定是否展示
}

/** 行程天数接近度 0–100 */
function scoreDaysMatch(queryDays?: number, intentDays?: number): number {
  if (queryDays == null || queryDays <= 0 || intentDays == null || intentDays <= 0) {
    return 55; // 未填天数时不惩罚，演示表单常留空
  }

  const delta = Math.abs(intentDays - queryDays);
  if (delta === 0) {
    return 100;
  }
  if (delta === 1) {
    return 88;
  }
  if (delta === 2) {
    return 72;
  }
  if (delta <= 4) {
    return 50;
  }
  return 28;
}

/** 出发时间接近度 0–100 */
function scoreStartDateMatch(queryStart?: string, intentStart?: string): number {
  if (!queryStart || !intentStart) {
    return 60;
  }

  const queryMs = Date.parse(queryStart);
  const intentMs = Date.parse(intentStart);
  if (Number.isNaN(queryMs) || Number.isNaN(intentMs)) {
    return 60;
  }

  const dayDelta = Math.abs(queryMs - intentMs) / MS_PER_DAY;
  if (dayDelta <= 3) {
    return 100;
  }
  if (dayDelta <= 7) {
    return 85;
  }
  if (dayDelta <= 14) {
    return 68;
  }
  if (dayDelta <= 30) {
    return 45;
  }
  return 22;
}

/**
 * 时间 + 目的地综合（权重内再分配：目的地 55%、天数 25%、出发日 20%）
 */
function scoreScheduleDestination(
  query: TravelBuddyMatchQuery,
  intent: UserCompanionIntent,
  candidate: User,
): { score: number; hints: string[] } {
  const destinationScore = scoreDestinationMatch(query.destination, intent.destination);
  const daysScore = scoreDaysMatch(query.days, intent.days);
  const dateScore = scoreStartDateMatch(query.startDate, intent.startDate);

  let composite = Math.round(destinationScore * 0.55 + daysScore * 0.25 + dateScore * 0.2);

  const hints: string[] = [];
  if (destinationScore >= 90) {
    hints.push(`同样想去${intent.destination}`);
  } else if (destinationScore >= 70) {
    hints.push('目的地在同一区域');
  }

  if (daysScore >= 88 && query.days != null) {
    hints.push(`行程 ${query.days} 天一致`);
  } else if (daysScore >= 70) {
    hints.push('行程天数接近');
  }

  if (dateScore >= 85 && query.startDate && intent.startDate) {
    hints.push('出发时间相近');
  }

  // 对方足迹/瞬间曾提及该目的地：结伴价值高于纯文字意向，故小幅加分
  if (userTouchesDestination(candidate, query.destination)) {
    composite = Math.min(100, composite + 8);
    hints.push('对方有当地经验');
  }

  return { score: composite, hints };
}

/** 兴趣标签重叠度 0–100（Jaccard） */
function scoreInterestOverlap(
  viewerInterests: TravelInterest[],
  candidateInterests: TravelInterest[],
): { score: number; shared: TravelInterest[]; hint?: string } {
  const shared = getSharedInterests(viewerInterests, candidateInterests);

  if (viewerInterests.length === 0 || candidateInterests.length === 0) {
    return { score: 48, shared };
  }

  const union = new Set([...viewerInterests, ...candidateInterests]).size;
  const jaccard = shared.length / union;
  const score = Math.round(jaccard * 100);

  const hint =
    shared.length > 0
      ? `共同兴趣：${shared.map(getInterestLabel).join('、')}`
      : undefined;

  return { score, shared, hint };
}

/** 预算接近度 0–100 */
function scoreBudgetProximity(queryBudget?: number, intentBudget?: number): {
  score: number;
  hint?: string;
} {
  if (queryBudget == null || intentBudget == null) {
    return { score: 52 };
  }

  const max = Math.max(queryBudget, intentBudget, 1);
  const ratio = Math.abs(queryBudget - intentBudget) / max;

  if (ratio <= 0.08) {
    return { score: 100, hint: '预算几乎一致' };
  }
  if (ratio <= 0.2) {
    return { score: 88, hint: '预算区间接近' };
  }
  if (ratio <= 0.35) {
    return { score: 70, hint: '预算可协商' };
  }
  if (ratio <= 0.55) {
    return { score: 48 };
  }
  return { score: 25 };
}

function scorePersonality(
  viewer: User | undefined,
  candidate: User,
): { score: number; hint?: string } {
  if (!viewer) {
    const base =
      candidate.travelPersonality.kind === TravelPersonalityKind.SocialButterfly ? 78 : 58;
    return { score: base };
  }

  const score = getPersonalityCompatibilityScore(
    viewer.travelPersonality.kind,
    candidate.travelPersonality.kind,
  );

  let hint: string | undefined;
  if (score >= 90) {
    hint = `人格高度兼容（${candidate.travelPersonality.title}）`;
  } else if (score >= 75) {
    hint = '旅行人格互补';
  }

  return { score, hint };
}

function computeWeightedScore(factors: TravelBuddyMatchFactorScores): number {
  const raw =
    factors.scheduleDestination * TRAVEL_BUDDY_MATCH_WEIGHTS.scheduleDestination +
    factors.personality * TRAVEL_BUDDY_MATCH_WEIGHTS.personality +
    factors.interests * TRAVEL_BUDDY_MATCH_WEIGHTS.interests +
    factors.budget * TRAVEL_BUDDY_MATCH_WEIGHTS.budget;

  return Math.min(99, Math.max(50, Math.round(raw)));
}

function buildMatchReasons(hints: (string | undefined)[]): string[] {
  const unique = [...new Set(hints.filter((item): item is string => Boolean(item)))];
  return unique.slice(0, 4);
}

function scoreCandidate(
  user: User,
  query: TravelBuddyMatchQuery,
  viewer: User | undefined,
  intent: UserCompanionIntent,
): TravelBuddyMatchCandidate | null {
  if (!user.privacySettings.allowCompanionRequests) {
    return null;
  }

  const schedule = scoreScheduleDestination(query, intent, user);
  const personality = scorePersonality(viewer, user);
  const interestSource = viewer ?? user;
  const interests = scoreInterestOverlap(interestSource.interests, user.interests);
  const budget = scoreBudgetProximity(
    parseBudgetNumber(query.budgetLabel),
    parseBudgetNumber(intent.budgetLabel),
  );

  const factorScores: TravelBuddyMatchFactorScores = {
    scheduleDestination: schedule.score,
    personality: personality.score,
    interests: interests.score,
    budget: budget.score,
  };

  const matchScore = computeWeightedScore(factorScores);

  const matchReasons = buildMatchReasons([
    ...schedule.hints,
    personality.hint,
    interests.hint,
    budget.hint,
  ]);

  if (matchReasons.length === 0) {
    matchReasons.push('开放结伴中');
  }

  return {
    userId: user.id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    travelPersonality: user.travelPersonality,
    sharedInterests: interests.shared,
    matchScore,
    factorScores,
    seekingDestination: intent.destination,
    seekingDays: intent.days,
    seekingBudgetLabel: intent.budgetLabel,
    seekingStartDate: intent.startDate,
    seekingMessage: intent.message,
    interests: user.interests,
    visitedCountryCount: user.visitedCountries.length,
    matchReasons,
  };
}

/**
 * 按目的地、天数、预算等上下文为「正在找旅伴」的用户打分并排序。
 *
 * @remarks
 * 演示数据仅包含 `DEMO_TRAVEL_BUDDY_SEEKING` 中 status=open 的用户；
 * 综合分由行程、兴趣 Jaccard、性格矩阵等加权，结果钳制在 50–99。
 *
 * @param query - 搜索方填写的目的地、天数、预算档等
 * @param options.excludeUserId - 排除本人
 * @param options.viewer - 用于性格/兴趣加分的当前用户；默认无
 * @param options.limit - 返回条数上限，默认 6
 * @returns 按 `matchScore` 降序的候选列表
 */
export function matchTravelBuddies(
  query: TravelBuddyMatchQuery,
  options?: { excludeUserId?: string; viewer?: User; limit?: number },
): TravelBuddyMatchCandidate[] {
  const limit = options?.limit ?? 6;
  const viewer = options?.viewer;

  const results = DEMO_USERS.filter((user) => user.id !== options?.excludeUserId)
    .map((user) => {
      const intent = findSeekingIntent(user.id);
      if (!intent) {
        return null;
      }
      return scoreCandidate(user, query, viewer, intent);
    })
    .filter((item): item is TravelBuddyMatchCandidate => item != null)
    .sort((a, b) => b.matchScore - a.matchScore);

  return results.slice(0, limit);
}

/** 无具体目的地时返回全部开放中的旅伴 */
export function listOpenTravelBuddies(
  excludeUserId?: string,
  viewer?: User,
): TravelBuddyMatchCandidate[] {
  return DEMO_TRAVEL_BUDDY_SEEKING.filter((intent) => intent.userId !== excludeUserId)
    .map((intent) => {
      const user = DEMO_USERS.find((item) => item.id === intent.userId);
      if (!user) {
        return null;
      }
      return scoreCandidate(
        user,
        {
          destination: intent.destination,
          days: intent.days,
          budgetLabel: intent.budgetLabel,
          startDate: intent.startDate,
          planTitle: intent.planTitle,
        },
        viewer,
        intent,
      );
    })
    .filter((item): item is TravelBuddyMatchCandidate => item != null)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function formatMatchScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function describeMatchQuery(query: TravelBuddyMatchQuery): string {
  const parts = [query.destination];
  if (query.days != null && query.days > 0) {
    parts.push(`${query.days} 天`);
  }
  if (query.budgetLabel) {
    parts.push(`预算 ${query.budgetLabel}`);
  }
  if (query.startDate) {
    parts.push(`出发 ${query.startDate.slice(0, 10)}`);
  }
  return parts.join(' · ');
}

/** 将路由 state 转为匹配查询 */
export function travelBuddyQueryFromRoute(
  travelBuddy: TravelBuddyMatchQuery | undefined,
  aiPlan?: { destination: string; days: number; budget: string },
): TravelBuddyMatchQuery | null {
  if (travelBuddy?.destination?.trim()) {
    return {
      destination: travelBuddy.destination.trim(),
      days: travelBuddy.days,
      budgetLabel: travelBuddy.budgetLabel,
      planId: travelBuddy.planId,
      planTitle: travelBuddy.planTitle,
      startDate: travelBuddy.startDate,
    };
  }
  if (aiPlan?.destination?.trim()) {
    return {
      destination: aiPlan.destination.trim(),
      days: aiPlan.days,
      budgetLabel: aiPlan.budget ? `¥${aiPlan.budget}` : undefined,
    };
  }
  return null;
}

export function getCountryHint(destination: string): string | undefined {
  const keywords = getDestinationKeywords(destination);
  const code = keywords.find((item) => item.length === 2 && item === item.toUpperCase());
  return code ? getCountryLabel(code) : undefined;
}

/** 导出算法说明（文档/调试） */
export function describeMatchAlgorithm(): string {
  return [
    `旅行时间·目的地 ${TRAVEL_BUDDY_MATCH_WEIGHTS.scheduleDestination * 100}%`,
    `旅行人格兼容 ${TRAVEL_BUDDY_MATCH_WEIGHTS.personality * 100}%`,
    `兴趣标签重叠 ${TRAVEL_BUDDY_MATCH_WEIGHTS.interests * 100}%`,
    `预算范围接近 ${TRAVEL_BUDDY_MATCH_WEIGHTS.budget * 100}%`,
  ].join(' · ');
}
