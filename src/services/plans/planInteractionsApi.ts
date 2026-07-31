import {
  readPlanInteractionsStorage,
  writePlanInteractionsStorage,
  type StoredPlanInteractions,
} from '@/lib/storage/planInteractionsStorage';

const MUTATION_DELAY_MS = 120;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function fetchPlanInteractions(): Promise<StoredPlanInteractions> {
  return readPlanInteractionsStorage();
}

export async function togglePlanLikeApi(planId: string): Promise<StoredPlanInteractions> {
  // TODO: POST /plans/:id/like，以服务端为准；localStorage 仅作离线缓存
  await delay(MUTATION_DELAY_MS);
  const { liked, favorited } = readPlanInteractionsStorage();
  const nextLiked = liked.includes(planId) ? liked.filter((id) => id !== planId) : [...liked, planId];
  writePlanInteractionsStorage(nextLiked, favorited);
  return { liked: nextLiked, favorited };
}

export async function togglePlanFavoriteApi(planId: string): Promise<StoredPlanInteractions> {
  // TODO: POST /plans/:id/favorite，与点赞同样走后端
  await delay(MUTATION_DELAY_MS);
  const { liked, favorited } = readPlanInteractionsStorage();
  const nextFavorited = favorited.includes(planId)
    ? favorited.filter((id) => id !== planId)
    : [...favorited, planId];
  writePlanInteractionsStorage(liked, nextFavorited);
  return { liked, favorited };
}
