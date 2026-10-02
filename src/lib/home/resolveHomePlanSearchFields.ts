import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import {
  inferBareCityLabel,
  sanitizeClarifyCityLabel,
  type PlanClarifyFields,
} from '@/stores/planClarify/store';

export function parseHomePlanParty(text: string): string | null {
  if (/亲子|带娃|小孩|孩子|宝宝/.test(text)) return '亲子';
  if (/情侣|两口|夫妻|蜜月/.test(text)) return '情侣';
  if (/好友|朋友|结伴|同学|同事/.test(text)) return '好友结伴';
  if (/单人|一个人|独自|一人行/.test(text)) return '单人';
  return null;
}

export function parseHomePlanPreference(text: string): string | null {
  if (/亲子时光|带娃出行|带小孩|家庭出游/.test(text)) return '亲子时光';
  if (/美食探店|探店|觅食|海鲜|美食/.test(text)) return '美食探店';
  if (/城市人文|人文慢逛|古巷|老街|博物馆/.test(text)) return '城市人文';
  if (/自然风光|自然山水|风景|海景|徒步|山水/.test(text)) return '自然风光';
  if (/近郊轻游|周末轻游|近郊/.test(text)) return '近郊轻游';
  return null;
}

export function parseHomePlanPace(text: string): string | null {
  if (/高效打卡|赶场|打卡满/.test(text)) return '高效打卡';
  if (/松弛|慢逛|慢慢逛/.test(text)) return '松弛慢逛';
  return null;
}

export function parseHomePlanDays(text: string): number | null {
  const days = parseTravelSearchIntent(text).days;
  if (days == null || !Number.isFinite(days)) return null;
  const rounded = Math.round(days);
  return rounded >= 1 && rounded <= 14 ? rounded : null;
}

export function parseHomePlanBudget(text: string): number | null {
  const raw = parseTravelSearchIntent(text).budgetYuan;
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

export function parseHomePlanCity(text: string, destination?: string): string | null {
  return (
    sanitizeClarifyCityLabel(destination) ||
    sanitizeClarifyCityLabel(parseTravelSearchIntent(text || destination || '').destinationHint) ||
    inferBareCityLabel(text) ||
    null
  );
}

/** 从搜索框 / 语音原文抽出五项；缺的保持 null，禁止默填 */
export function resolveHomePlanSearchFields(
  raw: string,
  destination?: string,
): PlanClarifyFields {
  const trimmed = raw.trim();
  return {
    city: parseHomePlanCity(trimmed, destination),
    days: parseHomePlanDays(trimmed),
    party: parseHomePlanParty(trimmed),
    pace: parseHomePlanPace(trimmed),
    budgetYuan: parseHomePlanBudget(trimmed),
    preference: parseHomePlanPreference(trimmed),
  };
}

/** 生成门槛：目的地 + 人数 + 天数 + 预算。偏好可后补默认，不挡完整句 */
export function isHomePlanSearchReady(fields: PlanClarifyFields): boolean {
  return Boolean(
    fields.city?.trim() &&
      fields.days != null &&
      fields.party?.trim() &&
      fields.budgetYuan != null,
  );
}

export function fillHomePlanPreference(fields: PlanClarifyFields): PlanClarifyFields {
  return {
    ...fields,
    pace: fields.pace?.trim() || '松弛慢逛',
    preference: fields.preference?.trim() || '近郊轻游',
  };
}

export function buildHomePlanLaunchQuery(
  fields: PlanClarifyFields,
  originLabel?: string | null,
): string {
  const ready = fillHomePlanPreference(fields);
  const city = ready.city?.trim() || '';
  const origin = originLabel?.trim() ? `从${originLabel.trim()}出发，` : '';
  return [
    `${origin}去${city}玩${ready.days}天，同行：${ready.party}${ready.pace ? `，节奏：${ready.pace}` : ''}，人均预算约${ready.budgetYuan}元，${ready.preference}`,
    `【目的地锁定】${city}`,
    `【用户已确认】城市${city}，${ready.days}天，同行：${ready.party}${ready.pace ? `，节奏：${ready.pace}` : ''}，预算约${ready.budgetYuan}元，偏好：${ready.preference}`,
  ].join('。');
}
