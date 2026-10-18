/**
 * 用户反馈 API（内测质量保障入口）
 * POST /api/feedback — 收集城市信息错误、攻略问题、交互 bug
 * 进程内落盘日志；后续可接工单/邮件，不阻塞免费基座。
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getClientIp } from '../lib/aiRateLimit';

export type FeedbackCategory = 'city_error' | 'guide_issue' | 'ui_bug' | 'other';

const CATEGORY_SET = new Set<FeedbackCategory>([
  'city_error',
  'guide_issue',
  'ui_bug',
  'other',
]);

type FeedbackBody = {
  category?: string;
  message?: string;
  city?: string;
  page?: string;
  contact?: string;
};

const recentByIp = new Map<string, { count: number; resetAt: number }>();

function readJsonBody(req: IncomingMessage): Promise<FeedbackBody> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      if (chunks.reduce((n, c) => n + c.length, 0) > 32_000) {
        reject(new Error('payload_too_large'));
      }
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8') || '{}';
        resolve(JSON.parse(raw) as FeedbackBody);
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function consumeFeedbackRate(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60_000;
  const limit = 8;
  const existing = recentByIp.get(ip);
  if (!existing || now >= existing.resetAt) {
    recentByIp.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

async function persistFeedback(row: Record<string, unknown>): Promise<void> {
  const dir = path.resolve(process.cwd(), 'logs');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, 'feedback.jsonl');
  await appendFile(file, `${JSON.stringify(row)}\n`, 'utf8');
}

export async function handleFeedbackApi(
  req: IncomingMessage,
  res: ServerResponse,
  _rootDir?: string,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method Not Allowed', code: 'method_not_allowed' });
    return;
  }

  const ip = getClientIp(req);
  if (!consumeFeedbackRate(ip)) {
    json(res, 429, {
      error: '反馈提交过于频繁，请稍后再试',
      code: 'rate_limited',
    });
    return;
  }

  let body: FeedbackBody;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'invalid_json';
    json(res, 400, { error: '请求格式无效', code });
    return;
  }

  const category = (body.category ?? '').trim() as FeedbackCategory;
  const message = (body.message ?? '').trim();
  if (!CATEGORY_SET.has(category)) {
    json(res, 400, {
      error: '请选择反馈类型',
      code: 'invalid_category',
    });
    return;
  }
  if (message.length < 8 || message.length > 2000) {
    json(res, 400, {
      error: '请填写 8–2000 字的具体说明',
      code: 'invalid_message',
    });
    return;
  }

  const row = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ip,
    category,
    message,
    city: body.city?.trim().slice(0, 40) || null,
    page: body.page?.trim().slice(0, 200) || null,
    contact: body.contact?.trim().slice(0, 120) || null,
  };

  try {
    await persistFeedback(row);
  } catch (error) {
    console.error('[feedback] persist failed', error);
    json(res, 500, { error: '反馈暂存失败，请稍后重试', code: 'persist_failed' });
    return;
  }

  console.info('[feedback]', row.category, row.id);
  json(res, 200, {
    ok: true,
    id: row.id,
    message: '感谢反馈，我们会用于持续迭代城市文案、攻略与交互。',
  });
}
