import type { UserBadge } from '@/types/domain/user/userProfile';

/** 徽章展示元数据（图标名对应 lucide 组件） */
export type TravelBadgeMeta = {
  icon: 'award' | 'globe' | 'utensils' | 'camera' | 'users' | 'sparkles' | 'badge-check';
  accent: string;
};

export const TRAVEL_BADGE_META: Record<string, TravelBadgeMeta> = {
  'badge-first-plan': { icon: 'sparkles', accent: 'from-cyan-500/15 to-cyan-600/5 text-cyan-800' },
  'badge-slime-trail': { icon: 'sparkles', accent: 'from-emerald-500/15 to-emerald-600/5 text-emerald-800' },
  'badge-shell-sage': { icon: 'award', accent: 'from-teal-500/15 to-teal-600/5 text-teal-800' },
  'badge-3-countries': { icon: 'globe', accent: 'from-emerald-500/15 to-emerald-600/5 text-emerald-800' },
  'badge-foodie': { icon: 'utensils', accent: 'from-amber-500/15 to-amber-600/5 text-amber-800' },
  'badge-companion': { icon: 'users', accent: 'from-violet-500/15 to-violet-600/5 text-violet-800' },
  'badge-creator': { icon: 'camera', accent: 'from-rose-500/15 to-rose-600/5 text-rose-800' },
  'badge-verified': { icon: 'badge-check', accent: 'from-brand-500/15 to-brand-600/5 text-brand-800' },
  'badge-polar': { icon: 'award', accent: 'from-indigo-500/15 to-indigo-600/5 text-indigo-800' },
  'badge-inviter': { icon: 'users', accent: 'from-amber-500/15 to-amber-600/5 text-amber-800' },
};

export const DEMO_USER_BADGES: Record<string, UserBadge[]> = {
  'user-roamly-demo': [
    {
      id: 'badge-slime-trail',
      label: '轨迹新秀',
      kind: 'custom',
      description: '留下第一条黏液轨迹',
    },
    {
      id: 'badge-first-plan',
      label: '首条蜗壳',
      kind: 'custom',
      description: '发布第一条 AI 漫行计划',
    },
    {
      id: 'badge-3-countries',
      label: '三国慢爬',
      kind: 'explorer',
      description: '足迹覆盖 3 个国家/地区',
    },
    {
      id: 'badge-foodie',
      label: '宝藏猎人',
      kind: 'custom',
      description: '擅长挖掘平价地道美食',
    },
    {
      id: 'badge-inviter',
      label: '蜗友召集',
      kind: 'custom',
      description: '成功邀请好友加入蜗牛社区',
    },
  ],
  'user-maple': [
    {
      id: 'badge-creator',
      label: '轨迹主',
      kind: 'creator',
      description: '认证黏液轨迹创作者',
    },
    {
      id: 'badge-polar',
      label: '极光见证',
      kind: 'custom',
      description: '完成极地摄影行程',
    },
    {
      id: 'badge-verified',
      label: '已认证',
      kind: 'verified',
      description: '完成实名认证',
    },
  ],
  'user-nomad': [
    {
      id: 'badge-companion',
      label: '旅伴蜗友',
      kind: 'companion',
      description: '成功匹配 5 次同行蜗友',
    },
    {
      id: 'badge-3-countries',
      label: '三国行者',
      kind: 'explorer',
      description: '足迹覆盖 3 个国家/地区',
    },
  ],
};
