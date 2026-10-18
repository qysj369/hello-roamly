import type { IncomingMessage, ServerResponse } from 'node:http';
import { sendJson } from '../../lib/http';
import { createWechatJsConfig, isAllowedWechatJsUrl } from '../../lib/wechatJsSdk';

/** GET /api/wechat/js-config?url= — 微信内置浏览器 JS-SDK 签名；未配公众号则 enabled=false */
export async function handleWechatJsConfigApi(
  req: IncomingMessage,
  res: ServerResponse,
  _rootDir?: string,
): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  const query = (req.url ?? '').split('?')[1] ?? '';
  const pageUrl = new URLSearchParams(query).get('url')?.trim() ?? '';
  if (!pageUrl || !isAllowedWechatJsUrl(pageUrl)) {
    sendJson(res, 400, { enabled: false, error: 'invalid_url' });
    return;
  }

  try {
    const config = await createWechatJsConfig(pageUrl);
    if (!config) {
      sendJson(res, 200, { enabled: false });
      return;
    }
    sendJson(res, 200, { enabled: true, ...config });
  } catch {
    sendJson(res, 200, { enabled: false });
  }
}
