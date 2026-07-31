import { AI_CHAT_WELCOME_MESSAGE_ID } from '@/hooks/ai/useAiChat';
import type { AiChatMessage } from '@/types/domain/aiChat';
import type { TravelPlan } from '@/types/domain/travelPlan';
import {
  copyTextToClipboardSync,
  sharePlainText,
  type CopyTextResult,
  type ShareTextResult,
} from '@/utils/copyTextToClipboard';
import { formatTravelPlanItineraryText } from '@/utils/formatTravelPlanItineraryText';

export function formatAdvisorConversationForShare(messages: AiChatMessage[]): string {
  const lines: string[] = [];

  for (const message of messages) {
    if (message.role === 'assistant' && message.id === AI_CHAT_WELCOME_MESSAGE_ID) {
      continue;
    }
    if (message.status === 'streaming' || !message.content.trim()) {
      continue;
    }
    const label = message.role === 'user' ? '【我】' : '【蜗牛顾问】';
    lines.push(`${label}\n${message.content.trim()}`);
  }

  return lines.join('\n\n');
}

/** AI 顾问对话分享：同步复制，保留用户点击手势 */
export function shareAdvisorConversation(
  messages: AiChatMessage[],
  plan: TravelPlan | null,
): CopyTextResult {
  const text = plan
    ? formatTravelPlanItineraryText(plan)
    : formatAdvisorConversationForShare(messages);

  return copyTextToClipboardSync(text);
}

/** 分享顾问对话：桌面优先复制，移动端可唤起系统分享；失败时返回 failed */
export async function shareAdvisorContent(
  messages: AiChatMessage[],
  plan: TravelPlan | null,
): Promise<ShareTextResult> {
  const text = plan
    ? formatTravelPlanItineraryText(plan)
    : formatAdvisorConversationForShare(messages);

  const trimmed = text.trim();
  if (!trimmed) {
    return 'failed';
  }

  if (shareAdvisorConversation(messages, plan) === 'copied') {
    return 'copied';
  }

  return sharePlainText(trimmed, plan?.title?.trim() || '蜗牛旅行 · 顾问对话');
}
