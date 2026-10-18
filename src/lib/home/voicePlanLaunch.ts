import { resolveHomePlanSearchFields } from '@/lib/home/resolveHomePlanSearchFields';
import { composePlanClarifyQuery, type PlanClarifyFields } from '@/stores/planClarify/store';

/**
 * 语音与文字共用解析：缺天数/人数/预算保持 null，禁止默填 2天/单人/1500。
 * 没有目的地时返回 null，交给澄清弹窗追问。
 */
export function resolveVoicePlanFields(
  raw: string,
  destination?: string,
): PlanClarifyFields | null {
  const fields = resolveHomePlanSearchFields(raw, destination);
  if (!fields.city?.trim()) {
    return null;
  }
  return fields;
}

export function composeVoicePlanQuery(fields: PlanClarifyFields, baseQuery: string): string {
  return composePlanClarifyQuery(fields, baseQuery);
}
