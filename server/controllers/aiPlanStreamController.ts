import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GenerateMapPlanRequest } from '@/types/api/mapGeneratePlan';
import {
  finalizeMapPlanContent,
  isMapPlanDeliverable,
} from '@/lib/plan/mapPlanCompleteness';
import { isCoordinateLikeLocationName, compactGeocodeLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import { isLikelyAdminGeocodeLabel, extractMultiStopDestinations } from '@/lib/map/travelQueryParsing';
import {
  resolveDefaultOriginName,
  resolveEffectiveSearchQuery,
} from '@/lib/map/resolveEffectivePlanRequest';
import { resolveMapPlanContextAsync } from '@/lib/map/resolveMapPlanContext';
import { createServerGeocodePlaceFn } from '../lib/resolveTravelPlacesServer';
import { isValidMapPlanRequest } from './aiPlanController';
import { generateCompleteMapPlanStream } from '../lib/mapPlanStreamPipeline';
import {
  isServerDeepSeekStreamConfigured,
} from '../lib/deepseekStreamServer';
import { createServerDeepSeekCompleter, type ServerEnv } from '../lib/deepseekServer';
import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';
import {
  auditSnailPlanOutput,
  resolveSnailPlanAuditLock,
} from '@/lib/home/snailPlanOutputAudit';
import { generateMapPlanFromModel } from '@/services/ai/runMapPlanGeneration';
import { buildSnailAuditRepairPrompt } from '@/services/ai/prompts/mapPlanGeneration';
import { applySnailPlanAuditRepairs } from '@/lib/home/snailPlanAuditRepair';
import { serverReverseGeocode } from '../lib/reverseGeocodeServer';
import { endSse, initSseResponse, writeSseEvent } from '../lib/sse';

async function resolvePlanLocationName(
  body: GenerateMapPlanRequest,
  env: ServerEnv,
): Promise<string> {
  const clientLocation = body.locationName?.trim();
  const serverLocation = await serverReverseGeocode(body.lng, body.lat, env);
  if (clientLocation && !isCoordinateLikeLocationName(clientLocation)) {
    if (clientLocation.includes('→') && !isLikelyAdminGeocodeLabel(clientLocation)) {
      return clientLocation;
    }
    return compactGeocodeLabelForDisplay(clientLocation);
  }
  if (serverLocation) {
    return compactGeocodeLabelForDisplay(serverLocation);
  }
  return '所选地点';
}

/** POST /api/ai/generate-plan-stream — 两阶段 SSE，保证四段完整后 done */
export async function streamMapPlan(
  body: GenerateMapPlanRequest,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (!isServerDeepSeekStreamConfigured(env)) {
    initSseResponse(res);
    writeSseEvent(res, 'error', {
      message: 'DeepSeek 未配置',
      code: 'deepseek_unconfigured',
    });
    endSse(res);
    return;
  }

  const baseLocationName = await resolvePlanLocationName(body, env);
  const trimmedQuery = body.query.trim();
  const effectiveSearchQuery = resolveEffectiveSearchQuery({
    searchQuery: body.searchQuery,
    initialQuery: body.initialQuery,
    rawQuery: trimmedQuery,
  });
  const multiStopsPreview = extractMultiStopDestinations(effectiveSearchQuery);
  const originName =
    body.originName?.trim() ||
    resolveDefaultOriginName(multiStopsPreview.length) ||
    null;

  const planContext = await resolveMapPlanContextAsync(trimmedQuery, baseLocationName, {
    searchQuery: effectiveSearchQuery,
    initialQuery: body.initialQuery,
    originName,
    geocode: createServerGeocodePlaceFn(env),
  });
  const locationName = planContext.locationName;
  const planQuery = planContext.query;

  initSseResponse(res);
  const abortController = new AbortController();
  const onClientClose = () => abortController.abort();
  res.on('close', onClientClose);

  const keepalive = setInterval(() => {
    if (!res.writableEnded && !abortController.signal.aborted) {
      writeSseEvent(res, 'ping', {});
    }
  }, 12_000);

  try {
    let content = await generateCompleteMapPlanStream({
      env,
      locationName,
      query: planQuery,
      lng: body.lng,
      lat: body.lat,
      originName: originName,
      signal: abortController.signal,
      onDelta: (text) => {
        if (!res.writableEnded) {
          writeSseEvent(res, 'delta', { text });
        }
      },
      onStatus: (message) => {
        if (!res.writableEnded) {
          writeSseEvent(res, 'status', { message });
        }
      },
      onSync: (text) => {
        if (!res.writableEnded && text.trim()) {
          writeSseEvent(res, 'sync', { text });
        }
      },
    });

    if (abortController.signal.aborted || res.writableEnded) {
      return;
    }

    const auditLock = resolveSnailPlanAuditLock(locationName, planQuery, originName);
    let finalized = scrubPlanDisplayMarkup(
      applySnailPlanAuditRepairs(
        scrubPlanDisplayMarkup(
          finalizeMapPlanContent(content, locationName, originName, effectiveSearchQuery),
        ),
        auditLock,
      ),
    );
    const firstAudit = auditSnailPlanOutput(finalized, auditLock);
    if (!firstAudit.ok) {
      console.error('[snail-plan-audit]', JSON.stringify(firstAudit.issues));
      writeSseEvent(res, 'status', { message: '攻略未通过校验，正在重新生成…' });
      const completer = createServerDeepSeekCompleter(env);
      if (completer) {
        try {
          const regenerated = await generateMapPlanFromModel(
            {
              lng: body.lng,
              lat: body.lat,
              query: planQuery,
              locationName,
              originName,
            },
            completer,
            planQuery,
            locationName,
            buildSnailAuditRepairPrompt(firstAudit.issues),
          );
          if (regenerated.trim()) {
            finalized = scrubPlanDisplayMarkup(
              applySnailPlanAuditRepairs(
                scrubPlanDisplayMarkup(
                  finalizeMapPlanContent(regenerated, locationName, originName, effectiveSearchQuery),
                ),
                auditLock,
              ),
            );
            if (!res.writableEnded) {
              writeSseEvent(res, 'sync', { text: finalized });
            }
          }
        } catch (retryError) {
          const detail = retryError instanceof Error ? retryError.message : '未知错误';
          console.error('[snail-plan-retry]', detail);
          writeSseEvent(res, 'status', {
            message: '重新生成未完成，先保留本次攻略',
          });
        }
      }
    }

    if (!isMapPlanDeliverable(finalized)) {
      writeSseEvent(res, 'error', {
        message: '方案内容为空，请重新点击一键规划',
        code: 'plan_incomplete',
      });
      endSse(res);
      return;
    }

    writeSseEvent(res, 'done', {
      locationName,
      contentLength: finalized.length,
      content: finalized,
    });
    endSse(res);
  } catch (error) {
    if (res.writableEnded) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式规划失败';
    const code = abortController.signal.aborted ? 'aborted' : 'stream_failed';
    writeSseEvent(res, 'error', { message, code });
    endSse(res);
  } finally {
    clearInterval(keepalive);
    res.off('close', onClientClose);
  }
}

export async function handleMapPlanStreamFromRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
  body: unknown,
): Promise<void> {
  if (!isValidMapPlanRequest(body)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: '请求参数无效', code: 'invalid_params' }));
    return;
  }

  await streamMapPlan(body, res, env);
}
