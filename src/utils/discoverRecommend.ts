import { findUserById, getCurrentDemoUser } from '@/data/findUserById';
import { demoGuides } from '@/data/demoGuides';
import { findTravelPlanById } from '@/data/findTravelPlan';
import type { Guide } from '@/types/domain/guide';
import type {
  DiscoverFeedItem,
  DiscoverSortMode,
  RecommendedDiscoverItem,
} from '@/types/domain/discover';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import type { User } from '@/types/domain/user/user';
import { getMomentCoverUrl } from '@/utils/discoverMedia';
import {
  contentTagsMatchPersonalityTraits,
  formatInterestList,
  getInterestLabel,
  scoreInterestTagOverlap,
} from '@/utils/discoverInterest';
import { getCountryLabel } from '@/utils/userProfileView';
import { getPersonalityCompatibilityScore } from '@/utils/travelBuddyPersonalityCompat';
import {
  getPlanDestination,
  getPlanStyleTags,
} from '@/utils/travelPlanView';

/** 低于此分不标「强推荐」、不参与热门首屏的「每类一条」轮选 */
const RECOMMEND_SCORE_THRESHOLD = 45;

export function getDiscoverViewer(): User {
  // TODO: 推荐打分应使用真实登录用户，与 getCurrentDemoUser 解耦
  return getCurrentDemoUser();
}

export function getViewerInterestSummary(viewer: User = getDiscoverViewer()): string {
  return formatInterestList(viewer.interests);
}

/** 新近内容加分，约 15 天后衰减为 0；系数 0.8 避免老内容完全被压没 */
function recencyScore(isoDate: string, maxPoints = 12): number {
  const days = (Date.now() - new Date(isoDate).getTime()) / 86_400_000;
  if (Number.isNaN(days)) {
    return 0;
  }
  return Math.max(0, maxPoints - days * 0.8);
}

function visitedRegionScore(viewer: User, locationText: string, countryCode?: string): number {
  if (!locationText && !countryCode) {
    return 0;
  }
  for (const code of viewer.visitedCountries) {
    const label = getCountryLabel(code);
    if (locationText.includes(label) || label.includes(locationText)) {
      return 14;
    }
    if (countryCode === code) {
      return 14;
    }
  }
  return 0;
}

function pushReason(reasons: string[], reason: string, seen: Set<string>) {
  if (!seen.has(reason)) {
    seen.add(reason);
    reasons.push(reason);
  }
}

function scoreGuide(guide: Guide, viewer: User): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const seen = new Set<string>();
  let score = 0;

  const { score: interestOverlap, matchedInterests } = scoreInterestTagOverlap(
    viewer.interests,
    guide.tags,
  );
  // 攻略以标签为主：兴趣重合权重略高于计划/瞬间（38 vs 36/40）
  score += interestOverlap * 38;
  for (const interest of matchedInterests) {
    pushReason(reasons, `匹配${getInterestLabel(interest)}兴趣`, seen);
  }

  if (contentTagsMatchPersonalityTraits(guide.tags, viewer.travelPersonality.traits)) {
    score += 12;
    pushReason(reasons, `符合${viewer.travelPersonality.title}偏好`, seen);
  }

  score += visitedRegionScore(viewer, guide.city);
  if (visitedRegionScore(viewer, guide.city) > 0) {
    pushReason(reasons, `你去过的${guide.city}`, seen);
  }

  score += recencyScore(guide.updatedAt);
  score += Math.min(8, guide.tags.length * 2);

  return { score, reasons };
}

function scorePlan(plan: TravelPlan, viewer: User): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const seen = new Set<string>();
  let score = 0;

  const tags = getPlanStyleTags(plan).map((tag) => tag.label);
  const destination = getPlanDestination(plan);

  const { score: interestOverlap, matchedInterests } = scoreInterestTagOverlap(
    viewer.interests,
    tags,
  );
  score += interestOverlap * 36;
  for (const interest of matchedInterests) {
    pushReason(reasons, `匹配${getInterestLabel(interest)}兴趣`, seen);
  }

  if (contentTagsMatchPersonalityTraits(tags, viewer.travelPersonality.traits)) {
    score += 10;
    pushReason(reasons, '适合你的出行风格', seen);
  }

  const regionScore = visitedRegionScore(viewer, destination);
  score += regionScore;
  if (regionScore > 0) {
    pushReason(reasons, '与你常去目的地相关', seen);
  }

  const updatedAt = isEnrichedTravelPlan(plan)
    ? plan.presentation.generatedAt
    : new Date().toISOString();
  score += recencyScore(updatedAt);
  score += Math.min(10, plan.dailyPlans.length);

  return { score, reasons };
}

