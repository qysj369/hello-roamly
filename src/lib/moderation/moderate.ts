import { isContentModerationEnabled, isContentModerationStrict } from '@/lib/moderation/config';
import { ContentModerationRejectedError } from '@/lib/moderation/errors';
import { checkContentModeration } from '@/services/moderation/moderationApi';
import type { ModerateContentInput, ModerationResult } from '@/types/domain/contentModeration';

const DEFAULT_REJECT_MESSAGE = '内容未通过安全审核，请修改后重试';

/** 审核用户文本；未启用时直接 pass */
export async function moderateUserContent(input: ModerateContentInput): Promise<ModerationResult> {
  return checkContentModeration(input);
}

/** 未通过时抛出 ContentModerationRejectedError */
export async function assertContentAllowed(input: ModerateContentInput): Promise<ModerationResult> {
  const result = await moderateUserContent(input);

  if (result.decision === 'reject') {
    throw new ContentModerationRejectedError(result.message ?? DEFAULT_REJECT_MESSAGE, result);
  }

  if (result.decision === 'review' && isContentModerationStrict()) {
    throw new ContentModerationRejectedError(
      result.message ?? '内容待人工复核，请稍后再试',
      result,
    );
  }

  return result;
}

export function isModerationActive(): boolean {
  return isContentModerationEnabled();
}
