import type { ModerationResult } from '@/types/domain/contentModeration';

export class ContentModerationRejectedError extends Error {
  readonly result: ModerationResult;

  constructor(message: string, result: ModerationResult) {
    super(message);
    this.name = 'ContentModerationRejectedError';
    this.result = result;
  }
}
