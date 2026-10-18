import { HOLO_HOME_CITY_KIT } from '@/data/holoHotCityKit';
import { downloadBlobsSequential } from '@/lib/share/download';
import type { InviteSummary } from '@/types/domain/invite';

export const CITY_INSPIRATION_PACK_REWARD_ID = 'reward-invite-city-pack';

/** 邀请 1 位好友注册后可下载的高清城市灵感图（本城 kit，不含外链图库） */
export function listCityInspirationPackPhotos(): string[] {
  const seen = new Set<string>();
  const paths: string[] = [];
  for (const city of HOLO_HOME_CITY_KIT) {
    for (const src of [city.coverPath, ...city.spots.map((spot) => spot.photoPath)]) {
      const path = src.trim();
      if (!path || seen.has(path)) continue;
      seen.add(path);
      paths.push(path);
      if (paths.length >= 18) return paths;
    }
  }
  return paths;
}

export function isCityInspirationPackUnlocked(summary: InviteSummary): boolean {
  const reward = summary.rewards.find((item) => item.id === CITY_INSPIRATION_PACK_REWARD_ID);
  return reward?.status === 'granted' || summary.invitedCount >= 1;
}

export async function downloadCityInspirationPack(): Promise<void> {
  const paths = listCityInspirationPackPhotos();
  const blobs: Blob[] = [];
  for (const src of paths) {
    const response = await fetch(src);
    if (!response.ok) continue;
    blobs.push(await response.blob());
  }
  if (!blobs.length) {
    throw new Error('素材包暂时下不下来，请稍后再试');
  }
  await downloadBlobsSequential(blobs, (index, total) => `snail-city-inspire-${index + 1}-of-${total}.jpg`);
}
