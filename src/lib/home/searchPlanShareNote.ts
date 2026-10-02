import { BRAND_NAME } from '@/lib/config/brandCopy';
import {
  classifySearchPlanParty,
  searchPlanCatchyTitle,
  searchPlanShareCityName,
  searchPlanShareHashtags,
} from '@/lib/home/searchPlanShareCopy';
import { sharePlanBudgetLine } from '@/lib/home/sharePlanOutline';
import type { SearchPlanDay, SearchPlanSpot, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanShareNoteDensity = 'full' | 'short' | 'spoken' | 'seed' | 'dianping';

export type SearchPlanShareNoteOptions = {
  density?: SearchPlanShareNoteDensity;
  tags?: boolean;
  extraTags?: string[];
  brandedTitle?: boolean;
  publicSafe?: boolean;
};

function shopShortName(shop: string): string {
  return shop.replace(/（[^）]*）$/u, '').trim();
}

function stripSpotPrefix(intro: string): string {
  return intro
    .replace(/^(必体验|时间充裕可选)[:：]\s*/u, '')
    .replace(/^(上午|下午|傍晚|晚上|清晨)/u, '')
    .replace(/^[:：]\s*/u, '')
    .trim();
}

function spotWhen(intro: string, index: number): string {
  if (/傍晚|晚上|日落|落日/.test(intro)) return '傍晚';
  if (/下午/.test(intro)) return '下午';
  if (/上午|清晨/.test(intro)) return '上午';
  return index === 0 ? '上午' : '下午';
}

function formatTags(plan: SearchStructuredPlan, extra: string[] = []): string {
  return [...searchPlanShareHashtags(plan), BRAND_NAME, ...extra]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .map((tag) => `#${tag}`)
    .join(' ');
}

function finishSentences(parts: string[]): string {
  const text = parts
    .map((part) => part.replace(/[。．.]+$/u, '').trim())
    .filter(Boolean)
    .join('。');
  return text ? `${text}。` : '';
}

function softenNarrative(text: string): string {
  return text
    .replace(/^【行程亮点】/u, '')
    .replace(/必体验[:：]?\s*/gu, '')
    .replace(/时间充裕可选[:：]?\s*/gu, '')
    .replace(/必点/gu, '点')
    .replace(/[；;]/gu, '。')
    .replace(/。+/gu, '。')
    .trim();
}

function mentionsName(text: string, name: string): boolean {
  if (!name) return true;
  if (text.includes(name)) return true;
  return name.length >= 2 && text.includes(name.slice(0, 2));
}

function mealWord(day: SearchPlanDay): string {
  const blob = `${day.tips} ${day.foods[0]?.dish ?? ''}`;
  if (/晚餐|晚饭/.test(blob)) return '晚饭';
  return '午饭';
}

function foodSentence(day: SearchPlanDay): string | null {
  const food = day.foods[0];
  if (!food?.shop) return null;
  const shop = shopShortName(food.shop);
  const dish = food.dish.trim();
  return dish ? `${mealWord(day)}去${shop}，${dish}就够` : `${mealWord(day)}去${shop}坐一会儿`;
}

function leadForWhen(when: string, index: number): string {
  if (when === '傍晚') return index === 0 ? '傍晚去' : '傍晚再去';
  if (when === '下午') return index === 0 ? '下午去' : '下午再去';
  return index === 0 ? '上午先去' : '接着去';
}

function spotClause(spot: SearchPlanSpot, index: number): string {
  const intro = stripSpotPrefix(spot.intro);
  const lead = leadForWhen(spotWhen(spot.intro, index), index);
  if (!intro) return `${lead}${spot.name}`;
  if (/^(看|逛|蹲|走|拍|闲逛|免费|错峰|躲开|避开|钻)/u.test(intro)) {
    return `${lead}${spot.name}${intro}`;
  }
  return `${lead}${spot.name}，${intro}`;
}

function openingLead(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const focus = classifySearchPlanParty(plan.baseInfo.peopleType);
  if (focus === 'friends') return `和朋友来${city}，别被网红点位的人流推着走。`;
  if (focus === 'couple') return `两个人来${city}，把日落和安静小店留给自己。`;
  if (focus === 'family') return `带娃来${city}，少走路、多歇脚，别把行程排满。`;
  if (focus === 'solo') return `一个人来${city}，交通好走、吃得省心就够。`;
  return `来${city}不赶场，按本地人节奏慢慢逛。`;
}

function opening(plan: SearchStructuredPlan, brandedTitle: boolean, publicSafe = false): string {
  const title = searchPlanCatchyTitle(plan).replace(/[《》]/g, '');
  const head = brandedTitle ? `【${BRAND_NAME}】${title}` : title;
  const money = publicSafe ? '一天不换住，预留闲逛空档。' : `预算${sharePlanBudgetLine(plan)}，一天不换住，预留闲逛空档。`;
  return `${head}\n\n${openingLead(plan)}${money}`;
}

function fullDayBlock(day: SearchPlanDay): string {
  const tip = softenNarrative(day.tips);
  const shop = shopShortName(day.foods[0]?.shop.trim() || '');
  const must =
    day.spots.find((spot) => /必体验/.test(spot.intro)) ?? day.spots[0];
  let body =
    tip.length >= 16
      ? finishSentences([tip])
      : finishSentences([...day.spots.slice(0, 3).map(spotClause), foodSentence(day) ?? '']);

  if (must && !mentionsName(body, must.name.trim())) {
    body = finishSentences([
      tip.length >= 16 ? `先去${must.name.trim()}` : spotClause(must, 0),
      body,
    ]);
  }
  if (shop && !mentionsName(body, shop)) {
    body = finishSentences([body, foodSentence(day) ?? '']);
  }
  return `Day ${day.day}\n${body}`;
}

function compactDayLine(day: SearchPlanDay): string {
  const first = day.spots[0];
  const second = day.spots[1];
  const shop = shopShortName(day.foods[0]?.shop.trim() || '');
  const bits = [
    first ? `${spotWhen(first.intro, 0)}${first.name}` : '',
    shop ? `${mealWord(day)}${shop}` : '',
    second ? `${spotWhen(second.intro, 1)}${second.name}` : '',
  ].filter(Boolean);
  return `Day ${day.day} ${bits.join('，')}`;
}

function dianpingDayBlock(day: SearchPlanDay): string {
  const spots = day.spots.map((spot) => spot.name.trim()).filter(Boolean);
  return `Day ${day.day}\n${finishSentences([
    foodSentence(day) ?? '',
    spots.length ? `顺便逛${spots.join('、')}` : '',
  ])}`;
}

export function pickSharePlanFragmentDay(plan: SearchStructuredPlan): SearchPlanDay | null {
  return plan.dayList.find((day) => day.spots.some((spot) => /必体验/.test(spot.intro))) ?? plan.dayList[0] ?? null;
}

function fragmentSpokenBody(plan: SearchStructuredPlan): string {
  const day = pickSharePlanFragmentDay(plan);
  if (!day) return openingLead(plan);
  const must = day.spots.find((spot) => /必体验/.test(spot.intro)) ?? day.spots[0];
  const extra = day.spots.find((spot) => spot !== must);
  return finishSentences([
    openingLead(plan),
    must ? spotClause(must, 0) : '',
    extra ? spotClause(extra, 1) : '',
    foodSentence(day) ?? '',
  ]);
}

function tipBlock(plan: SearchStructuredPlan): string | null {
  const tips = plan.globalTips
    .map((tip) => softenNarrative(tip))
    .filter(Boolean)
    .slice(0, 3);
  if (!tips.length) return null;
  return `小贴士\n${finishSentences(tips)}`;
}

export function buildSearchPlanShareNote(
  plan: SearchStructuredPlan,
  options: SearchPlanShareNoteOptions = {},
): string {
  const density = options.density ?? 'full';
  const brandedTitle = options.brandedTitle !== false;
  const showTags = options.tags !== false;
  const { peopleType } = plan.baseInfo;
  const city = searchPlanShareCityName(plan);

  if (density === 'dianping') {
    return [
      `【${BRAND_NAME}】${city}本地逛吃清单（${peopleType}）`,
      '',
      openingLead(plan),
      '',
      plan.dayList.map(dianpingDayBlock).join('\n\n'),
      '',
      `预算${sharePlanBudgetLine(plan)}`,
    ]
      .join('\n')
      .trim();
  }

  if (density === 'spoken') {
    if (options.publicSafe) {
      return fragmentSpokenBody(plan);
    }
    return [`【口播】来${city}可以这样慢慢逛，这条是【${BRAND_NAME}】记下的。`, fragmentSpokenBody(plan)]
      .join('\n')
      .trim();
  }

  if (density === 'seed') {
    const title = searchPlanCatchyTitle(plan).replace(/[《》]/g, '');
    return [title, '', fragmentSpokenBody(plan)].join('\n').trim();
  }

  const daysBody =
    density === 'short'
      ? plan.dayList.map(compactDayLine).join('\n')
      : plan.dayList.map(fullDayBlock).join('\n\n');

  return [opening(plan, brandedTitle, options.publicSafe), daysBody, density === 'full' ? tipBlock(plan) : null, showTags ? formatTags(plan, options.extraTags ?? []) : null]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
