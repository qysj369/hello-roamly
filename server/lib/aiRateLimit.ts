import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServerEnv } from './deepseekServer';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const dailyBuckets = new Map<string, Bucket>();
/** 短时连续撞限 → 临时拉黑，防恶意批量刷 */
const abuseBuckets = new Map<string, { strikes: number; blockedUntil: number; windowResetAt: number }>();

export type AiRateLimitKind = 'plan' | 'chat' | 'other';

function readPositiveInt(env: ServerEnv, key: string, fallback: number): number {
  const raw = env[key]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown';
  }
  return req.socket.remoteAddress?.replace(/^::ffff:/, '') || 'unknown';
}

/**
 * 可选用户维度：Authorization Bearer 前 24 字符作盐，与 IP 组合，
 * 避免单 IP 下多用户互相抢额度，同时限制单账号刷量。
 */
export function getAiClientKey(req: IncomingMessage): string {
  const ip = getClientIp(req);
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim();
    if (token.length >= 8) {
      return `${ip}:u:${token.slice(0, 24)}`;
    }
  }
  return ip;
}

export function classifyAiRoute(pathname: string): AiRateLimitKind {
  if (
    pathname.includes('generate-plan') ||
    pathname.includes('generate-guide') ||
    pathname.includes('generate-travel-plan') ||
    pathname.includes('companion-sketch') ||
    pathname.endsWith('/deepseek')
  ) {
    return 'plan';
  }
  if (
    pathname.includes('chat-stream') ||
    pathname.includes('continue-chat') ||
    pathname.includes('plan-tools')
  ) {
    return 'chat';
  }
  return 'other';
}

function limitForKind(env: ServerEnv, kind: AiRateLimitKind): number {
  if (kind === 'plan') {
    return readPositiveInt(env, 'AI_RATE_LIMIT_PLAN_PER_MIN', 3);
  }
  if (kind === 'chat') {
    return readPositiveInt(env, 'AI_RATE_LIMIT_CHAT_PER_MIN', 15);
  }
  return readPositiveInt(env, 'AI_RATE_LIMIT_OTHER_PER_MIN', 60);
}

function consumeBucket(
  store: Map<string, Bucket>,
  bucketKey: string,
  limit: number,
  windowMs: number,
  now: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const existing = store.get(bucketKey);
  if (!existing || now >= existing.resetAt) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true };
}

function checkAbuseBlock(
  env: ServerEnv,
  clientKey: string,
  now: number,
): { ok: true } | { ok: false; retryAfterSec: number; message: string } {
  const abuse = abuseBuckets.get(clientKey);
  if (!abuse) return { ok: true };
  if (now < abuse.blockedUntil) {
    const retryAfterSec = Math.max(1, Math.ceil((abuse.blockedUntil - now) / 1000));
    return {
      ok: false,
      retryAfterSec,
      message: `检测到异常批量请求，请 ${retryAfterSec} 秒后再试，以保障普通用户正常使用`,
    };
  }
  return { ok: true };
}

function registerLimitStrike(env: ServerEnv, clientKey: string, now: number): void {
  const strikeWindowMs = readPositiveInt(env, 'AI_RATE_LIMIT_ABUSE_WINDOW_MS', 60 * 60_000);
  const strikeLimit = readPositiveInt(env, 'AI_RATE_LIMIT_ABUSE_STRIKES', 8);
  const blockMs = readPositiveInt(env, 'AI_RATE_LIMIT_ABUSE_BLOCK_MS', 30 * 60_000);

  let abuse = abuseBuckets.get(clientKey);
  if (!abuse || now >= abuse.windowResetAt) {
    abuse = { strikes: 0, blockedUntil: 0, windowResetAt: now + strikeWindowMs };
    abuseBuckets.set(clientKey, abuse);
  }
  abuse.strikes += 1;
  if (abuse.strikes >= strikeLimit) {
    abuse.blockedUntil = now + blockMs;
    abuse.strikes = 0;
  }
}

/**
 * 进程内限流（单机 PM2 fork 足够）：
 * 1) 每分钟配额（plan/chat）
 * 2) 攻略生成每日免费上限（保障普通用户）
 * 3) 短时连续撞限 → 临时拉黑（防恶意批量刷）
 */
export function consumeAiRateLimit(
  env: ServerEnv,
  clientKey: string,
  kind: AiRateLimitKind,
): { ok: true } | { ok: false; retryAfterSec: number; message: string; code?: string } {
  const now = Date.now();

  const abuseBlock = checkAbuseBlock(env, clientKey, now);
  if (!abuseBlock.ok) {
    return { ...abuseBlock, code: 'abuse_blocked' };
  }

  if (kind === 'plan') {
    const dailyLimit = readPositiveInt(env, 'AI_RATE_LIMIT_PLAN_PER_DAY', 20);
    const dayMs = readPositiveInt(env, 'AI_RATE_LIMIT_DAY_MS', 24 * 60 * 60_000);
    const daily = consumeBucket(dailyBuckets, `day:plan:${clientKey}`, dailyLimit, dayMs, now);
    if (!daily.ok) {
      registerLimitStrike(env, clientKey, now);
      return {
        ok: false,
        retryAfterSec: daily.retryAfterSec,
        code: 'daily_plan_limit',
        message: `今日免费 AI 攻略次数已用完（每日 ${dailyLimit} 次），请明天再来；普通用户额度受此保护`,
      };
    }
  }

  const windowMs = readPositiveInt(env, 'AI_RATE_LIMIT_WINDOW_MS', 60_000);
  const limit = limitForKind(env, kind);
  const minute = consumeBucket(buckets, `${kind}:${clientKey}`, limit, windowMs, now);
  if (!minute.ok) {
    registerLimitStrike(env, clientKey, now);
    return {
      ok: false,
      retryAfterSec: minute.retryAfterSec,
      code: 'rate_limited',
      message:
        kind === 'plan'
          ? `生成过于频繁，请 ${minute.retryAfterSec} 秒后再试（每分钟最多 ${limit} 次）`
          : `请求过于频繁，请 ${minute.retryAfterSec} 秒后再试`,
    };
  }

  return { ok: true };
}

/** 若触发限流则写入 429 并返回 false；放行返回 true */
export function enforceAiRateLimit(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
  pathname: string,
): boolean {
  const kind = classifyAiRoute(pathname);
  if (kind === 'other') {
    return true;
  }

  const result = consumeAiRateLimit(env, getAiClientKey(req), kind);
  if (result.ok) {
    return true;
  }

  if (!res.headersSent) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Retry-After', String(result.retryAfterSec));
    res.end(
      JSON.stringify({
        error: result.message,
        code: result.code ?? 'rate_limited',
        retryAfterSec: result.retryAfterSec,
      }),
    );
  }
  return false;
}

/** 测试辅助：清空进程内计数 */
export function __resetAiRateLimitForTests(): void {
  buckets.clear();
  dailyBuckets.clear();
  abuseBuckets.clear();
}
