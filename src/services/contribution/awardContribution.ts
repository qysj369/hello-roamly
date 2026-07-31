import { CONTRIBUTION_SCORE_RULES } from '@/lib/config/contributionScore';
import { findUserById } from '@/data/findUserById';
import {
  resolveMomentAuthorUserId,
  resolvePlanCreatorUserId,
} from '@/services/contribution/resolveInteractionRecipient';
import { awardContributionPoints } from '@/stores/contributionScore/store';
import type { UserId } from '@/types/domain/user/userId';

function baseScoreForUser(userId: UserId): number {
  return findUserById(userId)?.contributionScore ?? 0;
}

export function awardGuidePublished(userId: UserId): number {
  return awardContributionPoints(
    userId,
    CONTRIBUTION_SCORE_RULES.publishGuide,
    baseScoreForUser(userId),
  );
}

export function awardSaltReceived(userId: UserId): number {
  return awardContributionPoints(
    userId,
    CONTRIBUTION_SCORE_RULES.receiveSalt,
    baseScoreForUser(userId),
  );
}

export function awardShellKeepReceived(userId: UserId): number {
  return awardContributionPoints(
    userId,
    CONTRIBUTION_SCORE_RULES.receiveShellKeep,
    baseScoreForUser(userId),
  );
}

export function awardPlanSaltIfLiked(planId: string, isNowLiked: boolean): void {
  if (!isNowLiked) {
    return;
  }
  const recipientId = resolvePlanCreatorUserId(planId);
  if (recipientId) {
    awardSaltReceived(recipientId);
  }
}

export function awardPlanShellKeepIfFavorited(planId: string, isNowFavorited: boolean): void {
  if (!isNowFavorited) {
    return;
  }
  const recipientId = resolvePlanCreatorUserId(planId);
  if (recipientId) {
    awardShellKeepReceived(recipientId);
  }
}

export function awardMomentSaltIfLiked(momentId: string, isNowLiked: boolean): void {
  if (!isNowLiked) {
    return;
  }
  const recipientId = resolveMomentAuthorUserId(momentId);
  if (recipientId) {
    awardSaltReceived(recipientId);
  }
}
