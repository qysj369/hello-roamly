import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 攻略生成前分层追问字段（前端缓存；项目用 Zustand，等价于 Pinia 持久草稿） */
export type PlanClarifyFields = {
  city: string | null;
  days: number | null;
  party: string | null;
  /** 出行节奏：松弛慢逛 / 高效打卡 */
  pace: string | null;
  budgetYuan: number | null;
  /** 旅行偏好：城市人文 / 自然风光 / 美食探店 等 */
  preference: string | null;
};

type PlanClarifyState = PlanClarifyFields & {
  patch: (partial: Partial<PlanClarifyFields>) => void;
  reset: () => void;
};

const EMPTY: PlanClarifyFields = {
  city: null,
  days: null,
  party: null,
  pace: null,
  budgetYuan: null,
  preference: null,
};

export const usePlanClarifyStore = create<PlanClarifyState>()(
  persist(
    (set) => ({
      ...EMPTY,
      patch: (partial) => set((state) => ({ ...state, ...partial })),
      reset: () => set({ ...EMPTY }),
    }),
    {
      name: 'holo-plan-clarify-cache',
      partialize: (state) => ({
        city: state.city,
        days: state.days,
        party: state.party,
        pace: state.pace,
        budgetYuan: state.budgetYuan,
        preference: state.preference,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PlanClarifyFields>;
        return {
          ...current,
          ...p,
          pace: p.pace ?? null,
          preference: p.preference ?? null,
        };
      },
    },
  ),
);

export function hasCompletePlanClarify(fields: PlanClarifyFields): boolean {
  return Boolean(
    fields.city?.trim() &&
      fields.days != null &&
      fields.party?.trim() &&
      fields.pace?.trim() &&
      fields.budgetYuan != null &&
      fields.preference?.trim(),
  );
}

/** 澄清用城市：去掉玩法脏值，并拒绝 ASR 口误碎片 */
const STYLE_STOP_RE =
  /^(?:亲子|亲子出行|亲子家庭|近郊|近郊慢行|近郊轻游|人文慢逛|城市人文|美食探店|亲子时光|自然山水|自然风光|自然山|高效打卡|松弛慢逛|海景|民俗|偏好|风光|主题|玩法|慢游|深度慢游|转场|单人|情侣|好友结伴|结伴|研学|蜜月)$/;

const INVALID_CITY_RE =
  /^(?:还没|还没有|不知道|不确定|随便|都行|你好|您好|嗯+|啊+|哦+|呃+|额+|那个|这个|听不清|没听清|说完了|正在听|目的地)$/;

/** 整段就是一座城（如「杭州」），不要求「去杭州」句式 */
export function inferBareCityLabel(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim() ?? '';
  if (/去|到|玩|天|预算|同行|偏好|出发/.test(trimmed)) {
    return null;
  }
  if (!/^[\u4e00-\u9fff]{2,6}市?$/.test(trimmed)) {
    return null;
  }
  return sanitizeClarifyCityLabel(trimmed);
}

export function sanitizeClarifyCityLabel(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }
  if (!/[→➜]/.test(trimmed)) {
    const plain = trimmed.replace(/市$/, '') || trimmed;
    if (STYLE_STOP_RE.test(plain) || INVALID_CITY_RE.test(plain) || plain.length < 2) {
      return null;
    }
    return plain;
  }
  const stops = trimmed
    .split(/[→➜]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !STYLE_STOP_RE.test(part) && !INVALID_CITY_RE.test(part));
  if (stops.length === 0) {
    return null;
  }
  if (stops.length === 1) {
    const one = stops[0]!.replace(/市$/, '') || stops[0]!;
    return one.length >= 2 ? one : null;
  }
  return stops.join('→');
}

export function composePlanClarifyQuery(fields: PlanClarifyFields, baseQuery?: string): string {
  const city = sanitizeClarifyCityLabel(fields.city) || fields.city?.trim() || '';
  const days = fields.days;
  const party = fields.party?.trim() || '';
  const pace = fields.pace?.trim() || '';
  const budget = fields.budgetYuan;
  const preference = fields.preference?.trim() || '';
  // 用「同行：亲子」避免模型把「亲子出行」当成站名
  const detail =
    days != null && budget != null && preference
      ? `${days}天，同行：${party}${pace ? `，节奏：${pace}` : ''}，预算约${budget}元，偏好：${preference}`
      : days != null && budget != null
        ? `${days}天，同行：${party}，预算约${budget}元`
        : '';
  const base = baseQuery?.trim() || '';
  const cityCore = city.split(/[→➜]/)[0]?.trim() || city;
  // 保留用户原话（已含目的地），避免把「去杭州」收成空壳模板
  const head =
    base && (!city || base.includes(cityCore) || /去|到|玩|出发/.test(base))
      ? base
      : city
        ? `去${city}玩`
        : base || '短途漫行';
  const withDetail =
    detail && days != null && !head.includes(`${days}天`) ? `${head}，${detail}` : head;
  // 锁定句只写城市名；风格约束另起短句，避免模型把标签抄成站名
  const locked = city ? `【目的地锁定】${city}` : '';
  const styleNote = city
    ? `【玩法标签·非地名】慢游/亲子/近郊/转场不是城市或高铁站，禁止写「近郊慢行目的地」；目的地城市只能是「${city}」，主住宿须在该市境内`
    : '';
  const prefNote = preference
    ? `【旅行偏好】${preference}${pace ? `，节奏：${pace}` : ''}（玩法倾向，不是地名）`
    : '';
  return [withDetail, locked, styleNote, prefNote].filter(Boolean).join('。');
}
