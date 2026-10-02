import { extractSearchParams } from '@/lib/home/extractSearchParams';

/** 首页文字搜索第一步：只校验 + 打日志，不调模型、不追问、不渲染行程 */

export const HOME_SEARCH_EMPTY_HINT = '请输入你想去的目的地';
export const HOME_SEARCH_LOADING_TEXT = '正在为你生成行程';
export const HOME_SEARCH_FAIL_HINT = '网络超时，请重新搜索';

export function validateHomeSearchInput(
  raw: string,
): { ok: true; query: string } | { ok: false; hint: string } {
  const query = raw.trim();
  if (!query) {
    return { ok: false, hint: HOME_SEARCH_EMPTY_HINT };
  }
  return { ok: true, query };
}

/** 验证提交链路：打印原文 + 结构化抽取，后续步骤再接接口 */
export async function recordHomeSearchSubmit(query: string): Promise<void> {
  const extracted = extractSearchParams(query);
  console.info('[home-search] submit', query);
  console.info('[home-search] extract', extracted);
  await new Promise((resolve) => {
    globalThis.setTimeout(resolve, 400);
  });
}
