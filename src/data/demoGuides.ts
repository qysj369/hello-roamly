import type { Guide } from '@/types/domain/guide';

export const demoGuides: Guide[] = [
  {
    id: 'chengdu',
    city: '成都',
    title: '锦里 · 宽窄巷子步行一日',
    budget: '约 ¥80',
    days: '1 天',
    tags: ['美食', '步行'],
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
  {
    id: 'xian',
    city: '西安',
    title: '城墙骑行 + 回民街小吃',
    budget: '约 ¥120',
    days: '1–2 天',
    tags: ['历史', '骑行'],
    updatedAt: '2026-05-14T12:30:00.000Z',
  },
  {
    id: 'xiamen',
    city: '厦门',
    title: '鼓浪屿轮渡漫行半日',
    budget: '约 ¥60',
    days: '半天',
    tags: ['海岛', '摄影'],
    updatedAt: '2026-05-17T06:15:00.000Z',
  },
  {
    id: 'hangzhou',
    city: '杭州',
    title: '西湖环线公交 + 免费步道',
    budget: '约 ¥40',
    days: '1 天',
    tags: ['自然', '公交'],
    updatedAt: '2026-05-18T16:45:00.000Z',
  },
];
