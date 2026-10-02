import { localizePlanBudgetDisplayForPlan } from '@/lib/home/localizePlanBudgetTip';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import { classifySearchPlanParty, type SearchPlanPartyFocus } from '@/lib/home/searchPlanParty';

export type { SearchPlanPartyFocus };
export { classifySearchPlanParty };

export function searchPlanShareCityName(plan: SearchStructuredPlan): string {
  const raw = plan.baseInfo.targetCity.trim();
  const stripped = raw.replace(/(?:玩|旅游|旅行)$/u, '');
  return stripped.length >= 2 ? stripped : raw;
}

export function searchPlanLocalBudgetLabel(plan: SearchStructuredPlan): string {
  const local = localizePlanBudgetDisplayForPlan(plan, '合计');
  if (local?.amount) return local.amount;
  if (plan.baseInfo.budget != null) return `人均${plan.baseInfo.budget}元`;
  return '市内人均按实核算';
}

export function searchPlanHeaderLine(plan: SearchStructuredPlan): string {
  const { targetCity, days, peopleType } = plan.baseInfo;
  return [targetCity, `${days}天`, peopleType, searchPlanLocalBudgetLabel(plan)].filter(Boolean).join(' · ');
}

export function searchPlanLiteHeader(plan: SearchStructuredPlan): string {
  const { days, peopleType } = plan.baseInfo;
  return [searchPlanShareCityName(plan), `${days}天`, peopleType].filter(Boolean).join(' · ');
}

export function searchPlanRouteFlavor(plan: SearchStructuredPlan): string {
  const { targetCity, peopleType } = plan.baseInfo;
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'friends' && /上海/.test(targetCity)) return '老城';
  const blob = plan.dayList
    .map((day) => `${day.title} ${day.spots.map((spot) => spot.name).join(' ')}`)
    .join(' ');
  if (/老城|城厢|古镇|古巷|豫园|城隍/.test(blob)) return '老城';
  if (/梧桐|法租界|洋房|武康/.test(blob)) return '梧桐区';
  if (/西湖|湖滨|西溪/.test(blob)) return '湖边';
  if (/滨江|外滩|江岸/.test(blob)) return '滨江';
  const spot = plan.dayList[0]?.spots.find((item) => /必体验/.test(item.intro))?.name.trim()
    || plan.dayList[0]?.spots[0]?.name.trim();
  return spot ? spot.slice(0, 4) : '街巷';
}

export function searchPlanCatchyTitle(plan: SearchStructuredPlan): string {
  const { targetCity, days, peopleType } = plan.baseInfo;
  const flavor = searchPlanRouteFlavor(plan);
  const focus = classifySearchPlanParty(peopleType);
  const core =
    focus === 'friends'
      ? `${targetCity}${days}天｜和好友避开人流的${flavor}松弛路线`
      : focus === 'couple'
        ? `${targetCity}${days}天｜和情侣错峰看日落的${flavor}路线`
        : focus === 'family'
          ? `${targetCity}${days}天｜带娃少走路多休息的松弛路线`
          : focus === 'solo'
            ? `${targetCity}${days}天｜一个人好走又安心的松弛路线`
            : `${targetCity}${days}天｜${peopleType}慢行路线`;
  return `《${core}》`;
}

export function searchPlanPublicHashtags(plan: SearchStructuredPlan): string[] {
  return searchPlanShareHashtags(plan).map((tag) =>
    tag.replace(/平价探店$/u, '街巷漫游').replace(/平价简餐$/u, '一个人逛吃'),
  );
}

export function searchPlanShareHashtags(plan: SearchStructuredPlan): string[] {
  const { targetCity } = plan.baseInfo;
  const flavor = searchPlanRouteFlavor(plan);
  const focus = classifySearchPlanParty(plan.baseInfo.peopleType);
  if (focus === 'friends') {
    return [`${targetCity}好友旅行`, `${targetCity}${flavor}慢游`, `${targetCity}平价探店`];
  }
  if (focus === 'couple') {
    return [`${targetCity}情侣旅行`, `${targetCity}错峰游览`, `${targetCity}日落机位`];
  }
  if (focus === 'family') {
    return [`${targetCity}亲子旅行`, `${targetCity}少走路`, `${targetCity}亲子友好`];
  }
  if (focus === 'solo') {
    return [`${targetCity}单人旅行`, `${targetCity}${flavor}慢游`, `${targetCity}平价简餐`];
  }
  return [`${targetCity}漫行`, `${targetCity}慢游`, '蜗牛旅行'];
}

export function searchPlanShareHook(plan: SearchStructuredPlan): string {
  const { targetCity } = plan.baseInfo;
  const focus = classifySearchPlanParty(plan.baseInfo.peopleType);
  if (focus === 'friends') {
    return `这条路线躲开网红扎堆点位，节奏松弛，适合好友慢悠悠逛吃${targetCity}`;
  }
  if (focus === 'couple') {
    return `这条路线错峰走，日落机位和安静小店留给两个人慢慢逛${targetCity}`;
  }
  if (focus === 'family') {
    return `这条路线少走路、多休息，带着孩子慢慢看${targetCity}`;
  }
  if (focus === 'solo') {
    return `这条路线交通好走，一个人也能松弛逛吃${targetCity}`;
  }
  return `这条路线不赶场，按本地人节奏慢慢逛${targetCity}`;
}

export function searchPlanPeopleFocusRule(peopleType: string): string {
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'friends') {
    return '好友结伴：主打松弛探店、平价小吃、小众聊天点位，避开网红拥挤人流。';
  }
  if (focus === 'couple') {
    return '情侣：主打日落机位、氛围感小店、安静拍照点位，错峰游览。';
  }
  if (focus === 'family') {
    return '亲子：缩短步行距离、增加休息点位、儿童友好场馆，并写便民提示。';
  }
  if (focus === 'solo') {
    return '单人：侧重交通便捷、安全提示、单人平价简餐。';
  }
  return '按同行人群写具体体验，禁止万能流水账。';
}