function scoreMoment(
  moment: TravelMoment,
  author: User | undefined,
  viewer: User,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const seen = new Set<string>();
  let score = 0;

  const { score: interestOverlap, matchedInterests } = scoreInterestTagOverlap(
    viewer.interests,
    moment.tags,
  );
  // 瞬间更依赖标签与作者画像，兴趣项权重最高
  score += interestOverlap * 40;
  for (const interest of matchedInterests) {
    pushReason(reasons, `匹配${getInterestLabel(interest)}兴趣`, seen);
  }

  if (author) {
    const authorOverlap = scoreInterestTagOverlap(viewer.interests, author.interests);
    if (authorOverlap.matchedInterests.length > 0) {
      score += 12;
      pushReason(reasons, '作者兴趣与你相近', seen);
    }
    const compat = getPersonalityCompatibilityScore(
      viewer.travelPersonality.kind,
      author.travelPersonality.kind,
    );
    score += compat * 0.1;
    if (compat >= 80) {
      pushReason(reasons, '旅伴性格合拍', seen);
    }
  }

  score += visitedRegionScore(viewer, moment.location ?? '', moment.countryCode);
  if (visitedRegionScore(viewer, moment.location ?? '', moment.countryCode) > 0) {
    pushReason(reasons, '与你足迹相关', seen);
  }

  if (getMomentCoverUrl(moment)) {
    score += 6;
  }
  score += recencyScore(moment.createdAt);
  score += Math.min(8, moment.likeCount * 0.4);

  return { score, reasons };
}

export function scoreDiscoverFeedItem(
  item: DiscoverFeedItem,
  viewer: User = getDiscoverViewer(),
): { score: number; reasons: string[] } {
  if (item.kind === 'guide') {
    const guide = demoGuides.find((entry) => entry.id === item.guideId);
    if (!guide) {
      return { score: recencyScore(item.updatedAt), reasons: [] };
    }
    return scoreGuide(guide, viewer);
  }

  if (item.kind === 'plan') {
    const plan = findTravelPlanById(item.planId);
    if (!plan) {
      return { score: recencyScore(item.updatedAt), reasons: [] };
    }
    return scorePlan(plan, viewer);
  }

  if (item.kind === 'savedPlan') {
    return {
      score: 72 + recencyScore(item.updatedAt) * 0.1,
      reasons: [`${item.locationName} 穷游方案`, '蜗友公开分享'],
    };
  }

  const author = findUserById(item.authorId);
  const moment = author?.travelMoments.find((entry) => entry.id === item.momentId);
  if (!moment) {
    return { score: recencyScore(item.updatedAt), reasons: [] };
  }
  return scoreMoment(moment, author, viewer);
}

export function toRecommendedItem(
  item: DiscoverFeedItem,
  viewer: User = getDiscoverViewer(),
): RecommendedDiscoverItem {
  const { score, reasons } = scoreDiscoverFeedItem(item, viewer);
  return {
    ...item,
    recommendScore: Math.round(score),
    recommendReasons: reasons.slice(0, 3),
  };
}

