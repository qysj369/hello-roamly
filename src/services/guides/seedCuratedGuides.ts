import {
  CURATED_SEED_PUBLISHED_GUIDES,
  mergeCuratedSeedPublishedGuides,
} from '@/data/seedPublishedGuides';
import type { PublishedGuideRecord } from '@/types/domain/guidePublish';
import { awardGuidePublished } from '@/services/contribution/awardContribution';
import {
  readPublishedGuidesFromStorage,
  writePublishedGuidesToStorage,
} from '@/stores/publishedGuides/storage';

const SEED_MARKER_KEY = 'hello-roamly:curated-guides-seeded-v1';

function readSeedMarker(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(SEED_MARKER_KEY) === '1';
}

function writeSeedMarker(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(SEED_MARKER_KEY, '1');
}

/** 首次访问时注入精选真实攻略，并给作者加发布贡献分 */
export function ensureCuratedPublishedGuidesSeeded(): PublishedGuideRecord[] {
  const existing = readPublishedGuidesFromStorage();
  const { items, added } = mergeCuratedSeedPublishedGuides(existing);

  if (added.length > 0) {
    writePublishedGuidesToStorage(items);
    for (const record of added) {
      awardGuidePublished(record.authorId);
    }
    writeSeedMarker();
  } else if (!readSeedMarker() && items.length > 0) {
    writeSeedMarker();
  }

  return items;
}

export { CURATED_SEED_PUBLISHED_GUIDES };
