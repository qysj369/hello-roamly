import { createHash, randomBytes } from 'node:crypto';

type TicketCache = { ticket: string; expiresAt: number };

let ticketCache: TicketCache | null = null;

export function isAllowedWechatJsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const local = host === 'localhost' || host === '127.0.0.1';
    if (local) {
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    if (parsed.protocol !== 'https:') return false;
    return host === 'helloroamly.com' || host === 'www.helloroamly.com';
  } catch {
    return false;
  }
}

export function signWechatJsConfig(
  ticket: string,
  url: string,
  nonceStr: string,
  timestamp: number,
): string {
  const plain = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  return createHash('sha1').update(plain).digest('hex');
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`wechat_http_${response.status}`);
  }
  return (await response.json()) as Record<string, unknown>;
}

async function getJsapiTicket(appId: string, secret: string): Promise<string> {
  const now = Date.now();
  if (ticketCache && ticketCache.expiresAt > now + 60_000) {
    return ticketCache.ticket;
  }

  const tokenPayload = await fetchJson(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appId)}&secret=${encodeURIComponent(secret)}`,
  );
  const accessToken = String(tokenPayload.access_token ?? '').trim();
  if (!accessToken) {
    throw new Error('wechat_token_missing');
  }

  const ticketPayload = await fetchJson(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(accessToken)}&type=jsapi`,
  );
  const ticket = String(ticketPayload.ticket ?? '').trim();
  const expiresIn = Number(ticketPayload.expires_in) || 7200;
  if (!ticket) {
    throw new Error('wechat_ticket_missing');
  }

  ticketCache = { ticket, expiresAt: now + Math.max(60, expiresIn - 200) * 1000 };
  return ticket;
}

export type WechatJsConfig = {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
};

export async function createWechatJsConfig(pageUrl: string): Promise<WechatJsConfig | null> {
  const appId = process.env.WECHAT_APP_ID?.trim();
  const secret = process.env.WECHAT_APP_SECRET?.trim();
  if (!appId || !secret) return null;

  const url = pageUrl.split('#')[0] ?? pageUrl;
  const ticket = await getJsapiTicket(appId, secret);
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = randomBytes(8).toString('hex');
  return {
    appId,
    timestamp,
    nonceStr,
    signature: signWechatJsConfig(ticket, url, nonceStr, timestamp),
  };
}
