import { ensureCuratedPublishedGuidesSeeded } from '@/services/guides/seedCuratedGuides';
import type { PublishedGuideRecord } from '@/types/domain/guidePublish';

export function fetchPublishedGuideRecord(id: string): PublishedGuideRecord | undefined {
  return ensureCuratedPublishedGuidesSeeded().find((item) => item.id === id);
}
