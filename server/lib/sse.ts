import type { ServerResponse } from 'node:http';

/** 初始化 SSE 响应头（顾问对话流式输出） */
export function initSseResponse(res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}

export function writeSseEvent(res: ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  const flushable = res as ServerResponse & { flush?: () => void };
  flushable.flush?.();
}

export function endSse(res: ServerResponse): void {
  res.end();
}
