import { validateSearchStructuredPlan } from '@/lib/home/searchStructuredPlanParse';
import type {
  SearchPlanBudgetItem,
  SearchPlanDay,
  SearchPlanFood,
  SearchPlanSpot,
  SearchStructuredPlan,
} from '@/types/domain/searchStructuredPlan';

type Section = 'meta' | 'budget' | 'day' | 'tips';

const SECTION_BUDGET = '【预算明细】';
const SECTION_TIPS = '【出行贴士】';
const SECTION_TIPS_EXCLUSIVE = '【本次行程专属贴士】';
const DAY_HEADING_RE = /^【(?:第(\d+)天(?:\s+(.+))?|(.+))】$/;
const HEADER_RE = /^(.+?)\s*·\s*(\d+)\s*天\s*·\s*(.+?)(?:\s*·\s*(.+))?$/;
const BUDGET_RE = /^(.+?)\s+人均(\d+)元(?:\s+(.*))?$/;
const FOOD_RE = /^-\s+(.+?)\s+·\s+(.+?)\s+·\s+人均(\d+)元/;
const SPOT_RE = /^-\s+(.+?)(?:\s+·\s+(.*))?$/;

function emptyDay(day: number, title: string): SearchPlanDay {
  return {
    day,
    title,
    traffic: [],
    spots: [],
    foods: [],
    tips: '',
    hotelArea: '',
  };
}

function parseHeaderLine(line: string): Partial<SearchStructuredPlan['baseInfo']> | null {
  const match = line.match(HEADER_RE);
  if (!match) return null;
  const targetCity = match[1]?.trim() ?? '';
  const days = Number(match[2]);
  const peopleType = match[3]?.trim() ?? '';
  const budgetLabel = match[4]?.trim() ?? '';
  const budgetMatch = budgetLabel.match(/人均(\d+)/);
  return {
    targetCity,
    days: Number.isFinite(days) ? days : undefined,
    peopleType,
    budget: budgetMatch ? Number(budgetMatch[1]) : null,
  };
}

function parseDayHeading(line: string): { day?: number; title: string } | null {
  if (line === SECTION_BUDGET || line === SECTION_TIPS) return null;
  const match = line.match(DAY_HEADING_RE);
  if (!match) return null;
  if (match[1]) {
    return { day: Number(match[1]), title: match[2]?.trim() || `第${match[1]}天` };
  }
  const title = match[3]?.trim() ?? '';
  if (!title || title === '预算明细' || title === '出行贴士' || title === '本次行程专属贴士' || title === '行程亮点') {
    return null;
  }
  return { title };
}

/** 把复制/旧保存正文还原成行程卡片数据 */
export function parseSearchPlanCopyText(raw: string): SearchStructuredPlan | null {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd());
  if (!lines.some((line) => line.startsWith('【'))) {
    return null;
  }

  const baseInfo: SearchStructuredPlan['baseInfo'] = {
    startCity: '',
    targetCity: '',
    days: 0,
    peopleType: '',
    budget: null,
    theme: null,
  };
  const budgetList: SearchPlanBudgetItem[] = [];
  const dayList: SearchPlanDay[] = [];
  const globalTips: string[] = [];

  let section: Section = 'meta';
  let currentDay: SearchPlanDay | null = null;
  let listKind: 'traffic' | 'spots' | 'foods' | null = null;
  let inferredDay = 0;

  const commitDay = () => {
    if (currentDay) {
      dayList.push(currentDay);
      currentDay = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^蜗牛旅行/.test(line) || /^HelloRoamly/i.test(line) || /^《.+》$/.test(line)) continue;

    if (line === SECTION_BUDGET) {
      commitDay();
      section = 'budget';
      listKind = null;
      continue;
    }
    if (line === SECTION_TIPS || line === SECTION_TIPS_EXCLUSIVE) {
      commitDay();
      section = 'tips';
      listKind = null;
      continue;
    }

    const heading = parseDayHeading(line);
    if (heading) {
      commitDay();
      inferredDay += 1;
      const day = heading.day && heading.day > 0 ? heading.day : inferredDay;
      inferredDay = day;
      currentDay = emptyDay(day, heading.title);
      section = 'day';
      listKind = null;
      continue;
    }

    if (section === 'meta') {
      const header = parseHeaderLine(line);
      if (header) {
        if (header.targetCity) baseInfo.targetCity = header.targetCity;
        if (header.days) baseInfo.days = header.days;
        if (header.peopleType) baseInfo.peopleType = header.peopleType;
        if (header.budget !== undefined) baseInfo.budget = header.budget;
        continue;
      }
      if (line.startsWith('出发：')) {
        baseInfo.startCity = line.slice(3).trim();
        continue;
      }
      if (line.startsWith('主题：')) {
        baseInfo.theme = line.slice(3).trim() || null;
        continue;
      }
    }

    if (section === 'budget') {
      const match = line.match(BUDGET_RE);
      if (match) {
        budgetList.push({
          item: match[1]!.trim(),
          perPerson: Number(match[2]),
          tip: match[3]?.trim() ?? '',
        });
      }
      continue;
    }

    if (section === 'tips') {
      globalTips.push(line.replace(/^-\s+/, '').trim());
      continue;
    }

    if (section === 'day' && currentDay) {
      if (line.startsWith('住宿片区：')) {
        currentDay.hotelArea = line.slice(5).trim();
        listKind = null;
        continue;
      }
      if (line.startsWith('当日贴士：') || line.startsWith('行程亮点：') || line.startsWith('【行程亮点】')) {
        currentDay.tips = line.replace(/^(?:当日贴士：|行程亮点：|【行程亮点】)/, '').trim();
        listKind = null;
        continue;
      }
      if (line === '交通：') {
        listKind = 'traffic';
        continue;
      }
      if (line === '景点：') {
        listKind = 'spots';
        continue;
      }
      if (line === '美食：') {
        listKind = 'foods';
        continue;
      }
      if (line.startsWith('- ')) {
        if (listKind === 'traffic') {
          currentDay.traffic.push({ desc: line.slice(2).trim() });
        } else if (listKind === 'foods') {
          const food = parseFoodLine(line);
          if (food) currentDay.foods.push(food);
        } else {
          const spot = parseSpotLine(line);
          if (spot) currentDay.spots.push(spot);
        }
      }
    }
  }
  commitDay();

  if (!baseInfo.targetCity && dayList.length > 0) {
    return null;
  }
  if (!baseInfo.targetCity) return null;
  if (!baseInfo.peopleType) baseInfo.peopleType = '出行';
  if (dayList.length === 0) return null;
  if (budgetList.length === 0) {
    budgetList.push({ item: '合计', perPerson: 0, tip: '' });
  }
  baseInfo.days = dayList.length;

  const plan: SearchStructuredPlan = { baseInfo, budgetList, dayList, globalTips };
  return validateSearchStructuredPlan(plan, plan.baseInfo.days) ? plan : null;
}

function parseFoodLine(line: string): SearchPlanFood | null {
  const match = line.match(FOOD_RE);
  if (match) {
    return { shop: match[1]!.trim(), dish: match[2]!.trim(), perCost: Number(match[3]) };
  }
  return null;
}

function parseSpotLine(line: string): SearchPlanSpot | null {
  const match = line.match(SPOT_RE);
  if (!match) return null;
  return { name: match[1]!.trim(), intro: match[2]?.trim() ?? '' };
}
