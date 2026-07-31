const STORAGE_KEY = 'roamly-contribution-scores-v1';

export type ContributionScoreMap = Record<string, number>;

export function readContributionScoresFromStorage(): ContributionScoreMap {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as ContributionScoreMap;
  } catch {
    return {};
  }
}

export function writeContributionScoresToStorage(scores: ContributionScoreMap): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}
