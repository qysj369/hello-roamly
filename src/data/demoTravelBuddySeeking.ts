import type { UserCompanionIntent } from '@/types/domain/user/userCompanion';

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

/** 演示用户正在寻找旅伴的意向 */
export const DEMO_TRAVEL_BUDDY_SEEKING: UserCompanionIntent[] = [
  {
    id: 'seek-maple-iceland',
    userId: 'user-maple',
    planTitle: '冰岛极光摄影行',
    destination: '冰岛',
    days: 5,
    budgetLabel: '¥12,000',
    startDate: daysFromNow(21),
    message: '希望找会开车、能熬夜等极光的旅伴',
    status: 'open',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'seek-nomad-vn',
    userId: 'user-nomad',
    planTitle: '越南柬埔寨陆路穷游',
    destination: '越南',
    days: 7,
    budgetLabel: '¥2,800',
    message: '青旅拼房，接受搭车与夜巴',
    status: 'open',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'seek-roamly-hz',
    userId: 'user-roamly-demo',
    planTitle: '杭州西湖周末轻游',
    destination: '杭州',
    days: 2,
    budgetLabel: '¥600',
    startDate: daysFromNow(7),
    status: 'open',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
];
