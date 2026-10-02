import { resolveRealPlanCity } from '@/lib/map/planQueryBuilder';
import { extractSearchDestination } from '@/lib/map/travelQueryParsing';

export interface SearchExtractParams {
  startCity?: string;
  targetCity?: string;
  days?: number;
  peopleType?: string;
  budget?: number;
  theme?: string;
}

/** 文案出现济南 / 历下 / 绿城百合花园时锁定的完整出发地址 */
export const LOCKED_JINAN_START_CITY = '济南历下绿城百合花园';

const CN_DIGITS: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function emptyExtract(): SearchExtractParams {
  return {
    startCity: undefined,
    targetCity: undefined,
    days: undefined,
    peopleType: undefined,
    budget: undefined,
    theme: undefined,
  };
}

function parseStartCity(text: string): string | undefined {
  if (/济南|历下|绿城百合花园/.test(text)) {
    return LOCKED_JINAN_START_CITY;
  }
  return undefined;
}

function parseTargetCity(text: string): string | undefined {
  const raw = extractSearchDestination(text);
  const city = resolveRealPlanCity(raw) || raw?.trim();
  if (!city || /[→➜]/.test(city)) {
    return undefined;
  }
  if (city === '济南' && parseStartCity(text)) {
    return undefined;
  }
  return city;
}

export function parseSearchDays(text: string): number | undefined {
  const nightDay = text.match(/\d+\s*晚\s*(\d+)\s*天/);
  if (nightDay?.[1]) {
    return Number.parseInt(nightDay[1], 10);
  }
  const digit = text.match(/(\d+)\s*天/);
  if (digit?.[1]) {
    return Number.parseInt(digit[1], 10);
  }
  const cn = text.match(/([一两二三四五六七八九十]{1,2})\s*天/);
  if (cn?.[1]) {
    const value = CN_DIGITS[cn[1]];
    return value;
  }
  return undefined;
}

export function parseSearchPeopleType(text: string): string | undefined {
  if (/两大一小|亲子|带娃|小孩|孩子|宝宝/.test(text)) return '亲子';
  if (/情侣|两口|夫妻|蜜月/.test(text)) return '情侣';
  if (/闺蜜|姐妹/.test(text)) return '闺蜜';
  if (/好友结伴|好友|小伙伴|搭子/.test(text)) return '好友结伴';
  if (/家庭|一家/.test(text)) return '家庭';
  if (/单人|一个人|独自|一人行/.test(text)) return '单人';
  return undefined;
}

function parseBudget(text: string): number | undefined {
  const per = text.match(/人均\s*(\d+)/);
  if (per?.[1]) {
    return Number.parseInt(per[1], 10);
  }
  const labeled = text.match(/预算\s*(\d+)/);
  if (labeled?.[1]) {
    return Number.parseInt(labeled[1], 10);
  }
  return undefined;
}

function parseTheme(text: string): string | undefined {
  if (/美食|探店/.test(text)) return '美食探店';
  if (/山水|徒步|看海/.test(text)) return '山水徒步';
  if (/古迹/.test(text)) return '古迹观光';
  if (/下雨|雨天|有雨/.test(text)) return '雨天改线';
  if (/周末|节假日|人多/.test(text)) return '节假日分流';
  return undefined;
}

/** 从搜索原文拆出 6 类字段；没匹配到的保持 undefined，禁止默填 */
export function extractSearchParams(raw: string): SearchExtractParams {
  const text = raw.trim();
  const empty = emptyExtract();
  if (!text) {
    return empty;
  }
  return {
    startCity: parseStartCity(text),
    targetCity: parseTargetCity(text),
    days: parseSearchDays(text),
    peopleType: parseSearchPeopleType(text),
    budget: parseBudget(text),
    theme: parseTheme(text),
  };
}
