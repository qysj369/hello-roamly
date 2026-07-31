import type { ContentModerationScene } from '@/types/domain/contentModeration';

export type ContentSceneMeta = {
  id: ContentModerationScene;
  label: string;
  description: string;
};

export const CONTENT_MODERATION_SCENES: ContentSceneMeta[] = [
  {
    id: 'ai_chat',
    label: 'AI 对话',
    description: '用户发给旅行顾问的提问与补充说明',
  },
  {
    id: 'site_chat',
    label: '站内私信',
    description: '旅伴匹配与消息列表中的用户消息',
  },
  {
    id: 'travel_moment',
    label: '旅行瞬间',
    description: '图文动态标题与正文（发布流程接入）',
  },
  {
    id: 'profile_bio',
    label: '个人简介',
    description: '昵称、签名等资料字段',
  },
  {
    id: 'comment',
    label: '评论',
    description: '攻略与动态下的评论内容',
  },
];

export function getContentSceneLabel(scene: ContentModerationScene): string {
  return CONTENT_MODERATION_SCENES.find((item) => item.id === scene)?.label ?? scene;
}
