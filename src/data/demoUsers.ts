import { DEMO_USER_BADGES } from '@/data/travelBadges';
import { createDefaultUser } from '@/types/domain/user/userDefaults';
import {
  TRAVEL_PERSONALITY_PRESETS,
  TravelPersonalityKind,
} from '@/types/domain/user/userTravel';
import type { User } from '@/types/domain/user/user';
import type { TravelMoment } from '@/types/domain/user/userSocial';

const AVATAR_BASE = 'https://api.dicebear.com/7.x/notionists/svg';

export const DEMO_CURRENT_USER_ID = 'user-roamly-demo';

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

function buildMoments(authorId: string, items: Omit<TravelMoment, 'authorId'>[]): TravelMoment[] {
  return items.map((item) => ({ ...item, authorId }));
}

export const DEMO_USERS: User[] = [
  createDefaultUser(DEMO_CURRENT_USER_ID, {
    username: '轻游小鹿',
    email: 'deer@hello-roamly.demo',
    bio: '用胃认识一座城，用脚步丈量预算内的远方。',
    avatar: `${AVATAR_BASE}?seed=roam-deer&backgroundColor=b6e3f4,c0aede`,
    role: 'member',
    travelPersonality: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Foodie],
    visitedCountries: ['CN', 'JP', 'TH', 'VN'],
    interests: ['food', 'culture', 'nature'],
    followersCount: 128,
    followingCount: 56,
    stats: {
      publishedPlanCount: 12,
      receivedLikeCount: 340,
      favoriteCount: 28,
      companionPostCount: 2,
    },
    badges: DEMO_USER_BADGES[DEMO_CURRENT_USER_ID] ?? [],
    contributionScore: 120,
    travelMoments: buildMoments(DEMO_CURRENT_USER_ID, [
      {
        id: 'moment-1',
        description: '西湖边清晨的葱包烩，配一碗豆浆，才是杭州的正确打开方式。',
        content: '西湖边清晨的葱包烩，配一碗豆浆，才是杭州的正确打开方式。',
        tags: ['美食', '城市漫步', '漫行'],
        location: '西湖 · 杭州',
        countryCode: 'CN',
        imageUrls: ['https://picsum.photos/seed/roamly-hz/800/600'],
        visibility: 'public',
        likeCount: 42,
        commentCount: 8,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        id: 'moment-2',
        description: '清迈夜市芒果糯米饭，甜而不腻，漫行党必吃。',
        content: '清迈夜市芒果糯米饭，甜而不腻，漫行党必吃。',
        tags: ['美食', '夜市', '漫行'],
        location: '清迈夜市',
        countryCode: 'TH',
        imageUrls: [
          'https://picsum.photos/seed/roamly-cm1/800/600',
          'https://picsum.photos/seed/roamly-cm2/800/600',
        ],
        visibility: 'public',
        likeCount: 89,
        commentCount: 15,
        createdAt: daysAgo(14),
        updatedAt: daysAgo(14),
      },
      {
        id: 'moment-3',
        description: '周末在灵隐寺后山走了条小众步道，只有风声和茶香。',
        content: '周末在灵隐寺后山走了条小众步道，只有风声和茶香。',
        tags: ['徒步', '静心'],
        location: '灵隐 · 杭州',
        countryCode: 'CN',
        visibility: 'followers',
        likeCount: 12,
        commentCount: 2,
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      },
      {
        id: 'moment-4',
        description: '草稿：下次去京都的居酒屋清单，先记给自己。',
        content: '草稿：下次去京都的居酒屋清单，先记给自己。',
        tags: ['美食'],
        visibility: 'private',
        likeCount: 0,
        commentCount: 0,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
    ]),
    createdAt: daysAgo(120),
    updatedAt: now,
  }),
  createDefaultUser('user-maple', {
    username: '枫叶旅人',
    email: 'maple@hello-roamly.demo',
    bio: '追光的人，胶片与极光都不会辜负。',
    avatar: `${AVATAR_BASE}?seed=maple-travel&backgroundColor=ffd5dc,ffdfbf`,
    role: 'creator',
    travelPersonality: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Photographer],
    visitedCountries: ['CN', 'IS', 'NO'],
    interests: ['nature', 'adventure', 'culture'],
    followersCount: 512,
    followingCount: 98,
    stats: {
      publishedPlanCount: 24,
      receivedLikeCount: 2100,
      favoriteCount: 156,
      companionPostCount: 0,
    },
    badges: DEMO_USER_BADGES['user-maple'] ?? [],
    contributionScore: 520,
    travelMoments: buildMoments('user-maple', [
      {
        id: 'moment-m1',
        title: '冰岛极光',
        description: '在黑沙滩等到凌晨两点，终于按下快门。',
        content: '在黑沙滩等到凌晨两点，终于按下快门。',
        tags: ['摄影', '极光'],
        location: '维克 · 冰岛',
        countryCode: 'IS',
        imageUrls: ['https://picsum.photos/seed/maple-aurora/800/600'],
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        visibility: 'public',
        likeCount: 256,
        commentCount: 31,
        createdAt: daysAgo(30),
        updatedAt: daysAgo(30),
      },
      {
        id: 'moment-m2',
        description: '雷克雅未克蓝湖温泉，胶片机拍糊了反而更有感觉。',
        content: '雷克雅未克蓝湖温泉，胶片机拍糊了反而更有感觉。',
        tags: ['摄影', '温泉'],
        location: '蓝湖 · 冰岛',
        countryCode: 'IS',
        imageUrls: ['https://picsum.photos/seed/maple-blue/800/600'],
        visibility: 'followers',
        likeCount: 48,
        commentCount: 6,
        createdAt: daysAgo(8),
        updatedAt: daysAgo(8),
      },
    ]),
    createdAt: daysAgo(200),
    updatedAt: now,
  }),
  createDefaultUser('user-nomad', {
    username: '/nomad阿青',
    email: 'nomad@hello-roamly.demo',
    avatar: `${AVATAR_BASE}?seed=nomad-qing&backgroundColor=d1f4d1,c0aede`,
    role: 'member',
    travelPersonality: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.BudgetNomad],
    visitedCountries: ['CN', 'VN', 'KH', 'LA'],
    interests: ['food', 'adventure'],
    followersCount: 67,
    followingCount: 120,
    stats: {
      publishedPlanCount: 6,
      receivedLikeCount: 89,
      favoriteCount: 41,
      companionPostCount: 5,
    },
    badges: DEMO_USER_BADGES['user-nomad'] ?? [],
    contributionScore: 45,
    travelMoments: [],
    createdAt: daysAgo(90),
    updatedAt: now,
  }),
];
