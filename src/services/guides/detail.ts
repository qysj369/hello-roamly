import { demoGuides } from '@/data/demoGuides';
import { ensureCuratedPublishedGuidesSeeded } from '@/services/guides/seedCuratedGuides';
import { http } from '@/lib/api/http';
import { readEnv } from '@/lib/config/env';
import { GUIDES_API } from '@/services/guides/paths';
import type { Guide } from '@/types/domain/guide';
import { publishedRecordToGuide } from '@/utils/guidePublishDraft';

/** 攻略详情：有 VITE_API_BASE_URL 时请求后端，否则从 demo / 本地发布查找 */
export async function fetchGuideDetail(id: string): Promise<Guide> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error('攻略 id 不能为空');
  }

  if (!readEnv('VITE_API_BASE_URL')) {
    const published = ensureCuratedPublishedGuidesSeeded().find((item) => item.id === trimmedId);
    if (published) {
      return publishedRecordToGuide(published);
    }
    const guide = demoGuides.find((item) => item.id === trimmedId);
    if (!guide) {
      throw new Error(`攻略不存在：${trimmedId}`);
    }
    return { ...guide, kind: 'template' };
  }

  const { data } = await http.get<Guide>(GUIDES_API.detail(trimmedId));
  return data;
}
