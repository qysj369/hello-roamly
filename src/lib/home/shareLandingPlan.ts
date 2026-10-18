import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const SHARE_PLAN_QUERY_KEY = 'sp';

type CompactShareDay = {
  t: string;
  s: string[];
  f?: string[];
  k?: string;
};

type CompactSharePlan = {
  v: 1;
  c: string;
  d: number;
  p: string;
  o?: string;
  h?: string;
  days: CompactShareDay[];
  tips?: string[];
};

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((unit) => {
    binary += String.fromCharCode(unit);
  });
  const raw = btoa(binary);
  return raw.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const binary = atob(`${padded}${pad}`);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function compactFromPlan(plan: SearchStructuredPlan): CompactSharePlan {
  return {
    v: 1,
    c: plan.baseInfo.targetCity.trim(),
    d: plan.baseInfo.days,
    p: plan.baseInfo.peopleType.trim(),
    o: plan.baseInfo.startCity.trim() || undefined,
    h: plan.dayList[0]?.hotelArea.trim() || undefined,
    days: plan.dayList.slice(0, 3).map((day) => ({
      t: day.title.replace(/^第\d+天\s*/u, '').trim() || `D${day.day}`,
      s: day.spots.map((spot) => spot.name.trim()).filter(Boolean).slice(0, 2),
      f: day.foods.map((food) => food.shop.trim()).filter(Boolean).slice(0, 1),
      k: day.tips.replace(/^【行程亮点】/u, '').trim().slice(0, 24) || undefined,
    })),
    tips: plan.globalTips.map((tip) => tip.trim()).filter(Boolean).slice(0, 2),
  };
}

function inflateCompactPlan(compact: CompactSharePlan): SearchStructuredPlan {
  return {
    baseInfo: {
      startCity: compact.o || '',
      targetCity: compact.c,
      days: compact.d,
      peopleType: compact.p,
      budget: null,
      theme: null,
    },
    budgetList: [],
    globalTips: compact.tips ?? [],
    dayList: compact.days.map((day, index) => ({
      day: index + 1,
      title: day.t,
      hotelArea: compact.h || '',
      tips: day.k || '',
      traffic: [],
      spots: (day.s ?? []).map((name) => ({ name, intro: '' })),
      foods: (day.f ?? []).map((shop) => ({ shop, dish: '', perCost: 0 })),
    })),
  };
}

export function encodeCompactSharePlan(plan: SearchStructuredPlan): string {
  const full = compactFromPlan(plan);
  const slim: CompactSharePlan = {
    ...full,
    tips: undefined,
    days: full.days.map((day) => ({ t: day.t, s: day.s, f: day.f })),
  };
  const encoded = toBase64Url(JSON.stringify(full));
  if (encoded.length <= 1400) return encoded;
  return toBase64Url(JSON.stringify(slim));
}

export function decodeCompactSharePlan(value: string | null | undefined): SearchStructuredPlan | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as CompactSharePlan;
    if (parsed?.v !== 1 || !parsed.c || !parsed.d || !Array.isArray(parsed.days) || parsed.days.length < 1) {
      return null;
    }
    const gold = matchSearchPlanGoldExample({
      startCity: parsed.o || '济南',
      targetCity: parsed.c,
      days: parsed.d,
      peopleType: parsed.p || '好友结伴',
      budget: null,
      theme: null,
    });
    return gold ?? inflateCompactPlan(parsed);
  } catch {
    return null;
  }
}

export function planFromShareLandingSearch(search: string): SearchStructuredPlan | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const packed = decodeCompactSharePlan(params.get(SHARE_PLAN_QUERY_KEY));
  if (packed) return packed;
  const city = params.get('city')?.trim();
  const daysRaw = Number.parseInt(params.get('days') ?? '', 10);
  const party = params.get('party')?.trim();
  if (!city || !Number.isFinite(daysRaw) || daysRaw < 1 || !party) return null;
  return matchSearchPlanGoldExample({
    startCity: '济南',
    targetCity: city,
    days: daysRaw,
    peopleType: party,
    budget: null,
    theme: null,
  });
}