export function rankDiscoverFeedForViewer(
  items: DiscoverFeedItem[],
  viewer: User = getDiscoverViewer(),
): RecommendedDiscoverItem[] {
  return items
    .map((item) => toRecommendedItem(item, viewer))
    .sort((a, b) => {
      if (b.recommendScore !== a.recommendScore) {
        return b.recommendScore - a.recommendScore;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function scoreDiscoverUser(user: User, viewer: User = getDiscoverViewer()): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  const seen = new Set<string>();
  let score = 0;

  const { score: interestOverlap, matchedInterests } = scoreInterestTagOverlap(
    viewer.interests,
    user.interests.map(getInterestLabel),
  );
  score += interestOverlap * 42;
  for (const interest of matchedInterests) {
    pushReason(reasons, `同样喜欢${getInterestLabel(interest)}`, seen);
  }

  const sharedCountries = user.visitedCountries.filter((code) =>
    viewer.visitedCountries.includes(code),
  );
  if (sharedCountries.length > 0) {
    score += 16;
    pushReason(reasons, `都去过${getCountryLabel(sharedCountries[0]!)}等地`, seen);
  }

  const compat = getPersonalityCompatibilityScore(
    viewer.travelPersonality.kind,
    user.travelPersonality.kind,
  );
  score += compat * 0.22;
  if (compat >= 78) {
    pushReason(reasons, `${user.travelPersonality.title}与你合拍`, seen);
  }

  score += Math.min(12, user.followersCount / 40);
  score += Math.min(8, user.stats.publishedPlanCount * 1.5);

  return { score: Math.round(score), reasons: reasons.slice(0, 2) };
}

export function rankDiscoverUsersForViewer(
  users: User[],
  viewer: User = getDiscoverViewer(),
): Array<User & { recommendScore: number; recommendReasons: string[] }> {
  return users
    .map((user) => {
      const { score, reasons } = scoreDiscoverUser(user, viewer);
      return { ...user, recommendScore: score, recommendReasons: reasons };
    })
    .sort((a, b) => b.recommendScore - a.recommendScore);
}

export function isStrongRecommendation(score: number): boolean {
  return score >= RECOMMEND_SCORE_THRESHOLD;
}

export type DiscoverRecommendationProfile = {
  username: string;
  interestLabels: string[];
  personalityTitle: string;
  personalityTraits: string[];
  visitedLabels: string[];
  scoringFactors: Array<{ title: string; detail: string }>;
};

export function getDiscoverRecommendationProfile(
  viewer: User = getDiscoverViewer(),
): DiscoverRecommendationProfile {
  const interestLabels = viewer.interests.map(getInterestLabel);

  return {
    username: viewer.username,
    interestLabels,
    personalityTitle: viewer.travelPersonality.title,
    personalityTraits: viewer.travelPersonality.traits,
    visitedLabels: viewer.visitedCountries.map(getCountryLabel),
    scoringFactors: [
      {
        title: '兴趣标签',
        detail: `匹配你关注的 ${formatInterestList(viewer.interests)} 等内容标签，重合越多得分越高。`,
      },
      {
        title: '旅行性格',
        detail: `你的「${viewer.travelPersonality.title}」偏好会与攻略、计划的标签相互加成。`,
      },
      {
        title: '足迹与目的地',
        detail:
          viewer.visitedCountries.length > 0
            ? `你去过的 ${viewer.visitedCountries.map(getCountryLabel).join('、')} 等地相关内容会优先展示。`
            : '完善足迹后，相关目的地内容会获得额外权重。',
      },
      {
        title: '新鲜度与热度',
        detail: '最近更新、点赞较多的瞬间与行程，会获得适度加分。',
      },
      {
        title: '旅伴合拍',
        detail: '瞬间作者、热门用户的兴趣与性格兼容度，会影响用户推荐排序。',
      },
    ],
  };
}

export function sortDiscoverFeedByRecency(
  items: RecommendedDiscoverItem[],
): RecommendedDiscoverItem[] {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function applyDiscoverFeedSort(
  items: RecommendedDiscoverItem[],
  mode: DiscoverSortMode,
): RecommendedDiscoverItem[] {
  if (mode === 'recent') {
    return sortDiscoverFeedByRecency(items);
  }
  return items;
}

/**
 * 热门横滑：先保证攻略/计划/瞬间各有一条高分代表，再按分数填满，避免首屏全是同一类型。
 */
export function pickRecommendedHotPicks(
  items: RecommendedDiscoverItem[],
  limit = 8,
): RecommendedDiscoverItem[] {
  const ranked = [...items].sort((a, b) => b.recommendScore - a.recommendScore);
  const picked: RecommendedDiscoverItem[] = [];
  const seenKinds = new Set<DiscoverFeedItem['kind']>();

  for (const item of ranked) {
    if (picked.length >= limit) {
      break;
    }
    if (!seenKinds.has(item.kind) && isStrongRecommendation(item.recommendScore)) {
      picked.push(item);
      seenKinds.add(item.kind);
    }
  }

  for (const item of ranked) {
    if (picked.length >= limit) {
      break;
    }
    if (!picked.some((entry) => entry.id === item.id)) {
      picked.push(item);
    }
  }

  return picked;
}
