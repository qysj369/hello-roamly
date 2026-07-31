import { resolveCityCoverUrl } from '@/data/cityCoverImages';

import { resolveRemoteImageUrl } from '@/lib/cdn';



/** 目的地封面图（与首页城市卡片共用映射；配置 VITE_IMAGE_CDN 后走国内代理） */

export function getTravelPlanCover(

  guideId: string,

  destination: string,

): { url?: string; alt: string } {

  const url =

    resolveCityCoverUrl(destination, { width: 560 }) ??

    resolveCityCoverUrl(guideId, { width: 560 });

  return {

    url: url ? resolveRemoteImageUrl(url, { width: 560 }) : undefined,

    alt: `${destination} 目的地`,

  };

}

