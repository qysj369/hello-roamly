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
  return [targetCity, `${days}天`, peopleType, searchPlanLocalBudgetLabel(plan)]
    .filter(Boolean)
    .join(' · ');
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
  const spot =
    plan.dayList[0]?.spots.find((item) => /必体验/.test(item.intro))?.name.trim() ||
    plan.dayList[0]?.spots[0]?.name.trim();
  return spot ? spot.slice(0, 4) : '街巷';
}

function catchyTitleCore(plan: SearchStructuredPlan): string {
  const { targetCity, days, peopleType } = plan.baseInfo;
  const flavor = searchPlanRouteFlavor(plan);
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'friends') return `${targetCity}${days}天｜和好友避开人流的${flavor}松弛路线`;
  if (focus === 'couple') return `${targetCity}${days}天｜和情侣错峰看日落的${flavor}路线`;
  if (focus === 'family') return `${targetCity}${days}天｜带娃少走路多休息的松弛路线`;
  if (focus === 'solo') return `${targetCity}${days}天｜一个人好走又安心的松弛路线`;
  return `${targetCity}${days}天｜${peopleType}慢行路线`;
}

export function searchPlanCatchyTitle(plan: SearchStructuredPlan): string {
  return `《${catchyTitleCore(plan)}》`;
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

export function searchPlanPublicHashtags(plan: SearchStructuredPlan): string[] {
  return searchPlanShareHashtags(plan).map((tag) =>
    tag.replace(/平价探店$/u, '街巷漫游').replace(/平价简餐$/u, '一个人逛吃'),
  );
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

export type SearchPlanPlatformCopy = {
  title: string;
  hook: string;
  hashtags: string[];
};

const CITY_SHARE_REGION: Record<string, string> = {
  青岛: '山东',
  济南: '山东',
  烟台: '山东',
  威海: '山东',
  杭州: '浙江',
  宁波: '浙江',
  苏州: '江苏',
  南京: '江苏',
  上海: '江南',
  北京: '京津',
  天津: '京津',
  成都: '四川',
  西安: '陕西',
  广州: '广东',
  深圳: '广东',
  重庆: '山城',
  武汉: '湖北',
  长沙: '湖南',
  昆明: '云南',
  厦门: '福建',
  大连: '辽宁',
  哈尔滨: '黑龙江',
  桂林: '广西',
  三亚: '海南',
  洛阳: '河南',
  郑州: '河南',
};

function planShareBlob(plan: SearchStructuredPlan): string {
  return [
    plan.baseInfo.targetCity,
    plan.baseInfo.theme ?? '',
    ...plan.dayList.flatMap((day) => [
      day.title,
      day.tips,
      ...day.spots.flatMap((spot) => [spot.name, spot.intro]),
    ]),
  ].join(' ');
}

function primarySharePlace(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const name = plan.dayList
    .flatMap((day) => day.spots)
    .map((spot) => spot.name.trim())
    .find((spotName) => Boolean(spotName) && spotName !== city && !/^第.+天/u.test(spotName));
  if (name) return name.slice(0, 8);
  const flavor = searchPlanRouteFlavor(plan);
  return flavor && flavor !== '街巷' ? flavor : city;
}

function wechatLead(focus: SearchPlanPartyFocus): string {
  if (focus === 'couple') return '和情侣错峰看日落';
  if (focus === 'friends') return '和好友错峰闲逛';
  if (focus === 'family') return '带娃慢慢逛';
  if (focus === 'solo') return '一个人慢慢走';
  return '慢慢逛';
}

function wechatHook(focus: SearchPlanPartyFocus, place: string, sea: boolean): string {
  const where = sea && place !== '海边' ? '海边' : place;
  if (focus === 'couple' && sea && place !== '海边') {
    return `沿着海边慢慢逛，在${place}等待一场橘色落日，人少安静，适合两个人慢悠悠放空。`;
  }
  if (focus === 'couple') {
    return `沿着${place}慢慢逛，等待一场橘色落日，人少安静，适合两个人慢悠悠放空。`;
  }
  if (focus === 'friends') return `和朋友沿着${where}慢慢逛，找一处不挤的角落，适合一起放空。`;
  if (focus === 'family') return `带着孩子沿着${where}慢慢走，少赶路、多休息，适合一家人松弛放空。`;
  if (focus === 'solo') return `一个人沿着${where}慢慢逛，把节奏放轻，安静，适合独自放空。`;
  return `沿着${where}慢慢逛，把时间留白，适合按自己的节奏放空。`;
}

function wechatMood(
  focus: SearchPlanPartyFocus,
  flags: { sea: boolean; lake: boolean; sunset: boolean },
): string {
  if (flags.sea && (flags.sunset || focus === 'couple')) return '海边日落';
  if (flags.sunset) return '日落时分';
  if (flags.sea) return '看海慢逛';
  if (flags.lake) return '湖边慢逛';
  return '街巷慢逛';
}

function douyinScene(flags: { sea: boolean; lake: boolean }): string {
  if (flags.sea) return '看海';
  if (flags.lake) return '湖边';
  return '慢游';
}

function douyinPunch(focus: SearchPlanPartyFocus, place: string, sunset: boolean): string {
  if (!sunset && focus !== 'couple') return '';
  if (place.endsWith('落日')) return '';
  return '落日';
}

function douyinEnding(focus: SearchPlanPartyFocus, sunset: boolean): string {
  if (!sunset && focus !== 'couple') return '松弛慢游';
  if (focus === 'couple') return '浪漫日落';
  return '橘色日落';
}

function douyinVisual(
  focus: SearchPlanPartyFocus,
  flags: { sea: boolean; sunset: boolean },
): string {
  if (flags.sunset || focus === 'couple') return '日落';
  if (flags.sea) return '看海';
  return '慢游';
}

function shareSceneFlags(plan: SearchStructuredPlan, place: string) {
  const blob = `${place} ${planShareBlob(plan)}`;
  return {
    sea: /海边|看海|海湾|沙滩|栈桥|滨海|海滨|八大关|金沙滩/u.test(blob),
    lake: /西湖|湖边|湖畔|大明湖/u.test(blob),
    sunset: /日落|落日|夕阳|晚霞/u.test(blob),
  };
}

function uniqueTags(tags: string[]): string[] {
  return tags
    .map((tag) => tag.replace(/^#/u, '').trim())
    .filter((tag, index, all) => tag && all.indexOf(tag) === index)
    .slice(0, 3);
}

function safePlatformCopy(
  plan: SearchStructuredPlan,
  build: (plan: SearchStructuredPlan) => SearchPlanPlatformCopy,
  fallbackHook: string,
): SearchPlanPlatformCopy {
  try {
    const city = searchPlanShareCityName(plan);
    const copy = build(plan);
    if (copy.title.trim() && copy.hook.trim() && copy.hashtags.length > 0) return copy;
    return {
      title: `${city}慢游`,
      hook: fallbackHook,
      hashtags: uniqueTags([`${city}旅行`, '慢逛', '蜗牛旅行']),
    };
  } catch {
    const city = plan?.baseInfo?.targetCity?.trim() || '这趟';
    return {
      title: `${city}慢游`,
      hook: fallbackHook,
      hashtags: uniqueTags([`${city}旅行`, '慢逛', '蜗牛旅行']),
    };
  }
}

/** 朋友圈：生活化、温柔，给微信好友看 */
export function buildSearchPlanWechatPlatformCopy(
  plan: SearchStructuredPlan,
): SearchPlanPlatformCopy {
  return safePlatformCopy(
    plan,
    (source) => {
      const city = searchPlanShareCityName(source);
      const { days } = source.baseInfo;
      const focus = classifySearchPlanParty(source.baseInfo.peopleType);
      const place = primarySharePlace(source);
      const flags = shareSceneFlags(source, place);
      const lead = wechatLead(focus);
      const hook = wechatHook(focus, place, flags.sea);
      const mood = wechatMood(focus, flags);
      return {
        title: `${city}${days}天丨${lead}的${place}路线`,
        hook,
        hashtags: uniqueTags([`${city}旅行`, place, mood]),
      };
    },
    '沿着街巷慢慢逛，把节奏放轻，适合安静放空。',
  );
}

/** 抖音：短句、画面感，适合图文短视频 */
export function buildSearchPlanDouyinPlatformCopy(
  plan: SearchStructuredPlan,
): SearchPlanPlatformCopy {
  return safePlatformCopy(
    plan,
    (source) => {
      const city = searchPlanShareCityName(source);
      const focus = classifySearchPlanParty(source.baseInfo.peopleType);
      const place = primarySharePlace(source);
      const flags = shareSceneFlags(source, place);
      const scene = douyinScene(flags);
      const punch = douyinPunch(focus, place, flags.sunset);
      const where = flags.sea ? '海边' : place;
      const ending = douyinEnding(focus, flags.sunset);
      const visual = douyinVisual(focus, flags);
      const region = CITY_SHARE_REGION[city];
      return {
        title: `${city}小众${scene}路线！${place}${punch}真的美哭✨`,
        hook: `错峰出行避开人潮，在${where}等一场${ending}。`,
        hashtags: uniqueTags([
          `${city}旅游`,
          `${place}${visual}`,
          region ? `${region}旅游` : '城市慢游',
        ]),
      };
    },
    '错峰出行避开人潮，找一处安静的风景慢慢看。',
  );
}

export function formatSearchPlanPlatformClipboard(copy: SearchPlanPlatformCopy): string {
  const tags = copy.hashtags.map((tag) => `#${tag.replace(/^#/u, '')}`).join(' ');
  return [copy.title.trim(), copy.hook.trim(), tags].filter(Boolean).join('\n');
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
