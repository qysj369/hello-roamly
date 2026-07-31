import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildOriginAddressVariants,
  inferCityFromAddress,
  isPoiLikeOriginQuery,
} from '@/lib/map/inferCityFromAddress';
import { resolveKnownOriginFallback } from '@/lib/map/knownOriginFallbacks';
import { resolveKnownPlanLocationFallback } from '@/lib/map/knownPlanLocationFallbacks';
import type { ServerEnv } from '../../lib/deepseekServer';
import { serverResolveOriginAddress } from '../../lib/amapGeocodeServer';
import { sendJson } from '../../lib/http';

function readQueryAddress(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  const query = url.split('?')[1];
  if (!query) {
    return null;
  }
  const params = new URLSearchParams(query);
  const address = params.get('address')?.trim();
  return address || null;
}

/** GET /api/map/geocode-origin?address=... — 服务端地址解析（Web 服务 Key） */
export async function handleGeocodeOriginApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  const address = readQueryAddress(req.url);
  if (!address) {
    sendJson(res, 400, { error: '缺少 address 参数', code: 'invalid_params' });
    return;
  }

  const city = inferCityFromAddress(address);
  const variants = buildOriginAddressVariants(address);

  const planFallback =
    resolveKnownPlanLocationFallback(address, city) ??
    variants
      .map((variant) => resolveKnownPlanLocationFallback(variant, city))
      .find(Boolean);
  if (planFallback) {
    sendJson(res, 200, {
      label: planFallback.label,
      lng: planFallback.lng,
      lat: planFallback.lat,
      source: 'fallback',
    });
    return;
  }

  for (const variant of variants) {
    const known = resolveKnownOriginFallback(variant);
    if (known) {
      sendJson(res, 200, {
        label: known.label,
        lng: known.lng,
        lat: known.lat,
        source: 'fallback',
      });
      return;
    }
  }

  const directKnown = resolveKnownOriginFallback(address);
  if (directKnown) {
    sendJson(res, 200, {
      label: directKnown.label,
      lng: directKnown.lng,
      lat: directKnown.lat,
      source: 'fallback',
    });
    return;
  }

  for (const variant of variants) {
    if (isPoiLikeOriginQuery(variant)) {
      const fromServer = await serverResolveOriginAddress(variant, city, env);
      if (fromServer) {
        sendJson(res, 200, {
          label: fromServer.label,
          lng: fromServer.lng,
          lat: fromServer.lat,
          source: fromServer.source,
        });
        return;
      }
    }

    const fromGeo = await serverResolveOriginAddress(variant, city, env);
    if (fromGeo) {
      sendJson(res, 200, {
        label: fromGeo.label,
        lng: fromGeo.lng,
        lat: fromGeo.lat,
        source: fromGeo.source,
      });
      return;
    }
  }

  for (const variant of variants) {
    const fallback = resolveKnownOriginFallback(variant);
    if (fallback) {
      sendJson(res, 200, {
        label: fallback.label,
        lng: fallback.lng,
        lat: fallback.lat,
        source: 'fallback',
      });
      return;
    }
  }

  const fallback = resolveKnownOriginFallback(address);
  if (fallback) {
    sendJson(res, 200, {
      label: fallback.label,
      lng: fallback.lng,
      lat: fallback.lat,
      source: 'fallback',
    });
    return;
  }

  sendJson(res, 404, {
    error: '未找到该地址',
    code: 'address_not_found',
    hint: '请配置 AMAP_WEB_SERVICE_KEY，或使用「地图选出发地」',
  });
}
