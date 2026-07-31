import { demoGuides } from '@/data/demoGuides';
import { ensureCuratedPublishedGuidesSeeded } from '@/services/guides/seedCuratedGuides';
import { http } from '@/lib/api/http';
import { readEnv } from '@/lib/config/env';
import { filterGuides } from '@/services/guides/filter';
import { GUIDES_API } from '@/services/guides/paths';
import type { ListGuidesParams, ListGuidesResponse } from '@/types/api/guides';

function listFromDemo(params: ListGuidesParams): ListGuidesResponse {
  const published = ensureCuratedPublishedGuidesSeeded().map((item) => item.listMeta);
  const merged = [...published, ...demoGuides];
  const items = filterGuides(merged, params.q);
  const limit = params.limit ?? items.length;
  const page = params.page ?? 1;
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return {
    items: pageItems,
    total: items.length,
    page,
    limit,
  };
}

/** 攻略列表：有 VITE_API_BASE_URL 时请求后端，否则用本地 demo 数据 */
export async function fetchGuideList(params: ListGuidesParams = {}): Promise<ListGuidesResponse> {
  if (!readEnv('VITE_API_BASE_URL')) {
    return listFromDemo(params);
  }

  const { data } = await http.get<ListGuidesResponse>(GUIDES_API.list, {
    params: {
      q: params.q?.trim() || undefined,
      page: params.page,
      limit: params.limit,
    },
  });

  return data;
}
