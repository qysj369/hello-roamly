import { extractSearchParams, parseSearchPeopleType } from '@/lib/home/extractSearchParams';

export type TravelAgentIntent =
  | { type: 'generate' }
  | { type: 'edit_party'; peopleType: string; temporary?: boolean }
  | { type: 'edit_foods' }
  | { type: 'edit_spots'; action: 'add' | 'remove' | 'enrich'; day?: number; name?: string }
  | { type: 'edit_traffic' }
  | { type: 'edit_budget'; mode: 'down' | 'recalc' }
  | { type: 'edit_days'; days?: number; delta?: number }
  | { type: 'edit_rain' }
  | { type: 'edit_holiday' }
  | { type: 'rollback' }
  | { type: 'reset_preference' }
  | { type: 'save' }
  | { type: 'poster' }
  | { type: 'copy_link' }
  | { type: 'copy_share' }
  | { type: 'share' }
  | { type: 'remix' }
  | { type: 'ask' };

const PARTY_LABEL: Record<string, string> = {
  亲子: '亲子',
  情侣: '情侣',
  好友: '好友结伴',
  单人: '单人',
};

function detectPartySwitch(text: string): string | null {
  if (
    !/(改成|换成|变成|改成跟|适合改|按|改成我|带娃走|那就亲子|那就改)/.test(text) &&
    !/^亲子$|^情侣$|^好友|^单人$/.test(text.trim())
  ) {
    if (!/改成|换成|变成|改成亲子|改成情侣|改成好友|改成单人|换成亲子|换成情侣/.test(text)) {
      return null;
    }
  }
  if (/改成亲子|换成亲子|变成亲子|带娃版|亲子版|按亲子|带娃走|那就亲子|那就改成亲子/.test(text)) return '亲子';
  if (/改成情侣|换成情侣|变成情侣|情侣版|按情侣/.test(text)) return '情侣';
  if (/改成好友|换成好友|变成好友|好友版|闺蜜版|按好友/.test(text)) return '好友结伴';
  if (/改成单人|换成单人|变成单人|一个人版|单人版|按单人/.test(text)) return '单人';
  if (/^亲子$|^情侣$|^好友结伴$|^好友$|^单人$/.test(text.trim())) {
    const people = parseSearchPeopleType(text);
    return people ?? PARTY_LABEL[text.trim()] ?? null;
  }
  return null;
}

function looksLikeQuestion(text: string): boolean {
  return /[?？]|适合|吗|怎么|如何|要不要|能不能|预约|避坑|雨天|节假日|交通|地铁|预算低不/.test(text);
}

function parseDayIndex(text: string): number | undefined {
  const digit = text.match(/第\s*(\d+)\s*天/);
  if (digit?.[1]) return Number(digit[1]);
  const cn = text.match(/第([一二三四五六七八九十])天/);
  const map: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  if (cn?.[1] && map[cn[1]]) return map[cn[1]];
  return undefined;
}

function parseNamedSpot(text: string): string | undefined {
  const named = text.match(/(?:去掉|删掉|不要|加上|加入|增加)\s*([\u4e00-\u9fff]{2,8})/);
  const value = named?.[1]?.replace(/景点|点位$/, '');
  return value || undefined;
}

function parseDayCountEdit(text: string): TravelAgentIntent | null {
  if (/再加一天|多一天/.test(text)) return { type: 'edit_days', delta: 1 };
  if (/少一天|减少一天/.test(text)) return { type: 'edit_days', delta: -1 };
  const match = text.match(/(?:改成|变成|改去|改到)\s*(\d+)\s*天/);
  if (match?.[1]) {
    const days = Number(match[1]);
    if (days >= 1 && days <= 14) return { type: 'edit_days', days };
  }
  return null;
}

