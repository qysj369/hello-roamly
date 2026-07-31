/**
 * 内容安全 API（由后端对接阿里云 / 腾讯云 / 网易易盾等，密钥仅存服务端）。
 *
 * - POST /moderation/check     文本同步审核
 * - POST /moderation/image     图片审核（可选）
 * - POST /moderation/callback  异步审核回调（可选）
 */
export const MODERATION_API = {
  check: '/moderation/check',
  image: '/moderation/image',
  callback: '/moderation/callback',
} as const;
