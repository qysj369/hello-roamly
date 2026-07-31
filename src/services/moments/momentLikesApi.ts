import {
  readMomentLikesStorage,
  writeMomentLikesStorage,
} from '@/lib/storage/momentLikesStorage';

const TOGGLE_LIKE_DELAY_MS = 120;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchMomentLikes(): Promise<string[]> {
  return readMomentLikesStorage();
}

/** 切换点赞（演示 API；乐观更新在 mutation 层处理） */
export async function toggleMomentLikeApi(momentId: string): Promise<string[]> {
  // TODO: POST /moments/:id/like，返回最新 likeCount；勿仅写 localStorage
  await delay(TOGGLE_LIKE_DELAY_MS);
  const current = readMomentLikesStorage();
  const next = current.includes(momentId)
    ? current.filter((id) => id !== momentId)
    : [...current, momentId];
  writeMomentLikesStorage(next);
  return next;
}