/** 从一句话里拆出站内操作 / 局部改 / 新生成 / 答疑 */
export function parseTravelAgentIntent(text: string, hasPlan: boolean): TravelAgentIntent {
  const raw = text.trim();
  if (!raw) return hasPlan ? { type: 'ask' } : { type: 'generate' };

  if (/回退|上一版|回到上一|撤销修改/.test(raw)) return { type: 'rollback' };
  if (/重置偏好|清空偏好|忘掉我的习惯/.test(raw)) return { type: 'reset_preference' };
  if (/保存行程|帮我保存|一句话保存|存一下|收藏这|保存这份/.test(raw)) return { type: 'save' };
  if (/生成海报|分享海报|出海报|做海报|生成图文|图文资产包|确认行程|攻略卡片/.test(raw)) {
    return { type: 'poster' };
  }
  if (/复制链接|分享链接|拷贝链接|复制分享链接/.test(raw)) return { type: 'copy_link' };
  if (/复制种草|复制文案|复制标签|种草短句|话题标签/.test(raw)) return { type: 'copy_share' };
  if (/发给朋友|发给微信|发微信|打开分享|一键分享|分享行程|发给群/.test(raw)) return { type: 'share' };
  if (/复刻|改成我的|按这份改|基于这份|二次修改/.test(raw) && hasPlan) return { type: 'remix' };
  if (/重新核算|重算预算|按出发地核算|核算预算/.test(raw)) {
    return { type: 'edit_budget', mode: 'recalc' };
  }
  if (/预算降低|降低预算|便宜一点|少花点|预算少|降预算/.test(raw)) {
    return { type: 'edit_budget', mode: 'down' };
  }

  const temporary = /仅本次|这次按|临时|不要改偏好|别改习惯/.test(raw);
  const party = detectPartySwitch(raw);
  if (party && hasPlan) {
    return temporary
      ? { type: 'edit_party', peopleType: party, temporary: true }
      : { type: 'edit_party', peopleType: party };
  }

  if (hasPlan) {
    const dayEdit = parseDayCountEdit(raw);
    if (dayEdit) return dayEdit;
  }

  if (hasPlan && /换餐厅|换馆子|换家店|增加本地美食|加美食|换一家吃/.test(raw)) {
    return { type: 'edit_foods' };
  }
  if (hasPlan && /去掉|删掉|不要/.test(raw) && parseNamedSpot(raw)) {
    const day = parseDayIndex(raw);
    return day
      ? { type: 'edit_spots', action: 'remove', day, name: parseNamedSpot(raw) }
      : { type: 'edit_spots', action: 'remove', name: parseNamedSpot(raw) };
  }
  if (hasPlan && /加上|加入/.test(raw) && parseNamedSpot(raw)) {
    const day = parseDayIndex(raw);
    return day
      ? { type: 'edit_spots', action: 'add', day, name: parseNamedSpot(raw) }
      : { type: 'edit_spots', action: 'add', name: parseNamedSpot(raw) };
  }
  if (hasPlan && /补充景点|加景点|景点详情|少走路|增减景点/.test(raw)) {
    const day = parseDayIndex(raw);
    return day ? { type: 'edit_spots', action: 'enrich', day } : { type: 'edit_spots', action: 'enrich' };
  }
  if (hasPlan && /完善交通|怎么坐|地铁怎么|出行交通|接驳/.test(raw)) {
    return { type: 'edit_traffic' };
  }
  if (
    hasPlan &&
    /下雨|雨天|有雨/.test(raw) &&
    /怎么走|怎么办|改线|换成室内|避雨|改室内|周末|明天|今天/.test(raw)
  ) {
    return { type: 'edit_rain' };
  }
  if (hasPlan && /节假日|人多|拥挤|太挤/.test(raw) && /怎么走|怎么办|改线|分流|避开|换一条/.test(raw)) {
    return { type: 'edit_holiday' };
  }

  const extracted = extractSearchParams(raw);
  const hasNewTrip = Boolean(extracted.targetCity && extracted.days && extracted.peopleType);
  if (hasNewTrip) return { type: 'generate' };
  if (extracted.targetCity && !hasPlan) return { type: 'generate' };

  if (hasPlan && looksLikeQuestion(raw)) return { type: 'ask' };
  if (hasPlan && party) return { type: 'edit_party', peopleType: party };
  if (hasPlan && !extracted.targetCity) return { type: 'ask' };
  return { type: 'generate' };
}

const AGENT_EXECUTE_TYPES = new Set<TravelAgentIntent['type']>([
  'share',
  'save',
  'poster',
  'copy_link',
  'copy_share',
  'edit_party',
  'edit_foods',
  'edit_spots',
  'edit_traffic',
  'edit_budget',
  'edit_days',
  'edit_rain',
  'edit_holiday',
  'rollback',
  'reset_preference',
  'remix',
]);

/** 首页语音：改行程 / 分享交给管家，新出行仍走搜索出卡 */
export function shouldRouteToTravelAgent(text: string, hasPlan: boolean): boolean {
  const intent = parseTravelAgentIntent(text, hasPlan);
  if (AGENT_EXECUTE_TYPES.has(intent.type)) return true;
  return hasPlan && intent.type === 'ask';
}
